"use strict";

importScripts('shared.js')
var numPlayers, players = [], planets, gameStarted
const sunR3 = 1200
const constG = 1e-4

const sendCmd = (cmd, payload)=> postMessage([cmd, payload])

sendCmd('started') // Notify WebWorker is alive to init.

// TODO: const speedLim = 7*7 + 7*7
// TODO: const curQuadSpeed = velX**2 + velY**2

onmessage = ({data:[cmd, payload]})=> {
  if (cmd == 'init') {
    numPlayers = payload.nP
    const initAngleInc = -9e4 * rnd()
    planets = payload.planets.map(p => {
      let aInc = sunOrbitalSpeed(p.d)/p.d  // translation speed
      return {
        ...p, aInc,
        rotInc: 0.005 + rnd()*0.01,
        a: p.a + aInc * initAngleInc
      }
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
  setTimeout(flyArroundLobby2, 50)
  let baseRot = (Date.now()-lobbyStart) / 9e4
  players.forEach((player, i) => {
    player.rot = baseRot + i*(2*PI/numPlayers)
    player.fireIsOn = true
    player.velX = cos(player.rot) * 2
    player.velY = sin(player.rot) * 2
    player.x = +sin(player.rot)*10e3
    player.y = -cos(player.rot)*10e3
  })
}

function calcVec(vec1, vec2) {
  const deltaX = vec1.x - vec2.x
  const deltaY = vec1.y - vec2.y
  const dist = sqrt(deltaX**2 + deltaY**2)
  return [dist, -deltaX/dist, -deltaY/dist]
}

function planetPos(planet) {
  return {
    x: cos(planet.a)*planet.d,
    y: sin(planet.a)*planet.d
  }
}

function gravitAcceleration(player) {
  // Calcs sun attraction:
  let [dist, dirX, dirY] = calcVec(player, {x:0, y:0})
  let attraction = (sunR3**2*constG) / dist**1.5 // reduced pow 2 to long affect
  player.velX += attraction * dirX
  player.velY += attraction * dirY
  // Calcs planets attraction:
  planets.forEach(planet => {
    [dist, dirX, dirY] = calcVec(player, planetPos(planet))
    attraction = (planet.radius**3*constG) / dist**2
    player.velX += attraction * dirX
    player.velY += attraction * dirY
  })
}

function sunOrbitalSpeed(dist) {
  let attraction = (sunR3**2*constG) / dist**1.5 // reduced pow 2 to long affect
  return sqrt(attraction*dist)
}

function wwUpdateEntities() {
  players.forEach(player => {
    gravitAcceleration(player)
    if (player.rotJet<0) {
      if (player.rotInc>-0.1) player.rotInc -= 0.002
      else player.rotJet = 0
    }
    if (player.rotJet>0) {
      if (player.rotInc<0.1) player.rotInc += 0.002
      else player.rotJet = 0
    }
    if (-0.002 < player.rotInc && player.rotInc < 0.002) player.rotInc = 0
    player.rot += player.rotInc
    if (player.fireIsOn) {
      player.velX += cos(player.rot)/50
      player.velY += sin(player.rot)/50
      player.rotInc *= 0.995 // Helps to stabilize when accelerating.
    }
    player.x += player.velX
    player.y += player.velY
  })
  planets.forEach(planet => {
    planet.a += planet.aInc
    planet.rot += planet.rotInc
  })
}
