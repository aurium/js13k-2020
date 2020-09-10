"use strict";

var gameWorker = null
var lastGameUpdate = 0
var winner, newPlayers = [], newPlanets = []
var newBooms = [], booms = []
var newBoxes = [], boxes = []
var newMissiles = [], missiles = []
var shipStatusText = body.querySelector('#shipStatus p')
var missilEnergyEl = mkEl('i', missilBar)
var userNotifyedAwayFromSun

var startHostWebWorker = ()=> {
  startHostWebWorker = (()=>0)
  gameWorker = new Worker('game-worker.js')
  gameWorker.onmessage = ({data:[cmd, payload]})=> {
    if (cmd == 'started') initWebWorker()
    if (cmd == 'update') broadcastRTC(cmd, payload)
    if (cmd == 'winner') {
      broadcastRTC(cmd, payload)
      socket.emit('gameEnd')
    }
  }
}

function distToSun(vec) {
  return sqrt(vec.x**2 + vec.y**2)
}

const initNewItem = (collection)=> (newItem)=> {
  let source = missiles.find(m => m.id == newItem.src) || users[newItem.src] || newItem
  let item = collection.find(i => i.id == newItem.id)
  if (!item) {
    if (DEBUG_MODE && !source) source = {x:0, y:0, rot:0}
    item = {...newItem, x:source.x, y:source.y, rot:source.rot}
    collection.push(item)
  }
}

function updateFromRTC(payload) {
  lastGameUpdate = Date.now()
  newBoxes = payload.boxes
  newBoxes.forEach(initNewItem(boxes))
  newBooms = payload.booms
  newBooms.forEach(initNewItem(booms))
  newMissiles = payload.missiles
  newMissiles.forEach(initNewItem(missiles))
  newPlanets = payload.planets
  newPlayers = payload.players
  newPlayers.forEach(p => {
    let player = users[p.userID]
    if (player) {
      playerAttrsWithoutPos.forEach(att => player[att] = p[att])
      if (player.lifeEl) player.lifeEl.style.width = player.life + '%'
    }
  })
  if (mySelf.energyEl) mySelf.energyEl.style.width = mySelf.energy + '%'
  let speed = (sqrt(mySelf.velX**2 + mySelf.velY**2) / speedLim) * 100
  if (speed > 99.999) speed = 99.999

  if (gameStarted) {
    if (!mySelf.life && !mySelf.reborn) {
      mySelf.lost = 1
      body.classList.add('lost')
      targetZoom = .3
    }
    else if (speed > 50) targetZoom = .7
    else if (mySelf.land > -1) targetZoom = 1.5
    else targetZoom = 1
  }
  shipStatusText.innerHTML = (mySelf.lost)
  ? `You lose. ` + (winner ? getName(winner) + ' wins!' : '')
  : `Missiles: ${mySelf.misTot} &nbsp; Lifes: ${mySelf.reborn} &nbsp; &nbsp; ${speed.toFixed(3)}% of light speed`

  if (gameStarted && distToSun(mySelf)>20e3 && !userNotifyedAwayFromSun) {
    delayedTip(0, `You are far away from Sun! Good, you can't be found on radar.`)
    delayedTip(3, `...but you can't recharge. Your life support will fail!`)
    userNotifyedAwayFromSun = 1
    setTimeout(()=> userNotifyedAwayFromSun = 0, 6e4)
  }
}

function broadcastRTC(cmd, payload) {
  users.forEach(usr => usr.send(cmd, payload))
}

function sendWWCmd(cmd, payload) {
  if (gameWorker) gameWorker.postMessage([cmd, payload])
  else {
    debug(`WebWorker not started. Retring command "${cmd}"...`)
    setTimeout(()=> sendWWCmd(cmd, payload), 100)
  }
}

function initWebWorker() {
  debug('WebWorker Started!')
  sendWWCmd('init', {
    nP: numPlayers || 10,
    planets: planets.map(p => ({ a:p.a, d:p.d, rot:p.rot, radius:p.radius })),
  })
  sendUsersToWW()
}

function sendUsersToWW() {
  sendWWCmd('updadeUsers',
    users.map(u =>
      ['userID', ...playerAttrs].reduce((m, a)=>(m[a]=u[a], m), {})
    )
  )
}

function updateEntities() {
  if (lastGameUpdate == 0) return;
  var now = Date.now()
  var timeDelta = now - lastGameUpdate
  var timePct = timeDelta / upDalay
  if (timePct > 1) {
    if (DEBUG_MODE&&timePct>1.5) debug('Host is late! Delta time:', timeDelta)
    timePct = 1
  }
  const framesPerUpdate = FPS*upDalay/1000
  const step = FPS / (1000/upDalay)
  newPlayers.forEach(p => {
    let player = users[p.userID]
    if (player) {
      player.x   = ( player.x*step   + p.x   ) / (step+1)
      player.y   = ( player.y*step   + p.y   ) / (step+1)
      player.rot = ( player.rot*step + p.rot ) / (step+1)
    }
    else debug(`Player ${getName(p)} was deleted?`)
  })
  if (mySelf.misEn) {
    missilBar.style.opacity =  1
    missilEnergyEl.style.width = mySelf.misEn + '%'
  } else {
    missilBar.style.opacity =  0
    setTimeout(()=> missilEnergyEl.style.width = 0, 500)
  }
  updateCollection(newPlanets, planets, step)
  missiles = updateCollection(newMissiles, missiles, step)
  boxes = updateCollection(newBoxes, boxes, step)
  booms = updateCollection(newBooms, booms, step)
}

