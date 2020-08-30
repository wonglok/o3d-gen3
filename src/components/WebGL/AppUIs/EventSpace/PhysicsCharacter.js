import { AnimationMixer, Clock, LinearEncoding, Object3D, EventDispatcher, Vector3, Euler, Quaternion } from 'three'
import { loadGLTF } from "../../Core/loadGLTF"
import { getID } from '../../Core/O3DNode'
import { loadFBX } from '../../Core/loadFBX.js'
import { KeyState } from './KeyState'

export class CamLock {
  constructor ({ target, camera, onLoop, element, onClean }) {
    this._mode = 'chase'
    this.element = element
    this.camera = camera
    this.onLoop = onLoop
    this.canRun = true
    this.target = target
    this.onClean = onClean

    this.camLockPosition = new Vector3(0, 13.5 / 2, -20)

    this.onClean(() => {
      this.canRun = false
    })

    this.head = target
    target.traverse((item) => {
      // console.log(item.name)
      if (item.name === 'mixamorigHead') {
        this.head = item
      }
      if (item.name === 'mixamorigHips') {
        this.hips = item
      }
    })
    this.run()
  }
  get mode  () {
    return this._mode
  }
  set mode  (v) {
    if (this._mode !== v) {
      this.needsReload = true
    }
    this._mode = v
    return v
  }
  run () {
    let lookTarget = new Object3D()
    this.target.add(lookTarget)
    this.needsReload = true

    this.camera.position.copy(this.camLockPosition)

    // this.target.add(this.camera)

    let charLookAtTargetV3Last = new Vector3()
    let charLookAtTargetV3Temp = new Vector3()
    let charLookAtTargetV3 = new Vector3()

    let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    this.controls = new OrbitControls(this.camera, this.element)
    this.controls.enableDamping = true
    this.onClean(() => {
      this.controls.dispose()
    })

    this.onLoop(() => {
      if (!this.canRun) {
        return
      }

      if (this.mode === 'follow') {
        // this.camera.position.x = 0
        // this.camera.position.y = 0
        // this.camera.position.z = 0
        if (this.camera.userData.oldPos && this.needsReload) {
          this.needsReload = false
          this.target.remove(this.camera)
          this.camera.position.copy(this.camera.userData.oldPos)
        }

        this.controls.update()
        lookTarget.updateMatrix()
        lookTarget.updateMatrixWorld()
        lookTarget.updateWorldMatrix()
        charLookAtTargetV3.setFromMatrixPosition(lookTarget.matrixWorld)

        let diff = charLookAtTargetV3Temp.copy(charLookAtTargetV3Last).sub(charLookAtTargetV3)
        this.camera.position.sub(diff)
        let v3 = new Vector3()
        this.camera.getWorldPosition(v3)
        this.camera.userData.oldPos = v3

        charLookAtTargetV3Last.copy(charLookAtTargetV3)

        this.controls.target0.lerp(charLookAtTargetV3, 0.2)
        this.controls.target.lerp(charLookAtTargetV3, 0.2)
        this.controls.saveState()
      } else {
        this.controls.update()
        lookTarget.updateMatrix()
        lookTarget.updateMatrixWorld()
        lookTarget.updateWorldMatrix()
        charLookAtTargetV3.setFromMatrixPosition(lookTarget.matrixWorld)

        let diff = charLookAtTargetV3Temp.copy(charLookAtTargetV3Last).sub(charLookAtTargetV3)
        this.camera.position.sub(diff)
        charLookAtTargetV3Last.copy(charLookAtTargetV3)

        this.controls.target0.lerp(charLookAtTargetV3, 0.2)
        this.controls.target.lerp(charLookAtTargetV3, 0.2)
        this.controls.saveState()

        if (this.needsReload) {
          this.target.add(this.camera)

          this.camera.position.copy(this.camLockPosition)
          this.camera.lookAt(this.target.position)

          let v3 = new Vector3()
          this.camera.getWorldPosition(v3)
          this.camera.userData.oldPos = v3
        }

        // this.camera.position.lerp(charLookAtTargetV3, 0.2)
        // this.camera.position.z -= 8
        // this.camera.lookAt(this.controls.target)

        // head.add(this.camera)''
      }
    })
  }
}


