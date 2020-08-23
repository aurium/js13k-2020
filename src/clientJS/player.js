class Player {

  constructor(userID) {
    this.userID = userID
    this.init()
  }

  init() {
    debug('Create Player', this.userID, this.constructor==Player?'class Player':'class UserRTCHost')
    this.isMySelf = this.userID === localStorage.userID
    if (this.isMySelf) mySelf = this
    this.x = -200 + users.length * 100
    this.y = sunR3 + 100
    this.velX = this.isMySelf ? 5 : 0
    this.velY = this.isMySelf ? 0 : 9
    this.rot = 0 // Rotation angle
    this.rotInc = 0.01
  }

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
