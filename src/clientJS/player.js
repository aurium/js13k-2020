"use strict";

const playerAttrsWithoutPos = [
  'ey', 'life', 'reborn',
  'velX', 'velY', 'roI', 'land',
  'misTot', 'misEn', 'fOn', 're', 'rotJet'
]
const playerAttrs = [ 'x', 'y', 'rot', ...playerAttrsWithoutPos ]

class Player {

  constructor(userID) {
    this.userID = userID
    this.init()
  }

  init() {
    debug('Create Player', this.userID, this.constructor==Player?'class Player':'class UserRTCHost')
    this.isMySelf = this.userID === localStorage.userID
    if (this.isMySelf) mySelf = this
    playerAttrs.forEach(a => this[a] = 0)
    this.x = (rnd()-.5)*8e4
    this.y = (rnd()-.5)*8e4
    this.rot = -PI*3
    this.life = 100
    this.ey = 100
    this.reborn = 3
    this.misTot = 3
    this.land = -1
  }

  disconnect() { /* placeholder only */ }

  onDisconnect() {
    if (!gameStarted) {
    }
  }

}

const UserRTCHostProto = UserRTCHost.prototype
Object.getOwnPropertyNames(Player.prototype).forEach(key => {
  if (key == 'constructor') return;
  let val = Player.prototype[key]
  debug('EXTENDING...', key, !!UserRTCHostProto[key])
  if (UserRTCHostProto[key]) {
    let origVal = UserRTCHostProto[key]
    UserRTCHostProto[key] = function(...args) {
      debug('Mixed!', key)
      origVal.apply(this, args)
      val.apply(this, args)
    }
  } else {
    UserRTCHostProto[key] = val
  }
})
