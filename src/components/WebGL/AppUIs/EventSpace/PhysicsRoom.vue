<template>
  <div class="full">
    <FastFlame></FastFlame>
  </div>
</template>

<script>
import { Scene, Color } from 'three'
import { RenderRoot } from '../../Core/RenderRoot'
import { PCamera } from '../../Core/PCamera'
export default {
  mixins:[
    RenderRoot
  ],
  data () {
    return {
      scene: false,
      camera: false
    }
  },
  methods: {
    init () {
      this.scene = new Scene()
      this.camera = new PCamera({ element: this.element, onResize: this.onResize })
      this.camera.position.z = 100

      this.scene.add(this.o3d)
      this.scene.background = new Color('#232323')
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style>
</style>