function updateCollection(newCollection, collection, step) {
  newCollection.forEach((newItem, i) => {
    let item
    if (newItem.id) {
      item = collection.find(item => item.id == newItem.id)
      if (!item) {
        item = {...newItem}
        collection.push(item)
      }
    } else {
      item = collection[i]
    }
    if (DEBUG_MODE) {
      if (!item) logErrToUsr('Iten no found!', newItem.id)
      item.velX = newItem.velX
      item.velY = newItem.velY
    }
    item.userID = newItem.userID
    ;['x','y','radius','a','rot','go'].forEach(att =>
      item[att] = ( item[att]*step + newItem[att] ) / (step+1)
    )
  })
  // Clean old itens:
  return collection.filter(item => newCollection.find(newI=>item.id==newI.id))
}

const sunR1 = 1040
const sunR2 = 1120
const sunR3 = 1200
const planets = [
/* radius: planet size/2
   a: rotation angle
   d: distance
   rotInc: rotation speed
   r,g,b: color
   noize: texture
*/
  { radius: 200, a:0,  d:2e3, r:80,  g:80,  b:80,  noize:30 },

  { radius: 300, a:0,  d:4e3, r:100, g:50,  b:30,  noize:30 },
  { radius: 400, a:PI, d:4e3, r:150, g:80,  b:130, noize:30 },

  { radius: 350, a:0     , d:8e3, r:0,   g:80,  b:200, noize:30 },
  { radius: 450, a:PI*.66, d:8e3, r:30,  g:100, b:0,   noize:50 },
  { radius: 350, a:PI*1.3, d:8e3, r:180, g:60,  b:60,  noize:10 },

  { radius: 800, a:0    , d:12e3, r:0,   g:40,  b:220, noize:20 },
  { radius: 700, a:PI*.9, d:12e3, r:160, g:140, b:40,  noize:30 },

  { radius: 300, a:0    , d:16e3, r:120,  g:120,  b:120, noize:10 },
  { radius: 200, a:PI/2 , d:16e3, r:100,  g:80,   b:50,  noize:50 },
  { radius: 300, a:PI   , d:16e3, r:120,  g:120,  b:100, noize:30 },
  { radius: 200, a:PI*1.6,d:16e3, r:120,  g:50,   b:100, noize:50 },
].map(p=>({...p, rot:0}))

function gameStart() {
  if (gameStarted) {
    if (DEBUG_MODE) logErrToUsr('Double call gameStart()')()
    return false
  }
  //socket.emit('gameStart')
  // Prepare Ship Status Display:
  users.forEach(p => {
    if (p != mySelf) {
      let enemyEl = mkEl('a', enemyLife, getName(p))
      let div = mkEl('div', enemyEl)
      let lifeEl = mkEl('i', div)
      p.lifeEl = lifeEl
    }
  })
  mySelf.lifeEl = body.querySelector('#shipLife i')
  mySelf.energyEl = body.querySelector('#shipEnergy i')

  if (isRoomOwner) sendWWCmd('startGame', true)
  gameStarted = true
  lobby.classList.add('hidden')
  bodyClass.remove('lobby2')
  bodyClass.add('game-on')

  targetZoom = 1
  targetZoomDelay = 10
  users.forEach((player) => player.fireIsOn = 0 )

  delayedTip(6, `Controls take time to take effect. Be cautious.`)

  delayedTip(10, `You have ${mySelf.misTot} guided missiles.`)
  delayedTip(11, `It will follow the neerest enemy.`)
  delayedTip(12, 'And its lifetime is the amount of energy you will give to it...')
  delayedTip(13, '...with a long press on the space bar.')

  delayedTip(20, 'Your people will send some aid boxes. Go get then!')

  delayedTip(30, 'In space, lack of friction is your worst enemy.')
  delayedTip(31, 'Use the down arrow to brake and facilitate maneuvers.')

  delayedTip(60, 'You can land a planet to auto-fix damages in your ship.')

  window.addEventListener('keydown', (ev)=> {
    if (ev.key == 'ArrowUp') clentRTC.send('fireIsOn',  mySelf.fireIsOn = 1)
    if (ev.key == 'ArrowDown') clentRTC.send('re',      mySelf.re = 1)
    if (ev.key == 'ArrowLeft') clentRTC.send('rotJet',  mySelf.rotJet = -1)
    if (ev.key == 'ArrowRight') clentRTC.send('rotJet', mySelf.rotJet = +1)
    if (ev.key == ' ') clentRTC.send('misOn', 1) // Add energy to Missile
  })

  window.addEventListener('keyup', (ev)=> {
    if (ev.key == 'ArrowUp') clentRTC.send('fireIsOn', 0)
    if (ev.key == 'ArrowDown') clentRTC.send('re', 0)
    if (ev.key == 'ArrowLeft') clentRTC.send('rotJet', 0)
    if (ev.key == 'ArrowRight') clentRTC.send('rotJet', 0)
    if (ev.key == ' ') clentRTC.send('misOn', 0) // Launch the missile
  })
}
if (DEBUG_MODE) window.gameStart = gameStart
