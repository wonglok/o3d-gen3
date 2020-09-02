<template>
  <div class="full relative">
    <StandardLights></StandardLights>

    <EventGUI v-if="game && camlocker" :game="game" :camlocker="camlocker"></EventGUI>

    <LoadingGUI></LoadingGUI>
  </div>
</template>

<script>
import { RenderRoot } from '../../Core/RenderRoot'
import { Scene, Color, MeshBasicMaterial, Mesh, TorusBufferGeometry } from 'three'
import { PCamera } from '../../Core/PCamera'
import { RayPlay } from '../../Core/RayPlay'
import { PhysicsAmmoInterface } from './PhysicsAmmoInterface'
import { ShaderCubeChromatics } from '../../Packages/Materials/ShaderCubeChromatics'
export default {
  mixins:[
    RenderRoot
  ],
  data () {
    return {
      scene: false,
      camera: false,
      rayplay: false,
      ammo: false,

      game: false,
      camlocker: false
    }
  },
  methods: {
    init () {
      this.scene = new Scene()
      this.camera = new PCamera({ element: this.element, onResize: this.onResize })

      this.scene.add(this.o3d)
      this.scene.background = new Color('#232323')

      this.rayplay = new RayPlay({ mounter: this.element, onResize: this.onResize, onLoop: this.onLoop, camera: this.camera, onClean: this.onClean })
    },
    async initSystem () {
      this.ammo = new PhysicsAmmoInterface({ mode: 'manual', onLoop: this.onLoop })
      await this.ammo.waitForSetup()

      let chroma = new ShaderCubeChromatics({ renderer: this.ctx.renderer, onLoop: this.onLoop, res: 128, color: new Color('#ffffff') })

      let sphere = new TorusBufferGeometry(20, 4.1, 15, 145)
      let fallingBox = () => {
        // falling box
        let mat = new MeshBasicMaterial({ color: new Color('#ffffff'), wireframe: false, envMap: chroma.out.envMap })
        let mesh = new Mesh(sphere, mat)
        mesh.position.y = 150
        mesh.position.z = (Math.random() - 0.5) * -500
        mesh.position.x = (Math.random() - 0.5) * -500

        this.o3d.add(mesh)

        this.ammo.addMesh({
          mesh,
          mass: 0.1,
          rootScale: 1
        })
      }
      for (let i = 0; i < 10; i++) {
        fallingBox()
      }

      // let ground = () => {
      //   let geo = new BoxGeometry(1500, 1, 1500, 5, 5, 5)
      //   let mat = new MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
      //   let mesh = new Mesh(geo, mat)

      //   this.o3d.add(mesh)
      //   this.ammo.addMesh({
      //     mesh,
      //     mass: 0,
      //     rootScale: 1
      //   })
      // }
      // ground()

      let makeFactory = async () => {
        let RoomFactory = require('./RoomFactory.js').RoomFactory
        let room = new RoomFactory({ o3d: this.o3d, addMesh: v => this.ammo.addMesh(v) })
        this.camera.position.fromArray(room.birthPlace)

        await room.waitForSetup()
        // this.camera.lookAt(new Vector3().fromArray(room.birthPlace))

        makeChar({ birthPlace: room.birthPlace })
      }

      let makeChar = async ({ birthPlace }) => {
        let EventChar = require('./EventChar.js').EventChar
        let eventChar = new EventChar({
          ammo: this.ammo,
          onLoop: this.onLoop,
          onResize: this.onResize,
          birthPlace,
          chroma
        })
        this.game = eventChar

        await eventChar.waitForSetup()

        this.o3d.add(eventChar.o3d)

        let CamLock = require('./EventChar.js').CamLock
        this.camlocker = new CamLock({
          target: eventChar.o3d,
          onLoop: this.onLoop,
          camera: this.ctx.camera,
          element: this.ctx.renderer.domElement,
          onClean: this.onClean
        })

        this.ammo.ready = true
      }
      makeFactory()
    }
  },
  mounted () {
    this.init()
    this.initSystem()
  },
  beforeDestroy () {
  }
}
</script>

<style>

</style>