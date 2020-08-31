"use strict";

importScripts('shared.js')
var numPlayers, players = [], planets, gameStarted
const sunR3 = 1200
const constG = 1e-4
const shipRadius = 30
const speedLim = sqrt(7*7 + 7*7)

const sendCmd = (cmd, payload)=> postMessage([cmd, payload])

sendCmd('started') // Notify WebWorker is alive to init.

onmessage = ({data:[cmd, payload]})=> {
  if (cmd == 'init') {
    numPlayers = payload.nP
    const initAngleInc = -9e4 * rnd()
    planets = payload.planets.map(p => {
      let aInc = sunOrbitalSpeed(p.d)/p.d  // translation speed
      return {
        ...p, aInc,
        rotInc: 0.001 + rnd()*0.001,
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
    player.rot = baseRot + i*(PI2/numPlayers)
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
  return angleToVec(planet.a, planet.d)
}

function angleToVec(a, size=1) {
  return {
    x: cos(a)*size,
    y: sin(a)*size
  }
}

function gravitAcceleration(player) {
  if (player.land > -1) return;
  // Calcs sun attraction:
  let [dist, dirX, dirY] = calcVec(player, {x:0, y:0})
  let attraction = (sunR3**2*constG) / dist**1.5 // reduced pow 2 to long affect
  player.velX += attraction * dirX
  player.velY += attraction * dirY
  // Calcs planets attraction:
  planets.forEach((planet, i)=> {
    [dist, dirX, dirY] = calcVec(player, planetPos(planet))
    if (dist < (planet.radius + shipRadius)) {
      playerTouchPlanet(player, planet, i, dist, dirX, dirY)
    }
    attraction = (planet.radius**3*constG) / dist**2
    player.velX += attraction * dirX
    player.velY += attraction * dirY
  })
}

function playerTouchPlanet(player, planet, planetIndex, dist, dirX, dirY) {
  player.land = planetIndex
  let acos = Math.acos(-dirX)
  let asin = Math.asin(-dirY)
  player.a = asin > 0 ? acos : PI2 - acos
  let pushBack = planet.radius + shipRadius - dist
  player.x += -dirX * pushBack
  player.y += -dirY * pushBack
}

function sunOrbitalSpeed(dist) {
  let attraction = (sunR3**2*constG) / dist**1.5 // reduced pow 2 to long affect
  return sqrt(attraction*dist)
}

function calcSpeed(velX, velY) {
  return sqrt(velX**2 + velY**2)
}

function wwUpdateEntities() {
  players.forEach(player => {
    gravitAcceleration(player)
    if (player.rotJet<0) {
      if (player.rotInc>-0.1) player.rotInc -= 0.001
      else player.rotJet = 0
    }
    if (player.rotJet>0) {
      if (player.rotInc<0.1) player.rotInc += 0.001
      else player.rotJet = 0
    }
    if (-0.001 < player.rotInc && player.rotInc < 0.001) player.rotInc = 0
    player.rot += player.rotInc
    if (player.fireIsOn) {
      let launchMultiplyer = (player.land > -1) ? 15 : 1
      player.land = -1
      let newVelX = player.velX + cos(player.rot)/50 * launchMultiplyer
      let newVelY = player.velY + sin(player.rot)/50 * launchMultiplyer
      let speed = calcSpeed(player.velX, player.velY)
      let newSpeed = calcSpeed(newVelX, newVelY)
      if (newSpeed > speed) {
        if (newSpeed > speedLim) {
          newVelX /= newSpeed/speedLim
          newVelY /= newSpeed/speedLim
        } else if (newSpeed > speedLim/2) {
          newVelX = (newVelX + player.velX)/2
          newVelY = (newVelY + player.velY)/2
        }
      }
      player.velX = newVelX
      player.velY = newVelY
      player.rotInc *= 0.995 // Helps to stabilize when accelerating.
    }
    if (player.land>-1) {
      let planet = planets[player.land]
      let {x:planetX, y:planetY} = planetPos(planet)
      let {x, y} = angleToVec(player.a, planet.radius+shipRadius)
      player.x = planetX + x
      player.y = planetY + y
      player.rot = player.a
      player.a += planet.rotInc
      player.rotInc = player.velX = player.velY = 0
    } else {
      player.x += player.velX
      player.y += player.velY
    }
  })
  planets.forEach(planet => {
    planet.a += planet.aInc
    planet.rot += planet.rotInc
  })
}
