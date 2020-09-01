import { Vector3, Clock, Matrix4, EventDispatcher } from 'three'
import { loadAmmo } from './loadAmmo.js'

export class AmmoWorld extends EventDispatcher {
  constructor ({ onLoop, onResize, onClean, mode = 'auto' }) {
    super()
    this.onLoop = onLoop
    this.onResize = onResize
    this.onClean = onClean

    this.Ammo = false
    this.dynamicsWorld = false
    this.clock = new Clock()
    this.bodies = []
    this.margin = 0.05
    this.mode = mode
    this.done = this.setup()

    this.ready = false
    this.enableCharacterCollisionDetection = false
  }
  async waitForSetup () {
    return this.done
  }

  async setup () {
    var gravityConstant = 9.89;
    const Ammo = await loadAmmo()
    this.Ammo = Ammo

    // temp data holders
    this.btVertex = new Ammo.btVector3()
    this.vertex = new Vector3()
    this.center = new Vector3()
    this.target = new Vector3()
    this.transformM4 = new Matrix4()

    // world config
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    let broadphase = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    let dynamicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
    dynamicsWorld.setGravity( new Ammo.btVector3( 0, -gravityConstant * 25.0, 0 ) );

    this.dynamicsWorld = dynamicsWorld
    this.dispatcher = dispatcher

    var transform = new Ammo.btTransform(); // taking this out of readBulletObject reduces the leaking
    this.onLoop(() => {
      this.bodies.forEach(body => {
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

    this.onLoop(() => {
      if (this.mode === 'manual') {
        if (!this.ready) {
          return
        }
      }
      var deltaTime = this.clock.getDelta();
      dynamicsWorld.stepSimulation(deltaTime, 10);
    })

    this.onLoop(() => {
      if (!this.enableCharacterCollisionDetection) {
        return
      }
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
          console.log(character, world)
        }
      }
    })
  }

  getShapeFromMesh (mesh, rootScale = 1) {
    let { Ammo, margin, target, transformM4, vertex, btVertex, center } = this
    const originalHull = new Ammo.btConvexHullShape()
    originalHull.setMargin(margin)

    let geo = mesh.geometry
    geo.computeBoundingBox()

    geo.boundingBox.getCenter(target)
    transformM4.makeTranslation(target.x, target.y, target.z)
    if (mesh.updateMatrices) {
      mesh.updateMatrices()
    }

    const inverse = new Matrix4()
    const rawVertexData = geo.attributes.position.array
    for (let i = 0; i < rawVertexData.length; i += 3) {
      transformM4.multiplyMatrices(inverse, mesh.matrixWorld)
      vertex
        .set(rawVertexData[i], rawVertexData[i + 1], rawVertexData[i + 2])
        .applyMatrix4(transformM4)
        .sub(center)
      btVertex.setValue(vertex.x, vertex.y, vertex.z)
      originalHull.addPoint(btVertex, i === rawVertexData.length - 3)
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

    const localScale = new Ammo.btVector3(rootScale * mesh.scale.x, rootScale * mesh.scale.y, rootScale * mesh.scale.z)
    collisionShape.setLocalScaling(localScale)

    Ammo.destroy(localScale)

    return collisionShape
  }

  makeGround (shape, visual, target) {
    let { Ammo } = this

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

    this.dynamicsWorld.addRigidBody(body);
    this.bodies.push(body);

    Ammo.destroy(localInertia)
    Ammo.destroy(groundTransform)

    return body
  }
}