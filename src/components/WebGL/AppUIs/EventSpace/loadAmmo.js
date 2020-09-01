/* global Ammo */
/* eslint-disable */
export const loadAmmo = () => {
  return new Promise(resolve => {
    if (typeof Ammo === 'function') {
      // let Loader = Ammo
      Ammo({
        locateFile: () => '/ammo/ammo.wasm.wasm'
      }).then( function ( AmmoLib ) {
        // Ammo = Loader
        resolve(AmmoLib)
      });
    } else {
      resolve(Ammo)
    }
  })
}