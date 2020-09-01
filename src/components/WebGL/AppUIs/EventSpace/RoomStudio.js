
import { loadFBX } from '../../Core/loadFBX'
import { loadTexture } from '../../Core/loadTexture'
import { MeshMatcapMaterial, DoubleSide } from 'three'


export class RoomStudio {
  constructor ({ ammoWorld, o3d }) {
    this.o3d = o3d
    this.ammoWorld = ammoWorld
    this.birthPlace = [0, 20, 0]
    this.done = this.setup()
  }
  async waitForSetup () {
    return this.done
  }
  async setup () {
    let { ammoWorld } = this
    let fbx = await loadFBX(require('file-loader!./room/cool-office.fbx'))
    let silver = await loadTexture(require('./matcap/silver.png'))
    let matcapSilver = new MeshMatcapMaterial({ matcap: silver, side: DoubleSide })

    let rootScale = 0.175
    fbx.scale.x = rootScale
    fbx.scale.y = rootScale
    fbx.scale.z = rootScale
    this.o3d.add(fbx)

    // let JumpList = [
    //   'Plane004_Plane010'
    // ]
    let ConstraintList = [
      'Cube040_Cube027',
      'Plane004_Plane010',
      'Cylinder_Cylinder001',
      'Plane003_Plane009',
      'Cube_Cube001',
      'Cube020_Cube032',

      'Cube019_Cube035',
      'Cube036_Cube038',
      'Cube006_Cube007',
      'Cube011_Cube009',
      'Cube042_Cube130',
      // 'Cylinder028_Cylinder002',
      // 'Cylinder029_Cylinder004'
    ]
    let ExcludeList =  [
      // 'Cube025_Cube113',
      // 'Cube008_Cube004',
      // 'Cube035_Cube017',
      // 'Cylinder002_Cylinder003',
      // 'Cube013_Cube020',
      // 'Cube004_Cube023',
      // 'Cylinder014_Cylinder005',
      // 'Cube039_Cube021',
      // 'Cube041_Cube016'
    ]
    let isConstraint = (item) => ((ConstraintList.includes(item.name) || item.name.indexOf('Plane') !== -1) && !ExcludeList.includes(item.name))
    let lights = []
    fbx.traverse((item) => {
      if (item.isLight) {
        lights.push(item)
      }
      if (item.isMesh) {
        // item.material = matcapSilver

        if (isConstraint(item)) {
          let shape = ammoWorld.getShapeFromMesh(item, rootScale)
          ammoWorld.makeGround(shape, item)
        } else {
          item.material = matcapSilver
        }

        item.material.side = DoubleSide
        item.material.transparent = true
      }
    })
    lights.forEach(e => {
      e.parent.remove(e)
    })
  }
}