export class Moves {
  constructor () {
    let controlMapper = require('./moves/controls/fbx').default

    let movesOrig = []
    let addToList = ({ mapper, type }) => {
      let arr = []
      for (let kn in mapper) {
        arr.push({
          type,
          _id: getID(),
          displayName: kn,
          actionFBX: false,
          fbx: false,
          url: mapper[kn]
        })
      }
      arr.sort((a, b) => {
        if (a.displayName > b.displayName) {
            return 1
        } else if (b.displayName > a.displayName) {
            return -1
        } else {
          return 0
        }
      })
      movesOrig = [
        ...movesOrig,
        ...arr
      ]

      return arr
    }

    addToList({ mapper: controlMapper, type: 'control' })

    return movesOrig
  }
}

export class CharActions {
  static SharedCache = new Map()
  static moves = new Moves()
  constructor ({ base }) {
    this.base = base
    this.lastPlayingMove = false
  }

  static async preload () {
    let preloadList = [
      'Mma Idle',
      'control standing idle',

      'Praying Knee',
      'Ymca Dance',

      'Hook 1',
      'Side Kick (2)',

      'jump',
      'running',
      'control jog backwards',
      'left strafe',
      'right strafe',

      'football jog forward diagonal (2)',
      'football jog forward diagonal',
      'football jog backward diagonal (2)',
      'football jog backward diagonal',

      'control turn left a bit',
      'control turn right a bit'
    ]
    let waiters = []
    for (let name of preloadList) {
      waiters.push(CharActions.preloadByName({ name }))
    }
    try {
      await Promise.all(waiters)
    } catch (e) {
      console.log(e)
    }
  }

