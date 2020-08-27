"use strict";

var gameWorker = null
var lastWWUpdate = 0
var newPlayers = [], newPlanets = []

var startHostWebWorker = ()=> {
  startHostWebWorker = (()=>0)
  gameWorker = new Worker('game-worker.js')
  gameWorker.onmessage = ({data:[cmd, payload]})=> {
    if (cmd == 'started') initWebWorker()
    if (cmd == 'update') {
      lastWWUpdate = Date.now()
      newPlanets = payload.planets
      newPlayers = payload.players
      newPlayers.forEach(p => {
        let player = users[p.userID]
        if (player) playerAttrsWithoutPos.forEach(att => player[att] = p[att])
      })
    }
    if (cmd == 'zoom') targetZoom = payload
  }
}

function sendWWCmd(cmd, payload) {
  if (gameWorker) gameWorker.postMessage([cmd, payload])
  else notifyErr(`WebWorker is not alive`)(`Command "${cmd}" was lost.`)
}

function initWebWorker() {
  debug('WebWorker Started!')
  sendWWCmd('init', {
    nP: numPlayers || 10,
    planets: planets.map(p => ({ a:p.a, d:p.d })),
    sun: { sunR1, sunR2, sunR3 }
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
  if (lastWWUpdate == 0) return;
  var now = Date.now()
  var timeDelta = now - lastWWUpdate
  var timePct = timeDelta / upDalay
  if (timePct > 1) {
    if (DEBUG_MODE&&timePct>1.5) ('WebWorker is late! Delta time:', timeDelta)
    timePct = 1
  }
  const framesPerUpdate = FPS*upDalay/1000
  var timePctInv = 1 - timePct
  const step = FPS / (1000/upDalay)
  newPlayers.forEach(p => {
    let player = users[p.userID]
    if (player) {
      player.x   = ( player.x*step   + p.x   ) / (step+1)
      player.y   = ( player.y*step   + p.y   ) / (step+1)
      player.rot = ( player.rot*step + p.rot ) / (step+1)
    }
    else debug(`Player ${p.userID} was deleted?`)
  })
  newPlanets.forEach((p, i) => {
    let planet = planets[i]
    planet.a   = ( planet.a*step   + p.a   ) / (step+1)
    planet.rot = ( planet.rot*step + p.rot ) / (step+1)
  })

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
  //{ radius: 250, a:PI, d:2e3, r:180, g:10,  b:10,  noize:50 },

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
]

function gameStart() {
  if (gameStarted) {
    if (DEBUG_MODE) logErrToUsr('Double call gameStart()')()
    return false
  }
  sendWWCmd('startGame', true)
  gameStarted = true
  lobby.classList.add('hidden')
  bodyClass.remove('lobby2')
  bodyClass.add('game-on')

  targetZoom = 1
  targetZoomDelay = 10
  users.forEach((player) => player.fireIsOn = false )

  delayedTip(5, `You have ${mySelf.missilTot} guided missiles.`)
  delayedTip(6, `It will follow the neerest enemy.`)
  delayedTip(7, 'And its lifetime is the amount of energy you will give to it...')
  delayedTip(8, '...with a long press on the space bar.')

  delayedTip(15, 'Your people will send some aid boxes. Go get then!')

  window.addEventListener('keydown', (ev)=> {
    if (ev.key == 'ArrowUp') sendWWCmd('fireIsOn', [mySelf.userID, true])
    if (ev.key == 'ArrowLeft') sendWWCmd('rotJetLeft', [mySelf.userID, true])
    if (ev.key == 'ArrowRight') sendWWCmd('rotJetRight', [mySelf.userID, true])
  })

  window.addEventListener('keyup', (ev)=> {
    if (ev.key == 'ArrowUp') sendWWCmd('fireIsOn', [mySelf.userID, false])
    if (ev.key == 'ArrowLeft') sendWWCmd('rotJetLeft', [mySelf.userID, false])
    if (ev.key == 'ArrowRight') sendWWCmd('rotJetRight', [mySelf.userID, false])
  })
}
if (DEBUG_MODE) window.gameStart = gameStart
