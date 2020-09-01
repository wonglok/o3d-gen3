import PhysicsFactoryClass from 'comlink-loader!./PhysicsAmmo.worker'
import * as Comlink from 'comlink'
import { BufferGeometry, Vector3 } from 'three'

export class PhysicsAmmoInterface {
  constructor (...props) {
    this.props = props
    this.factory = new PhysicsFactoryClass()
    this.done = this.run()
    this.meshMap = new Map()
  }
  async waitForSetup () {
    return this.done
  }
  async run () {
    this.ammoWorld = await new this.factory.AmmoWorld(...this.props)
    await this.ammoWorld.waitForSetup()

    this.subscribe((updateMap) => {
      for (let [uuid, update] of  updateMap.entries()) {
        let mesh = this.meshMap.get(uuid)
        // console.log(update.position, update.quaternion)
        mesh.position.copy(update.position)
        mesh.quaternion.copy(update.quaternion)
      }
    })
  }
  set ready (v) {
    if (this.ammoWorld) {
      this.ammoWorld.ready = v
    } else {
      setTimeout(() => {
        this.ready = v
      }, 0)
    }
  }
  getDirect () {
    return this.ammoWorld
  }
  subscribe (v) {
    this.ammoWorld.subscribe(Comlink.proxy(v))
  }
  addMesh ({ mesh, rootScale = 1, mass = 0.1 }) {
    this.meshMap.set(mesh.uuid, mesh)

    let geometry = mesh.geometry

    if (!(geometry instanceof BufferGeometry)) {
      geometry = new BufferGeometry().fromGeometry(geometry)
    }

    let attributes = geometry.attributes
    let position = attributes.position
    let array = position.array

    // console.log(mesh.uuid)
    let target = new Vector3()
    geometry.computeBoundingBox()
    geometry.boundingBox.getCenter(target)

    this.ammoWorld.addMesh({
      uuid: mesh.uuid,
      target: target.toArray(),
      position: mesh.position.toArray(),
      quaternion: mesh.quaternion.toArray(),
      matrixWorld: mesh.matrixWorld.toArray(),
      scale: mesh.scale.toArray(),
      rootScale,
      mass,
      array: Comlink.transfer(array, [array.buffer])
    })
  }
  async close () {
    if (this.ammoWorld) {
      await this.ammoWorld.close()
    }
  }
}