  async setupWithMixer ({ mixer }) {
    let mmaIdle = await this.getActionByDisplayName({ name: 'Mma Idle', mixer })
    let standIdle = await this.getActionByDisplayName({ name: 'control standing idle', mixer })
    // let warmup = await this.getActionByDisplayName({ name: 'Warming Up', mixer })

    let peaceSkill1Name = 'Praying Knee'
    let peaceSkill2Name = 'Ymca Dance'

    let peaceSkillAction1 = await this.getActionByDisplayName({ name: peaceSkill1Name, mixer })
    let peaceSkillAction2 = await this.getActionByDisplayName({ name: peaceSkill2Name, mixer })

    let fightSkillAction1 = await this.getActionByDisplayName({ name: 'Hook 1', mixer })
    let fightSkillAction2 = await this.getActionByDisplayName({ name: 'Side Kick (2)', mixer })

    let jump = await this.getActionByDisplayName({ inPlace: true, name: 'jump', mixer })

    // let goingBack = await this.getActionByDisplayName({ inPlace: true, name: 'control run backwards', mixer })
    // let steppingBackFight = await this.getActionByDisplayName({ inPlace: true, name: 'control step backward fight', mixer })

    let runForward = await this.getActionByDisplayName({ inPlace: true, name: 'running', mixer })
    let runBack = await this.getActionByDisplayName({ inPlace: true, name: 'control jog backwards', mixer })
    let runLeft = await this.getActionByDisplayName({ inPlace: true, name: 'left strafe', mixer })
    let runRight = await this.getActionByDisplayName({ inPlace: true, name: 'right strafe', mixer })

    let goForwardLeft = await this.getActionByDisplayName({ inPlace: true, name: 'football jog forward diagonal (2)', mixer })
    let goForwardRight = await this.getActionByDisplayName({ inPlace: true, name: 'football jog forward diagonal', mixer })
    let goBackLeft = await this.getActionByDisplayName({ inPlace: true, name: 'football jog backward diagonal (2)', mixer })
    let goBackRight = await this.getActionByDisplayName({ inPlace: true, name: 'football jog backward diagonal', mixer })

    // let stepForward = await this.getActionByDisplayName({ inPlace: true, name: 'control go forward', mixer })
    // let stepBackward = await this.getActionByDisplayName({ inPlace: true, name: 'control go backward', mixer })
    // let stepLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control go left', mixer })
    // let stepRight = await this.getActionByDisplayName({ inPlace: true, name: 'control go right', mixer })

    let turnLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control turn left a bit', mixer })
    let turnRight = await this.getActionByDisplayName({ inPlace: true, name: 'control turn right a bit', mixer })

    let goingForward = runForward
    let goingBack = runBack
    let goingLeft = runLeft
    let goingRight = runRight

    let skillAction1 = peaceSkillAction1
    let skillAction2 = peaceSkillAction2
    // let vm = this
    let actionKeyMap = [
      {
        cmd: 'w',
        action: goingForward
      },
      {
        cmd: 'a',
        action: goingLeft
      },
      {
        cmd: 's',
        action: goingBack
      },
      {
        cmd: 'd',
        action: goingRight
      },
      {
        cmd: 'wa',
        action: goForwardLeft
      },
      {
        cmd: 'wd',
        action: goForwardRight
      },
      {
        cmd: 'sa',
        action: goBackLeft
      },
      {
        cmd: 'sd',
        action: goBackRight
      },
      {
        cmd: 'q',
        action: turnLeft
      },
      {
        cmd: 'e',
        action: turnRight
      },
      {
        cmd: 'r',
        type: 'doOnce',
        get action () {
          return skillAction1
        }
      },
      {
        cmd: 't',
        type: 'doOnce',
        get action () {
          return skillAction2
        }
      },
      {
        cmd: 'space',
        type: 'doOnce',
        get action () {
          return jump
        }
      },
      {
        cmd: 'rest',
        get action () {
          return idle
        }
      }
    ]

    let syncCmd = () => {
      if (isDown.forward && isDown.left) {
        btn.cmd = 'wa'
      } else if (isDown.forward && isDown.right) {
        btn.cmd = 'wd'
      } else if (isDown.backward && isDown.left) {
        btn.cmd = 'sa'
      } else if (isDown.backward && isDown.right) {
        btn.cmd = 'sd'
      } else if (isDown.forward) {
        btn.cmd = 'w'
      } else if (isDown.backward) {
        btn.cmd = 's'
      } else if (isDown.left) {
        btn.cmd = 'a'
      } else if (isDown.right) {
        btn.cmd = 'd'
      } else if (isDown.turnLeft) {
        btn.cmd = 'q'
      } else if (isDown.turnRight) {
        btn.cmd = 'e'
      } else if (isDown.action1) {
        btn.cmd = 'r'
      } else if (isDown.action2) {
        btn.cmd = 't'
      } else if (isDown.space) {
        btn.cmd = 'space'
      } else {
        btn.cmd = 'rest'
      }
    }

    let idle = standIdle
    mixer.stopAllAction()
    idle.repetitions = Infinity
    idle.play()

    this.base.moodType = 'peaceful'

    let toggleFightMode = () => {
      let last = idle
      if (this.base.moodType === 'fighting') {
        this.base.moodType = 'peaceful'
        idle = standIdle

        // goingLeft = runLeft
        // goingRight = runRight
        // goingBack = runBack
        // goingForward = runForward

        skillAction1 = peaceSkillAction1
        skillAction2 = peaceSkillAction2
      } else if (this.base.moodType === 'peaceful') {
        this.base.moodType = 'fighting'
        idle = mmaIdle

        // goingLeft = stepLeft
        // goingRight = stepRight
        // goingForward = stepForward
        // goingBack = stepBackward

        skillAction1 = fightSkillAction1
        skillAction2 = fightSkillAction2
      }
      mixer.stopAllAction()
      idle.crossFadeFrom(last, 0.3, true)
      idle.play()
    }

    this.base.addEventListener('toggle-fight', () => {
      toggleFightMode()
    })

    this.base.addEventListener('play-move', async (event) => {
      try {
        let { move } = event.data
        let action = await this.getActionByDisplayName({ name: move.displayName, mixer })
        mixer.stopAllAction()
        if (this.lastPlayingMove) {
          this.lastPlayingMove.fadeOut(0.3)
        }
        action.repetitions = Infinity
        action.reset().fadeIn(0.3).play()
        this.lastPlayingMove = action
      } catch (e) {
        console.log(e)
      }
    })

    // this.viewCameraMode = 'face'
    // this.dispatchEvent('play-move', { move: { displayName: 'Warming Up' }, cb: () => {} })

    let isDown = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      turnLeft: false,
      turnRight: false,
      action1: false,
      action2: false,
      space: false,
      modd: false
    }

