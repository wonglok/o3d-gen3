<template>
  <div class="relative">
    <slot></slot>
    <StandardLights></StandardLights>

    <EventGUI v-if="game && camlocker" :game="game" :camlocker="camlocker"></EventGUI>

    <LoadingGUI></LoadingGUI>

  </div>
</template>

<script>
import { RenderRoot } from '../../Core/RenderRoot'
import { Scene, Color } from 'three'
import { PCamera } from '../../Core/PCamera'
import { RayPlay } from '../../Core/RayPlay'
import { ShaderCubeChromatics } from '../../Packages/Materials/ShaderCubeChromatics'
import { AmmoWorld } from './AmmoWorld'

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
      // dynamicsWorld: false,
      Ammo: false,
      scene: false,
      camera: false
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
    async initWASM () {

      if (window.devicePixelRatio > 1) {
        this.lowerPixel = 0.75
      }

      let ammoWorld = new AmmoWorld({
        onLoop: this.onLoop,
        onClean: this.onClean,
        onResize: this.onResize,
        element: this.element,
        mode: 'manual'
      })
      await ammoWorld.waitForSetup()
      let { Ammo } = ammoWorld

      let RoomFactory = require('./RoomFactory').RoomFactory
      let room = new RoomFactory({ ammoWorld, o3d: this.o3d })
      await room.waitForSetup()

      let birthPlace = room.birthPlace

      this.camera.position.fromArray(birthPlace)

      let chroma = new ShaderCubeChromatics({ renderer: this.ctx.renderer, onLoop: this.onLoop, res: 128, color: new Color('#ffffff') })

      let GameChar = require('./GameChar.js').GameChar
      let gameChar = new GameChar({ ammoWorld, Ammo, onLoop: this.onLoop, onResize: this.onLoop, birthPlace: birthPlace, chroma })
      this.game = gameChar

      gameChar.waitForSetup().then(() => {
        this.o3d.add(gameChar.o3d)

        let CamLock = require('./GameChar.js').CamLock
        this.camlocker = new CamLock({
          target: gameChar.o3d,
          onLoop: this.onLoop,
          camera: this.ctx.camera,
          element: this.ctx.renderer.domElement,
          onClean: this.onClean
        })

        ammoWorld.bodies.push(gameChar.body)
        ammoWorld.dynamicsWorld.addRigidBody(gameChar.body)
        ammoWorld.ready = true
      })

      let FallingObjects = require('./FallingObjects').FallingObjects
      new FallingObjects({ ammoWorld, o3d: this.o3d, chroma })
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
