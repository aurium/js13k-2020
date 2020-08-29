"use strict";

const playerAttrsWithoutPos = [
  'energy', 'life', 'reborn',
  'velX', 'velY', 'rotInc',
  'missilTot', 'fireIsOn', 'rotJet'
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
    this.energy = 100
    this.reborn = 3
    this.missilTot = 3
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
