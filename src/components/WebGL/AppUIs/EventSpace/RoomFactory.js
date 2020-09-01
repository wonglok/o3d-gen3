
import { loadFBX } from '../../Core/loadFBX'
import { loadTexture } from '../../Core/loadTexture'
import { MeshMatcapMaterial, DoubleSide } from 'three'


export class RoomFactory {
  constructor ({ ammoWorld, o3d }) {
    this.o3d = o3d
    this.ammoWorld = ammoWorld
    this.birthPlace = [126.0895767211914, 20, 364.65924072265625]
    this.done = this.setup()
  }
  async waitForSetup () {
    return this.done
  }
  async setup () {
    let { ammoWorld } = this
    let fbx = await loadFBX(require('file-loader!./room/factory-simple-fbx.fbx'))
    let silver = await loadTexture(require('./matcap/silver.png'))
    let matcapSilver = new MeshMatcapMaterial({ matcap: silver, side: DoubleSide })

    let rootScale = 1
    this.o3d.add(fbx)

    fbx.traverse((item) => {
      if (item.isMesh) {

        item.material = matcapSilver

        let shape = ammoWorld.getShapeFromMesh(item, rootScale)
        ammoWorld.makeGround(shape, item)

        item.material.side = DoubleSide
        item.material.transparent = true
      }
    })
  }
}