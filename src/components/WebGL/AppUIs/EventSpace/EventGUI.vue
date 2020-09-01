<template>
  <div>
    <div class="touch-action-manipulation select-none absolute z-30 bottom-0 left-0 pl-5 pb-5" v-if="game">
      <div class="touch-action-manipulation select-none">
        <!-- <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border text-20 text-white bg-white" @click="showToolsBox = !showToolsBox">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/party.svg" alt="">
        </div> -->


        <div v-if="camlocker && camlocker.isMobile" class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 w-12 h-12 border-gray-100 border  text-20 text-black" :class="{ 'bg-blue-500': camlocker.gyro && camlocker.gyro.use && camlocker.mode === 'chase', 'bg-white': camlocker.gyro && !camlocker.gyro.use || !camlocker.gyro || camlocker.mode === 'follow' }" @click="camlocker.setupGYRO(); camlocker.mode = 'chase'">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/gyroscope.svg" alt="">
        </div>

        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @click="gui('key-x', true)">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/gamepad.svg" alt="">
        </div>
      </div>

      <div class="touch-action-manipulation select-none flex">
        <!-- <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border  text-20 text-white" :class="{ 'bg-blue-500': game.useGyro, 'bg-white': !game.useGyro }" @click="() => gui('toggle-gyro', {})">
          <img class="touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/gyro.svg" alt="">
        </div> -->
        <!--
        <div v-if="camlocker" class="inline-block rounded-full text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white">
          <img v-show="camlocker.mode === 'follow'"  @click="camlocker.mode = 'chase'" class=" scale-75 transform select-none  pointer-events-none" src="./img/touch.svg" alt="">
          <img v-show="camlocker.mode !== 'follow'"  @click="camlocker.mode = 'follow'" class=" scale-75 transform select-none  pointer-events-none" src="./img/camcorder.svg" alt="" />
        </div> -->
      </div>
      <div class="touch-action-manipulation select-none" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-forward', true)" @mousedown="gui('go-forward', true)"  @touchend="gui('go-forward', false)" @mouseup="gui('go-forward', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/up.svg" alt="">
        </div>
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-backward', true)" @mousedown="gui('go-backward', true)" @touchend="gui('go-backward', false)" @mouseup="gui('go-backward', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/down.svg" alt="">
        </div>
      </div>
    </div>

    <div class="touch-action-manipulation select-none  absolute z-30 bottom-0 right-0 pr-5 pb-5" v-if="game">
      <!-- <div class="touch-action-manipulation select-none flex justify-end">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border text-20 text-white bg-white" @click="goToPage()">
          <img class=" touch-action-manipulation scale-100 transform select-none  pointer-events-none" src="./img/menu.svg" alt="">
        </div>
      </div> -->

      <div class="touch-action-manipulation select-none" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('key-t', true)" @mousedown="gui('key-t', true)"  @touchend="gui('key-t', false)" @mouseup="gui('key-t', false)">
          <img v-show="game && game.moodType === 'peaceful'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/love.svg" alt="">
          <img v-show="game && game.moodType === 'fighting'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/fight1.svg" alt="">
        </div>
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('key-space', true)" @mousedown="gui('key-space', true)"  @touchend="gui('key-space', false)" @mouseup="gui('key-space', false)">
          <img v-show="game && game.moodType === 'peaceful'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/dance.svg" alt="">
          <img v-show="game && game.moodType === 'fighting'" class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/dance.svg" alt="">
        </div>
      </div>

      <div class="touch-action-manipulation select-none" v-show="game" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('turn-left', true)" @mousedown="gui('turn-left', true)"  @touchend="gui('turn-left', false)" @mouseup="gui('turn-left', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/turn-left.svg" alt="">
        </div>
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('turn-right', true)" @mousedown="gui('turn-right', true)" @touchend="gui('turn-right', false)" @mouseup="gui('turn-right', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/turn-right.svg" alt="">
        </div>
      </div>

      <!--
      <div class="touch-action-manipulation select-none" @touchstart.prevent="() => {}" @touchmove.prevent="() => {}">
        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-left', true)" @mousedown="gui('go-left', true)"  @touchend="gui('go-left', false)" @mouseup="gui('go-left', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/left.svg" alt="">
        </div>

        <div class="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" @touchstart="gui('go-right', true)" @mousedown="gui('go-right', true)" @touchend="gui('go-right', false)" @mouseup="gui('go-right', false)">
          <img class=" touch-action-manipulation scale-75 transform select-none  pointer-events-none" src="./img/right.svg" alt="">
        </div>
      </div> -->

    </div>
  </div>
</template>

<script>
export default {
  props: {
    game: {},
    camlocker: {}
  },
  methods: {
    gui (event, data) {
      this.game.dispatchEvent({ type: event, data: data })
      this.camlocker.mode = 'chase'
    }
  },
  mounted () {
    window.addEventListener('keydown', e => {
      if (e.keyCode === 88) {
        this.gui('key-x', true)
      }
    })
    window.addEventListener('keyup', e => {
      if (e.keyCode === 88) {
        this.gui('key-x', false)
      }
    })
  }
}
</script>

<style>

</style>