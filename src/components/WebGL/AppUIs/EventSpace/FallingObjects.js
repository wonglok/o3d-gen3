import { Mesh, MeshBasicMaterial, Color, SphereBufferGeometry } from "three";

export class FallingObjects {
  constructor ({ ammoWorld, o3d, chroma }) {
    let { dynamicsWorld, bodies, Ammo } = ammoWorld
    // let makeSquareShape = (x, y, z) => new Ammo.btBoxShape(new Ammo.btVector3(x, y, z));
    let makeSphere = (r) => new Ammo.btSphereShape(r);
    var startTransform = new Ammo.btTransform();
    let makeFallingItem = (shape, visual, target) => {
      target = target || visual
      startTransform.setIdentity();
      startTransform.setOrigin(new Ammo.btVector3(target.position.x, target.position.y, target.position.z));
      startTransform.setRotation(new Ammo.btQuaternion(target.quaternion.x, target.quaternion.y, target.quaternion.z, target.quaternion.w))

      var mass = 0.1;
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

    let dimension = 30
    // let square = makeSquareShape(dimension, dimension, dimension)
    let sphere = makeSphere(dimension)
    let fallings = [1,2,3,4,5,6,7,8,9,10,11, 12,13,14,15,16,17,18,19,20]
    fallings.forEach(() => {
      let color = new Color('#ffffff')
      // color.setHSL(i / n.length, 0.5, 0.5)
      let mesh = new Mesh(new SphereBufferGeometry(dimension, 30, 30), new MeshBasicMaterial({ wireframe: false, transparent: true, opacity: 0.85, color, envMap: chroma.out.envMap }))
      mesh.position.y = 150
      mesh.position.x = (Math.random() - 0.5) * 800.0
      mesh.position.z = (Math.random() - 0.5) * 800.0

      o3d.add(mesh)
      makeFallingItem(sphere, mesh)
    })
  }
}