    let btn = {
      isDownAny: false,
      lastCmd: '',
      _cmd: '',
      get cmd () {
        return btn._cmd
      },
      set cmd (v) {
        btn.lastCmd = btn._cmd
        btn._cmd = v
      },
      skip: false
    }


    let actionTimeoutID = 0
    let runCmd = () => {
      actionKeyMap.forEach((e) => {
        if (e.cmd !== btn.cmd) {
          e.action.fadeOut(0.5)
        }
      })
      let active = actionKeyMap.find(e => e.cmd === btn.cmd)
      if (active) {
        if (active.type === 'doOnce') {
          if (!active.action.isRunning()) {
            active.action.repetitions = 1
            mixer.stopAllAction()
            active.action.fadeIn(0.15).play()
            clearTimeout(actionTimeoutID)
            actionTimeoutID = setTimeout(() => {
              idle.crossFadeFrom(active.action, 0.23).play()
            }, active.action.duration * 1000 - 0.23 * 1000)
          }
        } else {
          if (!active.action.isRunning()) {
            clearTimeout(actionTimeoutID)
            mixer.stopAllAction()
            active.action.fadeIn(0.2).play()
          }
        }
      }
    }

    // let moveForward, moveLeft, moveRight, moveBackward = false
    var onKeyDown = async (event) => {
      btn.isDownAny = true
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          isDown.forward = true
          break;

        case 37: // left
        case 65: // a
          isDown.left = true
          break;

        case 40: // down
        case 83: // s
          isDown.backward = true
          break;

        case 39: // right
        case 68: // d
          isDown.right = true
          break;

        case 32: // space
          isDown.space = true
          break;

        case 82: // r
          isDown.action1 = true
          break;

        case 84: // t
          isDown.action2 = true
          break;

        case 81: // q
          isDown.turnLeft = true
          break;

        case 69: // e
          isDown.turnRight = true
          break;

        case 88: // x
          toggleFightMode()
          isDown.mood = true
          break;

        default:
          break
      }

      syncCmd()

      if (actionKeyMap.find(e => {
        return e.type === 'doOnce' && e.cmd === btn.cmd
      })) {
        btn.skip = true
      } else {
        btn.skip = false
      }

      runCmd()

