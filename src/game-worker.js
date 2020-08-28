"use strict";

importScripts('shared.js')
var numPlayers, players = [], planets, sunR1, sunR2, sunR3, gameStarted

const sendCmd = (cmd, payload)=> postMessage([cmd, payload])

sendCmd('started') // Notify WebWorker is alive to init.

// TODO: const speedLim = 7*7 + 7*7
// TODO: const curQuadSpeed = velX**2 + velY**2

onmessage = ({data:[cmd, payload]})=> {
  if (cmd == 'init') {
    numPlayers = payload.nP
    sunR1 = payload.sunR1
    sunR2 = payload.sunR2
    sunR3 = payload.sunR3
    planets = payload.planets
    const initAngleInc = -9e4 * rnd()
    planets.forEach(p => {
      p.aInc = 5e3 / p.d**2  // translation speed
      p.rot = 0              // rotation angle
      p.rotInc = 0.005 + rnd()*0.01
      p.a += p.aInc * initAngleInc
    })
    flyArroundLobby2()
    setInterval(wwUpdateEntities, 17)
    setInterval(()=> sendCmd('update', {players, planets}), upDalay)
  }
  if (cmd == 'updadeUsers') {
    players = payload
    players.forEach(p => players[p.userID] = p)
  }
  if (cmd == 'startGame') gameStarted = payload

  const cmdPlayer = players[payload[0]]
  const cmdVal = payload[1]
  if (cmd == 'fireIsOn')
    cmdPlayer.fireIsOn = cmdVal
  if (cmd == 'rotJet') {
    cmdPlayer.rotJet = 0
    if (cmdVal < 0 && cmdPlayer.rotInc >-0.1) cmdPlayer.rotJet = cmdVal
    if (cmdVal > 0 && cmdPlayer.rotInc < 0.1) cmdPlayer.rotJet = cmdVal
  }
}

const lobbyStart = Date.now()
function flyArroundLobby2() {
  if (gameStarted) return players.forEach(p => p.fireIsOn = false)
  setTimeout(flyArroundLobby2, 100)
  let baseRot = (Date.now()-lobbyStart) / 9e4
  players.forEach((player, i) => {
    player.rot = baseRot + i*(2*PI/numPlayers)
    player.fireIsOn = true
    player.velX = cos(player.rot) * 4
    player.velY = sin(player.rot) * 4
    player.x = +sin(player.rot)*10e3
    player.y = -cos(player.rot)*10e3
  })
}

function wwUpdateEntities() {
  players.forEach(player => {
    player.x += player.velX
    player.y += player.velY
    player.rot += player.rotInc
    if (player.fireIsOn) {
      player.velX += cos(player.rot)/50
      player.velY += sin(player.rot)/50
      player.rotInc *= 0.995 // Helps to stabilize when accelerating.
    }
    if (player.rotJet<0) {
      if (player.rotInc>-0.1) player.rotInc -= 0.002
      else player.rotJet = 0
    }
    if (player.rotJet>0) {
      if (player.rotInc<0.1) player.rotInc += 0.002
      else player.rotJet = 0
    }
    if (-0.002 < player.rotInc && player.rotInc < 0.002) player.rotInc = 0
  })
  planets.forEach(planet => {
    planet.a += planet.aInc
    planet.rot += planet.rotInc
  })
}
