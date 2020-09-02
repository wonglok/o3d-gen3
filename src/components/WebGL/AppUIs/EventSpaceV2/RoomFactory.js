
import { loadFBX } from '../../Core/loadFBX'
import { loadTexture } from '../../Core/loadTexture'
import { MeshMatcapMaterial, DoubleSide } from 'three'


export class RoomFactory {
  constructor ({ addMesh, o3d }) {
    this.addMesh = addMesh
    this.o3d = o3d
    this.birthPlace = [126.0895767211914, 25, 364.65924072265625]
    this.done = this.setup()
  }
  async waitForSetup () {
    return this.done
  }
  async setup () {
    let { addMesh } = this
    let fbx = await loadFBX(require('file-loader!./room/factory-simple-fbx.fbx'))
    let silver = await loadTexture(require('./matcap/silver.png'))
    let matcapSilver = new MeshMatcapMaterial({ matcap: silver, side: DoubleSide })

    let rootScale = 1
    this.o3d.add(fbx)

    fbx.traverse((item) => {
      if (item.isMesh) {

        item.material = matcapSilver

        addMesh({ mesh: item, rootScale, mass: 0 })

        item.material.side = DoubleSide
        item.material.transparent = true
      }
    })
  }
}