      if (this.lastPlayingMove) {
        this.lastPlayingMove.fadeOut(0.15)
      }
    }

    var onKeyUp = async (event) => {
      btn.isDownAny = false
      // let skipFadeOut = false
      // let isDownCopy = JSON.parse(JSON.stringify(isDown))

      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          isDown.forward = false
          break;

        case 37: // left
        case 65: // a
          isDown.left = false
          break;

        case 40: // down
        case 83: // s
          isDown.backward = false
          break;

        case 39: // right
        case 68: // d
          isDown.right = false
          break;

        case 81: // q
          isDown.turnLeft = false
          break;

        case 69: // e
          isDown.turnRight = false
          break;

        case 82: // r
          isDown.action1 = false
          break;

        case 84: // t
          isDown.action2 = false
          break;

        case 32:
          isDown.space = false
          break;

        case 88: // x
          isDown.mood = false
          break;

          default:
            break
      }

      syncCmd()

      if (btn.skip) {
        return
      }
      runCmd()
    }

    this.base.addEventListener('go-forward', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 87 })
      } else {
        onKeyUp({ keyCode: 87 })
      }
    })

    this.base.addEventListener('go-backward', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 83 })
      } else {
        onKeyUp({ keyCode: 83 })
      }
    })

    this.base.addEventListener('go-left', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 65 })
      } else {
        onKeyUp({ keyCode: 65 })
      }
    })

    this.base.addEventListener('go-right', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 68 })
      } else {
        onKeyUp({ keyCode: 68 })
      }
    })

    this.base.addEventListener('turn-left', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 81 })
      } else {
        onKeyUp({ keyCode: 81 })
      }
    })

    this.base.addEventListener('turn-right', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 69 })
      } else {
        onKeyUp({ keyCode: 69 })
      }
    })

    this.base.addEventListener('key-r', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 82 })
      } else {
        onKeyUp({ keyCode: 82 })
      }
    })
    this.base.addEventListener('key-t', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 84 })
      } else {
        onKeyUp({ keyCode: 84 })
      }
    })

    this.base.addEventListener('key-x', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 88 })
      } else {
        onKeyUp({ keyCode: 88 })
      }
    })

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
  }
  prepAnimation ({ pose, mixer, inPlace }) {
    if ((pose && !pose.animations) || (!pose)) {
      return Promise.reject(new Error('no pose'))
    }
    return new Promise((resolve) => {
      let action = false
      pose.animations.forEach((clip) => {
        if (inPlace) {
          if (clip.tracks[0] && clip.tracks[0].name === 'mixamorigHips.position') {
            let values = clip.tracks[0].values
            for (var i = 0; i < values.length; i += 3) {
              values[i + 0] = 0
              // values[i + 1] = 0
              values[i + 2] = 0
            }
          }
        }

        action = mixer.clipAction(clip)
        action.duration = clip.duration
        action.mixer = mixer
        resolve(action)
      });
    })
  }

  async loadMoveByName ({ name }) {
    let move = CharActions.moves.find(e => e.displayName === name)
    if (!move) {
      console.log('cannot find ... ' + name)
    }
    // let moveObj = await this.loadMove(move)
    return move
  }

  async getActionByDisplayName ({ inPlace, name, mixer }) {
    let moveObj = await this.loadMoveByName({ name })
    let url = moveObj.url
    let actionFBX = await CharActions.loadFBX({ url })
    let actionObj = await this.prepAnimation({ inPlace, pose: actionFBX, mixer })
    return actionObj
  }

  static async preloadByName ({ name }) {
    let move = CharActions.moves.find(e => e.displayName === name)
    if (move) {
      return CharActions.loadFBX({ url: move.url })
    }
  }

  static async loadFBX ({ url }) {
    if (CharActions.SharedCache.has(url)) {
      return CharActions.SharedCache.get(url)
    }
    let actionFBX = await loadFBX(url)
    CharActions.SharedCache.set(url, actionFBX)
    return actionFBX
  }
}

const TWEEN = require('@tweenjs/tween.js').default

export class Mixer {
  constructor ({ base, actor }) {
    var mixer = new AnimationMixer(actor)
    let clock = new Clock()
    base.onLoop(() => {
      let dt = clock.getDelta()
      TWEEN.update()
      mixer.update(dt)
    })
    return mixer
  }
}

