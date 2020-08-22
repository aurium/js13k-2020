class Player {

  constructor(userID) {
    this.userID = userID
    this.init()
  }

  init() {
    debug('Create Player', this.userID, this.constructor==Player?'class Player':'class UserRTCHost')
    this.isMySelf = this.userID === localStorage.userID
    this.x = -200 + users.length * 100
    this.y = sunR3 + 100
    if (this.isMySelf) setInterval(()=>this.x+=5, 33)
    else setInterval(()=>this.y+=9, 33)
  }

  onDisconnect() {
    if (!gameStarted) {
      this.initPlanet.initUser = null
      this.initPlanet = null
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
