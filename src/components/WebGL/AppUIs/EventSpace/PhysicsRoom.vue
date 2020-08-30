<template>
  <div class="relative">
    <slot></slot>
    <StandardLights></StandardLights>

    <div class="touch-action-manipulation select-none absolute z-30 bottom-0 left-0 pl-5 pb-5" v-if="game">
      <div class="touch-action-manipulation select-none">
        <!-- <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border text-20 text-white bg-white" @click="showToolsBox = !showToolsBox">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/party.svg" alt="">
        </div> -->

        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @click="gui('key-x', true)">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/gamepad.svg" alt="">
        </div>
      </div>

      <div class="touch-action-manipulation select-none flex">
        <!-- <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border  text-20 text-white" :class="{ 'bg-blue-500': game.useGyro, 'bg-white': !game.useGyro }" @click="() => gui('toggle-gyro', {})">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/gyro.svg" alt="">
        </div> -->
        <!-- <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 w-12 h-12 border-gray-100 border  text-20 text-black" :class="{ 'bg-blue-500': game.useGyro, 'bg-white': !game.useGyro }" @click="() => gui('toggle-gyro', {})">
          AR
        </div>
        <div v-if="camlocker" class="inline-block rounded-full text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white">
          <img v-show="camlocker.mode === 'follow'"  @click="camlocker.mode = 'chase'" class=" scale-75 transform select-none  pointer-events-none" src="./img/touch.svg" alt="">
          <img v-show="camlocker.mode !== 'follow'"  @click="camlocker.mode = 'follow'" class=" scale-75 transform select-none  pointer-events-none" src="./img/camcorder.svg" alt="" />
        </div> -->
      </div>
      <div class="touch-action-manipulation select-none" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-forward', true)" @mousedown="gui('go-forward', true)"  @touchend="gui('go-forward', false)" @mouseup="gui('go-forward', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/up.svg" alt="">
        </div>
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-backward', true)" @mousedown="gui('go-backward', true)" @touchend="gui('go-backward', false)" @mouseup="gui('go-backward', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/down.svg" alt="">
        </div>
      </div>
    </div>

    <div class="touch-action-manipulation select-none  absolute z-30 bottom-0 right-0 pr-5 pb-5" v-if="game">
      <!-- <div class="touch-action-manipulation select-none flex justify-end">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border text-20 text-white bg-white" @click="goToPage()">
          <img class=" touch-action-manipulation scale-100 transform select-none  pointer-events-none" src="./img/menu.svg" alt="">
        </div>
      </div> -->

      <div class="touch-action-manipulation select-none" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('key-r', true)" @mousedown="gui('key-r', true)"  @touchend="gui('key-r', false)" @mouseup="gui('key-r', false)">
          <img v-show="game && game.moodType === 'peaceful'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/love.svg" alt="">
          <img v-show="game && game.moodType === 'fighting'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/fight1.svg" alt="">
        </div>
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('key-t', true)" @mousedown="gui('key-t', true)"  @touchend="gui('key-t', false)" @mouseup="gui('key-t', false)">
          <img v-show="game && game.moodType === 'peaceful'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/dance.svg" alt="">
          <img v-show="game && game.moodType === 'fighting'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/fight2.svg" alt="">
        </div>
      </div>

      <div class="touch-action-manipulation select-none" v-show="game && !game.useGyro" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('turn-left', true)" @mousedown="gui('turn-left', true)"  @touchend="gui('turn-left', false)" @mouseup="gui('turn-left', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/turn-left.svg" alt="">
        </div>
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('turn-right', true)" @mousedown="gui('turn-right', true)" @touchend="gui('turn-right', false)" @mouseup="gui('turn-right', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/turn-right.svg" alt="">
        </div>
      </div>

      <!--
      <div class="touch-action-manipulation select-none" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-left', true)" @mousedown="gui('go-left', true)"  @touchend="gui('go-left', false)" @mouseup="gui('go-left', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/left.svg" alt="">
        </div>

        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-right', true)" @mousedown="gui('go-right', true)" @touchend="gui('go-right', false)" @mouseup="gui('go-right', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/right.svg" alt="">
        </div>
      </div> -->

    </div>



  </div>
</template>

<script>
import { RenderRoot } from '../../Core/RenderRoot'
import { Scene, Color, Vector3, MeshMatcapMaterial, DoubleSide, Matrix4, Clock } from 'three'
import { PCamera } from '../../Core/PCamera'
import { loadAmmo } from './loadAmmo.js'
// import { ShaderCube } from '../../Packages/Materials/ShaderCube'
import { loadFBX } from '../../Core/loadFBX'
import { loadTexture } from '../../Core/loadTexture'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RayPlay } from '../../Core/RayPlay'
import _ from 'lodash'
// import { onEnsure } from '../../Core/O3DNode'
// import { KeyState } from './KeyState'

export default {
  mixins:[
    RenderRoot
  ],
  data () {
    return {
      camlocker: false,
      game: false,
      ammo: false,

      bodies: false,
      dynamicsWorld: false,
      Ammo: false,
      scene: false,
      camera: false
    }
  },
  methods: {
    init () {
      this.scene = new Scene()
      this.camera = new PCamera({ element: this.element, onResize: this.onResize })

      // this.camera.position.z = 100
      // this.camera.position.y = 200
      // this.camera.position.x = 300

      this.scene.add(this.o3d)
      this.scene.background = new Color('#232323')

      this.rayplay = new RayPlay({ mounter: this.element, onResize: this.onResize, onLoop: this.onLoop, camera: this.camera, onClean: this.onClean })

      // let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
      // this.controls = new OrbitControls(this.camera, this.element)
      // this.onLoop(() => {
      //   this.controls.update()
      // })
    },
    gui (event, data) {
      this.game.dispatchEvent({ type: event, data: data })
      this.$emit('on-key-gui')
    },
    async initWASM () {
      var gravityConstant = 9.89;
      let Ammo = await loadAmmo()
      this.Ammo = Ammo
      let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			let dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
			let broadphase = new Ammo.btDbvtBroadphase();
			let solver = new Ammo.btSequentialImpulseConstraintSolver();
      let dynamicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
      this.dynamicsWorld = dynamicsWorld
      dynamicsWorld.setGravity( new Ammo.btVector3( 0, -gravityConstant * 20.0, 0 ) );
      let clock = new Clock()

      let bodies = []
      this.bodies = bodies
      let margin = 0.05

      // let transformAux1 = new Ammo.btTransform();
      // let tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );

      // make falling items looks falling
      var transform = new Ammo.btTransform(); // taking this out of readBulletObject reduces the leaking
      this.onLoop(() => {
        bodies.forEach(body => {
          body.getMotionState().getWorldTransform(transform);
          var origin = transform.getOrigin();
          let pos = {
            x: origin.x(),
            y: origin.y(),
            z: origin.z()
          }
          var rotation = transform.getRotation();

          let rot = {
            x: rotation.x(),
            y: rotation.y(),
            z: rotation.z(),
            w: rotation.w()
          }
          if (body.updaterTarget) {
            body.updaterTarget.position.copy(pos)
            body.updaterTarget.quaternion.copy(rot)
          }
        })
      })

      let makeGround = (shape, visual, target) => {
        var groundTransform = new Ammo.btTransform();
        groundTransform.setIdentity();
        let v3 = new Vector3()
        let e3 = visual.quaternion
        visual.updateMatrixWorld()
        v3.setFromMatrixPosition(visual.matrixWorld)
        let groundTransformOrigin = new Ammo.btVector3(v3.x, v3.y, v3.z)
        groundTransform.setOrigin(groundTransformOrigin);
        groundTransform.setRotation(new Ammo.btQuaternion(e3.x, e3.y, e3.z, e3.w))

        // var groundShape = shape || new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50));
        // let mesh = new Mesh(new BoxBufferGeometry(100, 100, 100, 10, 10, 10), new MeshBasicMaterial({ wireframe: true, color: 0xff00ff }))
        // this.o3d.add(mesh)

        var mass = 0;
        var localInertia = new Ammo.btVector3(0, 0, 0);
        var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        body.isWorld = true

        // body.visual = visual
        body.updaterTarget = target || visual

        dynamicsWorld.addRigidBody(body);
        bodies.push(body);

        Ammo.destroy(localInertia)
        Ammo.destroy(groundTransform)

        return body
      }

      // makeGround()

      // let makeSquareShape = (x, y, z) => new Ammo.btBoxShape(new Ammo.btVector3(x, y, z));
      // let square = makeSquareShape(25, 25, 25)
      // var startTransform = new Ammo.btTransform();
      // let makeFallingItem = (shape, visual, target) => {
      //   target = target || visual
      //   startTransform.setIdentity();
      //   startTransform.setOrigin(new Ammo.btVector3(target.position.x, target.position.y, target.position.z));
      //   startTransform.setRotation(new Ammo.btQuaternion(target.quaternion.x, target.quaternion.y, target.quaternion.z, target.quaternion.w))

      //   var mass = 0.1;
      //   var localInertia = new Ammo.btVector3(0, 0, 0);
      //   shape.calculateLocalInertia(mass, localInertia);

      //   var myMotionState = new Ammo.btDefaultMotionState(startTransform);
      //   var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
      //   var body = new Ammo.btRigidBody(rbInfo);

      //   body.visual = visual
      //   body.updaterTarget = target || visual

      //   const localScale = new Ammo.btVector3(visual.scale.x, visual.scale.y, visual.scale.z)
      //   shape.setLocalScaling(localScale)
      //   Ammo.destroy(localScale)

      //   dynamicsWorld.addRigidBody(body);
      //   bodies.push(body)
      // }

      // let fallings = [1,2,3,4,5,6,7,8,9,10,11]
      // fallings.forEach(() => {
      //   let mesh = new Mesh(new BoxBufferGeometry(50, 50, 50, 10, 10, 10), new MeshBasicMaterial({ wireframe: true, color: 0xff00ff }))
      //   mesh.position.y = 150
      //   mesh.position.x = (Math.random() - 0.5) * 1000.0
      //   mesh.position.z = (Math.random() - 0.5) * 1000.0
      //   this.o3d.add(mesh)
      //   makeFallingItem(square, mesh)
      // })

      let PhysicsCharacter = require('./PhysicsCharacter.js').PhysicsCharacter
      let CamLock = require('./PhysicsCharacter.js').CamLock
      let physicsChar = new PhysicsCharacter({ Ammo, onLoop: this.onLoop, onResize: this.onLoop })
      this.game = physicsChar
      physicsChar.done.then(() => {
        this.o3d.add(physicsChar.o3d)
        // this.onLoop(() => {
        //   this.camera.position.copy(this.o3d.position).add(new Vector3(0, 13, 13))
        // })
        this.camlocker = new CamLock({
          target: physicsChar.o3d,
          onLoop: this.onLoop,
          camera: this.ctx.camera,
          element: this.ctx.renderer.domElement,
          onClean: this.onClean
        })

        this.ctx.renderer.domElement.addEventListener('touchstart', () => {
          this.camlocker.mode = 'follow'
        })
        this.ctx.renderer.domElement.addEventListener('touchmove', () => {
          this.camlocker.mode = 'follow'
        })
        this.$on('on-key-gui', () => {
          this.camlocker.mode = 'chase'
        })
        window.addEventListener('keydown', () => {
          this.camlocker.mode = 'chase'
        })

        physicsChar.body.isChar = true

        bodies.push(physicsChar.body)
        dynamicsWorld.addRigidBody(physicsChar.body)

        this.onLoop(() => {
          var deltaTime = clock.getDelta();
          dynamicsWorld.stepSimulation(deltaTime, 10);
        })

        let miniJump = new Ammo.btVector3(0, 20, 0)
        let tt = _.throttle((character) => {
          character.activate()
          character.applyCentralImpulse(miniJump)
          console.log('jump')
        }, 10)

        this.onLoop(() => {
          for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {
            const contactManifold = dispatcher.getManifoldByIndexInternal(i)
            // const key = Object.keys(contactManifold.getBody0())[0]

            // @ts-ignore
            const body0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody)
            // @ts-ignore
            const body1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody)

            // do not check collision between 2 unnamed objects
            // (fragments do not have a name, for example)
            if (body0.name === '' && body1.name === '') continue

            let character = false
            let world = false

            if ((body0.isChar && body1.isWorld)) {
              character = body0
              world = body1
            }
            if ((body1.isChar && body0.isWorld)) {
              character = body1
              world = body0
            }
            if (character && world) {
              // window.character = character
              let name = world.updaterTarget.name
              let vel = character.getLinearVelocity()
              if (name === 'Cube006' && (Math.abs(vel.y()) <= 0) && (Math.abs(vel.x()) >= 2) && (Math.abs(vel.z()) >= 2)) {
                tt(character)
              }
              // console.log(world.updaterTarget.name)
            }
          }
        })
      })

      // fbx is root
      const vertex = new Vector3()
      const btVertex = new Ammo.btVector3()
      const center = new Vector3()
      const target = new Vector3()
      const transformM4 = new Matrix4()

      let getShapeFromVisual = (fragment) => {
        const originalHull = new Ammo.btConvexHullShape()
        originalHull.setMargin(margin)

        let geo = fragment.geometry
        geo.computeBoundingBox()

        geo.boundingBox.getCenter(target)
        transformM4.makeTranslation(target.x, target.y, target.z)
        if (fragment.updateMatrices) {
          fragment.updateMatrices()
        }

        const inverse = new Matrix4()
        const components = geo.attributes.position.array
        for (let i = 0; i < components.length; i += 3) {
          transformM4.multiplyMatrices(inverse, fragment.matrixWorld)
          vertex
            .set(components[i], components[i + 1], components[i + 2])
            .applyMatrix4(transformM4)
            .sub(center)
          btVertex.setValue(vertex.x, vertex.y, vertex.z)
          originalHull.addPoint(btVertex, i === components.length - 3)
        }
        Ammo.destroy(btVertex)

        let collisionShape = originalHull
        collisionShape.type = 'hull'
        collisionShape.setMargin(margin)
        collisionShape.destroy = () => {
          for (let res of collisionShape.resources || []) {
            Ammo.destroy(res)
          }
          if (collisionShape.heightfieldData) {
            Ammo._free(collisionShape.heightfieldData)
          }
          Ammo.destroy(collisionShape)
        }
        this.onClean(() => {
          collisionShape.destroy()
        })

        const localScale = new Ammo.btVector3(fragment.scale.x, fragment.scale.y, fragment.scale.z)
        collisionShape.setLocalScaling(localScale)

        Ammo.destroy(localScale)

        return collisionShape
      }

      let makeRoom = async () => {
        let fbx = await loadFBX(require('file-loader!./room/factory-simple-fbx.fbx'))
        // let fbx = await loadFBX(require('file-loader!./room/space-walk.fbx'))
        let silver = await loadTexture(require('./matcap/silver.png'))

        this.o3d.add(fbx)

        fbx.traverse((item) => {
          if (item.isMesh) {
            // this.rayplay.add(item, () => {
            //   console.log(item.name)
            // })

            item.material = new MeshMatcapMaterial({ matcap: silver, side: DoubleSide })

            let shape = getShapeFromVisual(item)
            let visual = item
            makeGround(shape, visual)

            // item.material = new MeshMatcapMaterial({ color: 0xffff00, matcap: silver, side: DoubleSide })

            item.material.side = DoubleSide
            item.material.transparent = true
          }
        })
      }

      makeRoom()
    }
  },
  async mounted () {
    this.init()
    await this.initWASM()
  },
  beforeDestroy () {
    // if (process.env.NODE_ENV === 'development') {
    //   window.location.reload()
    // }
  }
}
</script>


<style lang="postcss">
.moves-box{
  height: 170px;
}
@screen lg {
  .moves-box{
    height: calc(100% - 250px);
  }
}
.touch-action-manipulation{
  touch-action: manipulation;
}
.bg-transp-black{
  background-color: rgba(0,0,0,0.3);
}
.bg-transp-white{
  background-color: rgba(255,255,255,0.3);
}
.touch-action-manipulation {
  touch-action: manipulation;
}
</style>