export class CharacterControl {
  constructor ({ base }) {
    this.base = base
    this.Ammo = base.Ammo
    this.keys = new KeyState({ base })
    this.setup()
  }
  setup () {
    let { Ammo } = this
    var startTransform = new Ammo.btTransform();

    let size = this.base.size
    let makeSquareShape = (x, y, z) => new Ammo.btBoxShape(new Ammo.btVector3(x, y, z));
    let squareCharBox = makeSquareShape(size.x, size.y, size.z)
    let targetO3 = this.base.o3d
    // targetO3.rotation.x = Math.PI * 0.5

    // let mesh = new Mesh(new BoxBufferGeometry(size.x * 2.0, size.y * 2.0, size.z * 2.0, 10, 10, 10), new MeshBasicMaterial({ wireframe: true, color: 0xffff00 }))
    // targetO3.add(mesh)
    // targetO3.position.x = 0
    targetO3.position.y = size.y + 10
    targetO3.position.fromArray(this.base.initPos)
    targetO3.rotation.y = Math.PI

    // targetO3.position.z = 0

    startTransform.setIdentity();
    startTransform.setOrigin(new Ammo.btVector3(targetO3.position.x, targetO3.position.y, targetO3.position.z));
    startTransform.setRotation(new Ammo.btQuaternion(targetO3.quaternion.x, targetO3.quaternion.y, targetO3.quaternion.z, targetO3.quaternion.w))

    var shape = squareCharBox
    var mass = 1;
    var localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);
    shape.setMargin(10)

