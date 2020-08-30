<template>
  <div class="relative">

    <slot></slot>
    <StandardLights></StandardLights>
  </div>
</template>

<script>
import { RenderRoot } from '../../Core/RenderRoot'
import { Scene, Color, Mesh, BoxBufferGeometry, Vector3, MeshBasicMaterial, MeshMatcapMaterial, DoubleSide, Matrix4, Clock } from 'three'
import { PCamera } from '../../Core/PCamera'
import { loadAmmo } from './loadAmmo.js'
// import { ShaderCube } from '../../Packages/Materials/ShaderCube'
import { loadFBX } from '../../Core/loadFBX'
import { loadTexture } from '../../Core/loadTexture'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RayPlay } from '../../Core/RayPlay'
// import¿ _ from 'lodash'
// import { onEnsure } from '../../Core/O3DNode'
// import { KeyState } from './KeyState'

export default {
  mixins:[
    RenderRoot
  ],
  data () {
    return {
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
      dynamicsWorld.setGravity( new Ammo.btVector3( 0, -gravityConstant, 0 ) );
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

      let makeSquareShape = (x, y, z) => new Ammo.btBoxShape(new Ammo.btVector3(x, y, z));
      let square = makeSquareShape(25, 25, 25)

      var startTransform = new Ammo.btTransform();
      let makeFallingItem = (shape, visual, target) => {
        target = target || visual
        startTransform.setIdentity();
        startTransform.setOrigin(new Ammo.btVector3(target.position.x, target.position.y, target.position.z));
        startTransform.setRotation(new Ammo.btQuaternion(target.quaternion.x, target.quaternion.y, target.quaternion.z, target.quaternion.w))

        var mass = 1;
        var localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);

        var myMotionState = new Ammo.btDefaultMotionState(startTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        body.visual = visual
        body.updaterTarget = target || visual

        const localScale = new Ammo.btVector3(visual.scale.x, visual.scale.y, visual.scale.z)
        shape.setLocalScaling(localScale)
        Ammo.destroy(localScale)

        dynamicsWorld.addRigidBody(body);
        bodies.push(body)
      }

      let fallings = [1,2,3,4,5,6,7,8,9,10,11]
      fallings.forEach(() => {
        let mesh = new Mesh(new BoxBufferGeometry(50, 50, 50, 10, 10, 10), new MeshBasicMaterial({ wireframe: true, color: 0xff00ff }))
        mesh.position.y = 150
        mesh.position.x = (Math.random() - 0.5) * 1000.0
        mesh.position.z = (Math.random() - 0.5) * 1000.0
        this.o3d.add(mesh)
        makeFallingItem(square, mesh)
      })

      let PhysicsCharacter = require('./PhysicsCharacter.js').PhysicsCharacter
      let CamLock = require('./PhysicsCharacter.js').CamLock
      let physicsChar = new PhysicsCharacter({ Ammo, onLoop: this.onLoop, onResize: this.onLoop })
      physicsChar.done.then(() => {
        this.o3d.add(physicsChar.o3d)

        // this.onLoop(() => {
        //   this.camera.position.copy(this.o3d.position).add(new Vector3(0, 13, 13))
        // })
        new CamLock({
          target: physicsChar.o3d,
          onLoop: this.onLoop,
          camera: this.ctx.camera,
          element: this.ctx.renderer.domElement,
          onClean: this.onClean
        })

        physicsChar.body.isChar = true

        bodies.push(physicsChar.body)
        dynamicsWorld.addRigidBody(physicsChar.body)

        this.onLoop(() => {
          var deltaTime = clock.getDelta();
          dynamicsWorld.stepSimulation(deltaTime, 10);
        })

        let miniJump = new Ammo.btVector3(0, 1, 0)
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
            // // @ts-ignore
            // const ptr0 = body0[key]
            // // @ts-ignore
            // const ptr1 = body1[key]
            if ((body0.isChar && body1.isWorld)) {
              character = body0
              world = body1
            }
            if ((body1.isChar && body0.isWorld)) {
              character = body1
              world = body0
            }
            if (character && world) {
              let name = world.updaterTarget.name

              if (name === 'Cube006') {
                character.activate()
                character.applyCentralImpulse(miniJump)
              }
              // console.log(world.updaterTarget.name)
            }
          }
        })


      })

      // let makeChar = () => {
      //   let { charmover } = this.ammo
      //   var startTransform = new Ammo.btTransform();

      //   let size = {
      //     x: 13 / 2,
      //     y: 13,
      //     z: 13 / 2,
      //   }
      //   let squareCharBox = makeSquareShape(size.x, size.y, size.z)
      //   let mesh = new Mesh(new BoxBufferGeometry(size.x * 2.0, size.y * 2.0, size.z * 2.0, 10, 10, 10), new MeshBasicMaterial({ wireframe: true, color: 0xffff00 }))
      //   let targetO3 = new Object3D()
      //   // targetO3.rotation.x = Math.PI * 0.5

      //   targetO3.position.x = 0
      //   targetO3.position.y = size.y
      //   targetO3.position.z = 0

      //   targetO3.add(mesh)
      //   this.o3d.add(targetO3)

      //   startTransform.setIdentity();
      //   startTransform.setOrigin(new Ammo.btVector3(targetO3.position.x, targetO3.position.y, targetO3.position.z));
      //   startTransform.setRotation(new Ammo.btQuaternion(targetO3.quaternion.x, targetO3.quaternion.y, targetO3.quaternion.z, targetO3.quaternion.w))

      //   var shape = squareCharBox
      //   var mass = 2;
      //   var localInertia = new Ammo.btVector3(0, 0, 0);
      //   shape.calculateLocalInertia(mass, localInertia);

      //   var myMotionState = new Ammo.btDefaultMotionState(startTransform);
      //   var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
      //   var body = new Ammo.btRigidBody(rbInfo);

      //   let charControl = new KeyState({})

      //   let origin = new Ammo.btVector3(0, 0, 0)
      //   let quaternion = new Ammo.btQuaternion(0, 0, 0, 1)

      //   let velocity = new Ammo.btVector3(0, 0, 0)
      //   let angularVelocity = new Ammo.btVector3(0, 0, 0)
      //   let angularFactor = new Ammo.btVector3(0, 1, 0)

      //   body.setCcdMotionThreshold(1e-7)
      //   body.setCcdSweptSphereRadius(0.50)

      //   this.onLoop(() => {
      //     // console.table(JSON.stringify(charControl.isDown))

      //     // body.getMotionState().getWorldTransform(startTransform)
      //     // var originCopy = startTransform.getOrigin();

      //     // origin.setValue(charmover.position.x, originCopy.y(), charmover.position.z)
      //     // quaternion.setValue(charmover.quaternion.x, charmover.quaternion.y, charmover.quaternion.z, charmover.quaternion.w)
      //     // startTransform.setIdentity();
      //     // startTransform.setOrigin(origin)
      //     // startTransform.setRotation(quaternion)
      //     // body.getMotionState().setWorldTransform(startTransform)

      //     // charmover.getWorldDirection(dir)

      //     // velocity.setValue(dir.x, dir.y, dir.z)

      //     // body.setLinearVelocity(velocity)

      //     // if (charControl.isDown.forward) {
      //     //   velocity.setValue(0, 0, 3)
      //     //   body.applyCentralImpulse(velocity)
      //     // }
      //     // if (charControl.isDown.backward) {
      //     //   velocity.setValue(0, 0, -3)
      //     //   body.applyCentralImpulse(velocity)
      //     // }

      //     // if (charControl.isDown.turnLeft) {
      //     //   angularVelocity.setValue(0, 3, 0)
      //     //   body.setAngularVelocity(angularVelocity)
      //     //   body.setAngularFactor(angularFactor)
      //     // }
      //     // if (charControl.isDown.turnRight) {
      //     //   angularVelocity.setValue(0, -3, 0)
      //     //   body.setAngularVelocity(angularVelocity)
      //     //   body.setAngularFactor(angularFactor)
      //     // }

      //     // velocityFactor.setValue(charmover.position.x, charmover.position.y, charmover.position.z)
      //   })

      //   body.updaterTarget = targetO3

      //   const localScale = new Ammo.btVector3(mesh.scale.x, mesh.scale.y, mesh.scale.z)
      //   shape.setLocalScaling(localScale)
      //   Ammo.destroy(localScale)

      //   dynamicsWorld.addRigidBody(body);
      //   bodies.push(body)
      // }
      // onEnsure(() => this.ammo)
      //   .then(makeChar)

      // fbx is root
      const vertex = new Vector3()
      const btVertex = new Ammo.btVector3()
      const center = new Vector3()
      const target = new Vector3()
      const transformM4 = new Matrix4()

      let getShapeFromVisual = (visual) => {
        const originalHull = new Ammo.btConvexHullShape()
        originalHull.setMargin(margin)

        let geo = visual.geometry
        geo.computeBoundingBox()

        geo.boundingBox.getCenter(target)
        transformM4.makeTranslation(target.x, target.y, target.z)
        // const vertexCount = geo.attributes.position.array.length / 3
        if (visual.updateMatrices) {
          visual.updateMatrices()
        }

        const inverse = new Matrix4()
        const components = geo.attributes.position.array
        for (let i = 0; i < components.length; i += 3) {
          transformM4.multiplyMatrices(inverse, visual.matrixWorld)
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

        const localScale = new Ammo.btVector3(visual.scale.x, visual.scale.y, visual.scale.z)
        collisionShape.setLocalScaling(localScale)

        Ammo.destroy(localScale)

        return collisionShape
      }

      let makeRoom = async () => {
        let fbx = await loadFBX(require('file-loader!./room/factory-simple-fbx.fbx'))
        // let fbx = await loadFBX(require('file-loader!./room/space-walk.fbx'))
        let silver = await loadTexture(require('./matcap/silver.png'))

        // fbx.position.y = -236
        // fbx.position.z = 200
        this.o3d.add(fbx)

        fbx.traverse((item) => {
          if (item.isMesh) {
            this.rayplay.add(item, () => {
              console.log(item.name)
            })

            // if (this.ctx.chromaMatCap) {
            //   item.material =  this.ctx.chromaMatCap.out.material
            // } else {
            //   let shaderCube = new ShaderCube({ renderer: this.ctx.renderer, loop: this.onLoop, res: 32 })
            //   item.material = shaderCube.out.material
            // }

            // if (item.name === 'Mesh018' || item.name === 'Mesh013' || item.name === 'Mesh017') {
            //   // item.material = new MeshMatcapMaterial({ matcap: deps.silver, side: DoubleSide })
            // }

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

<style>
</style>