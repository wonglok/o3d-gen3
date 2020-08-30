/* global Ammo */
/* eslint-disable */
export const loadAmmo = () => {
  return new Promise(resolve => {
    if (typeof Ammo === 'function') {
      // let Loader = Ammo
      Ammo().then( function ( AmmoLib ) {
        // Ammo = Loader
        resolve(AmmoLib)
      });
    } else {
      resolve(Ammo)
    }
  })
}