    var myMotionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);


    let origin3 = new Ammo.btVector3(0, 0, 0)
    let quaternion = new Ammo.btQuaternion(0, 0, 0, 1)

    let velocity = new Ammo.btVector3(0, 0, 0)
    let angularVelocity = new Ammo.btVector3(0, 0, 0)
    let angularFactor = new Ammo.btVector3(0, 0, 0)
    // let linearFactor = new Ammo.btVector3(1, 1, 1)

    body.setDamping(0.98, 0.98)
    // body.setMassProps(1, new Ammo.btVector3(1, 1, 1))

    body.setCcdMotionThreshold(1e-7)
    body.setCcdSweptSphereRadius(0.50)

    // let steer = new Object3D()
    let v3 = new Vector3()
    let speed = 7
    // let qq = new Quaternion()
    this.base.onLoop(() => {
      if (this.keys.isDownAny) {
        body.activate()
      }
      // linearFactor.setValue(1, 1, 1)
      // body.setLinearFactor(linearFactor)

      angularFactor.setValue(0, 0, 0)
      body.setAngularFactor(angularFactor)

      // console.table(JSON.stringify(this.keys))

      // body.setAngularFactor(angularFactor)
      // if (this.keys.isDownAny) {
      //   body.setDamping(0.98, 0.98)
      // } else {
      //   body.setDamping(0.98, 0.98)
      // }

      // body.getMotionState().getWorldTransform(startTransform)
      // var originCopy = startTransform.getOrigin();
      // var rotCopy = startTransform.getRotation()

      // origin3.setValue(originCopy.x(), originCopy.y(), originCopy.z())
      // quaternion.setValue(rotCopy.x(), rotCopy.y(), rotCopy.z(), rotCopy.w())

      // targetO3.quaternion.copy({
      //   x: rotCopy.x(),
      //   y: rotCopy.y(),
      //   z: rotCopy.z(),
      //   w: rotCopy.w()
      // })

      // startTransform.setIdentity();
      // startTransform.setOrigin(origin3)
      // startTransform.setRotation(quaternion)
      // body.getMotionState().setWorldTransform(startTransform)

      // targetO3.getWorldDirection(dir)

      // velocity.setValue(dir.x, dir.y, dir.z)

      // body.setLinearVelocity(velocity)

      // console.log(targetO3.rotation.y)
      if (this.keys.forward) {
        v3.x = 0
        v3.y = 0
        v3.z = speed

        // let e3 = new Euler().copy(targetO3.rotation)
        // e3.y += Math.PI * 0.0
        // v3.applyEuler(e3)

        v3.applyQuaternion(targetO3.quaternion)

        velocity.setValue(v3.x, 0, v3.z)
        body.applyCentralImpulse(velocity)
      }

      if (this.keys.backward) {
        v3.x = 0
        v3.y = 0
        v3.z = -speed

        // let e3 = new Euler().copy(targetO3.rotation)
        // // e3.y += Math.PI * 1.0
        // v3.applyEuler(e3)

        v3.applyQuaternion(targetO3.quaternion)

        velocity.setValue(v3.x, 0, v3.z)
        body.applyCentralImpulse(velocity)
      }

      if (this.keys.left) {
        v3.x = speed
        v3.y = 0
        v3.z = 0

        // let flip = 1
        // console.log(Math.abs(targetO3.quaternion.w))

        // if (Math.abs(targetO3.quaternion.w) < 0.5) {
        //   flip = -1
        // }

        // let q3 = new Quaternion().copy(targetO3.quaternion)
        v3.applyQuaternion(targetO3.quaternion)

        // let e3 = new Euler().copy(targetO3.rotation)
        // e3.y += Math.PI * 0.499 * flip
        // v3.applyEuler(e3)

        velocity.setValue(v3.x, 0, v3.z)
        body.applyCentralImpulse(velocity)
      }


      if (this.keys.right) {
        v3.x = -speed
        v3.y = 0
        v3.z = 0

        // let flip = 1
        // console.log(Math.abs(targetO3.quaternion.w))

        // if (Math.abs(targetO3.quaternion.w) < 0.5) {
        //   flip = -1
        // }

        // let q3 = new Quaternion().copy(targetO3.quaternion)
        v3.applyQuaternion(targetO3.quaternion)

        // let e3 = new Euler().copy(targetO3.rotation)
        // e3.y += Math.PI * -0.499 * flip
        // v3.applyEuler(e3)

        velocity.setValue(v3.x, 0, v3.z)
        body.applyCentralImpulse(velocity)
      }

      // // if (this.keys.left) {
      // //   v3.x = 0
      // //   v3.y = 0
      // //   v3.z = 5
      // //   v3.applyEuler(new Euler(0, targetO3.rotation.y + 0.5 * Math.PI, 0, 'XYZ'))
      // //   velocity.setValue(v3.x, 0, v3.z)
      // //   body.applyCentralImpulse(velocity)
      // // }

      // // if (this.keys.right) {
      // //   v3.x = 0
      // //   v3.y = 0
      // //   v3.z = 5
      // //   v3.applyEuler(new Euler(0, targetO3.rotation.y + -0.5 * Math.PI, 0, 'XYZ'))
      // //   velocity.setValue(v3.x, 0, v3.z)
      // //   body.applyCentralImpulse(velocity)
      // // }

      // // if (this.keys.left) {
      // //   velocity.setValue(3, 0, 0)
      // //   body.applyCentralImpulse(velocity)
      // // }
      // // if (this.keys.right) {
      // //   velocity.setValue(-3, 0, 0)
      // //   body.applyCentralImpulse(velocity)
      // // }

      if (this.keys.space && !this.isJumping && !this.keys.forward && !this.keys.backward && !this.keys.left && !this.keys.right) {
        // body.setDamping(0.97, 0.97)
        this.isJumping = true
        setTimeout(() => {
          velocity.setValue(0, 130, 0)
          body.applyCentralImpulse(velocity)

          setTimeout(() => {
            this.isJumping = false
            // velocity.setValue(0, -30, 0)
            // body.applyCentralImpulse(velocity)
          }, 450)
        }, 450)
      }

      if (this.keys.turnLeft) {
        angularVelocity.setValue(0, 1.5, 0)
        body.setAngularVelocity(angularVelocity)

        angularFactor.setValue(0, 1, 0)
        body.setAngularFactor(angularFactor)

        // console.log(Math.abs(targetO3.quaternion.w))
      }
      if (this.keys.turnRight) {
        angularVelocity.setValue(0, -1.5, 0)
        body.setAngularVelocity(angularVelocity)

        angularFactor.setValue(0, 1, 0)
        body.setAngularFactor(angularFactor)

        // console.log(Math.abs(targetO3.quaternion.w))
      }

      // velocityFactor.setValue(charmover.position.x, charmover.position.y, charmover.position.z)
    })

    targetO3.userData.isChar = true
    body.updaterTarget = targetO3

    const localScale = new Ammo.btVector3(1, 1, 1)
    shape.setLocalScaling(localScale)
    Ammo.destroy(localScale)

    // dynamicsWorld.addRigidBody(body);
    // bodies.push(body)
    this.base.body = body
  }
}

