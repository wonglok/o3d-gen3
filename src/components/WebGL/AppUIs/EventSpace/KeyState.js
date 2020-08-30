export class KeyState {
  constructor () {
    let isDown = {
      isDownAny: false,
      forward: false,
      backward: false,
      left: false,
      right: false,
      turnLeft: false,
      turnRight: false,
      action1: false,
      action2: false,
      space: false,
      modd: false
    }
    this.isDown = isDown

    let btn = {
      isDownAny: false,
      lastCmd: '',
      _cmd: '',
      get cmd () {
        return btn._cmd
      },
      set cmd (v) {
        btn.lastCmd = btn._cmd
        btn._cmd = v
      },
      skip: false
    }

    var onKeyDown = async (event) => {
      isDown.isDownAny = true
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          isDown.forward = true
          break;

        case 37: // left
        case 65: // a
          isDown.left = true
          break;

        case 40: // down
        case 83: // s
          isDown.backward = true
          break;

        case 39: // right
        case 68: // d
          isDown.right = true
          break;

        case 32: // space
          isDown.space = true
          break;

        case 82: // r
          isDown.action1 = true
          break;

        case 84: // t
          isDown.action2 = true
          break;

        case 81: // q
          isDown.turnLeft = true
          break;

        case 69: // e
          isDown.turnRight = true
          break;

        case 88: // x
          // if (this.parent.mode === 'full') {
          //   toggleFightMode()
          // }
          isDown.mood = true
          break;

        default:
          break
      }

      // syncCmd()

      // if (actionKeyMap.find(e => {
      //   return e.type === 'doOnce' && e.cmd === btn.cmd
      // })) {
      //   btn.skip = true
      // } else {
      //   btn.skip = false
      // }

      // runCmd()

      // if (this.lastPlayingMove) {
      //   this.lastPlayingMove.fadeOut(0.15)
      // }
    }
    var onKeyUp = async (event) => {
      isDown.isDownAny = false
      // let skipFadeOut = false
      // let isDownCopy = JSON.parse(JSON.stringify(isDown))

      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          isDown.forward = false
          break;

        case 37: // left
        case 65: // a
          isDown.left = false
          break;

        case 40: // down
        case 83: // s
          isDown.backward = false
          break;

        case 39: // right
        case 68: // d
          isDown.right = false
          break;

        case 81: // q
          isDown.turnLeft = false
          break;

        case 69: // e
          isDown.turnRight = false
          break;

        case 82: // r
          isDown.action1 = false
          break;

        case 84: // t
          isDown.action2 = false
          break;

        case 32:
          isDown.space = false
          break;

        case 88: // x
          isDown.mood = false
          break;

          default:
            break
      }

      // syncCmd()

      // if (btn.skip) {
      //   return
      // }
      // runCmd()
    }



    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    return isDown
  }
}