export class Character {
  constructor ({ actor, base }) {
    this.Ammo = base.Ammo
    this.base = base
    this.actor = actor
    this.scale = 10

    this.mixer = new Mixer({ base, actor })
    this.bones = {}
    this.mapCharBones({ actor })
    this.setupCharTextureEncoding({ actor })
    CharActions.preload()

    this.actions = new CharActions({ base })
    this.actor.visible = false
    this.base.doneMixer = this.actions.setupWithMixer({ mixer: this.mixer })
      .then(() => {
        this.actor.rotation.x = Math.PI * -0.5
        this.actor.scale.x = this.scale
        this.actor.scale.y = this.scale
        this.actor.scale.z = this.scale
        this.actor.visible = true
      })
  }
  mapCharBones ({ actor }) {
    let getEnd = (name) => {
      name = name.replace('mixamorig1', 'mixamorig')
      name = name.replace('mixamorig2', 'mixamorig')
      name = name.replace('mixamorig3', 'mixamorig')
      name = name.replace('mixamorig4', 'mixamorig')
      name = name.replace('mixamorig5', 'mixamorig')
      name = name.replace('mixamorig6', 'mixamorig')
      name = name.replace('mixamorig7', 'mixamorig')
      name = name.replace('mixamorig8', 'mixamorig')
      name = name.replace('mixamorig', 'mixamorig')
      return name
    }

    let fixName = (item) => {
      item.name = getEnd(item.name)
      // console.log(item.name)
    }

    actor.traverse(async (item) => {
      fixName(item)

      if (item.isMesh) {
        item.frustumCulled = false
      }

      if (item.type === 'Bone') {
        this.bones[item.name] = item
      }
    })

    // console.log(this.bones)
  }

  setupCharTextureEncoding ({ actor }) {
    actor.traverse((item) => {
      if (item.isMesh) {
        if (item.material.map) {
          item.material.map.encoding = LinearEncoding
        }
        if (item.material.alphaMap) {
          item.material.alphaMap.encoding = LinearEncoding
        }
        if (item.material.metalnessMap) {
          item.material.metalnessMap.encoding = LinearEncoding
        }
        if (item.material.normalMap) {
          item.material.normalMap.encoding = LinearEncoding
        }
        if (item.material.roughnessMap) {
          item.material.roughnessMap.encoding = LinearEncoding
        }
        // item.material.toneMapped = true
        item.material.transparent = true
        item.frustumCulled = false
      }
    })
  }
}

export class PhysicsCharacter extends EventDispatcher {
  constructor ({ onLoop, onResize, Ammo }) {
    super({})
    this.size = {
      x: 13 / 2,
      y: 13,
      z: 13 / 2,
    }
    this.moodType = 'peaceful'
    this.initPos = [126.0895767211914, 100, 364.65924072265625]
    // this.initPos = [0.0, 50, 0.0]
    this.onLoop = onLoop
    this.onResize = onResize
    this.Ammo = Ammo
    this.body = false
    this.o3d = new Object3D()
    this.done = this.setup()
  }
  async setup () {
    // this.glb = await loadGLTF(require('file-loader!./char/swat.glb'))
    this.glb = await loadGLTF(require('file-loader!./char/suzie.glb'))
    this.scene = this.glb.scene
    this.scene.position.y = this.size.y * -1
    this.o3d.add(this.scene)

    this.character = new Character({ actor: this.scene, base: this })
    this.control = new CharacterControl({ base: this })
  }
}

