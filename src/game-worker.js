"use strict";

importScripts('shared.js')
var numPlayers, players = [], booms = [], missiles = [], planets, planetsAndSun, gameStarted
const sunR1 = 1040
const sunR3 = 1200
const constG = 1e-4
const shipRadius = 30
const speedLim = sqrt(7*7 + 7*7)

// TODO: add x,y to planets on update entities and remove all planets position calcs

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
    planetsAndSun = [
      { a:0, d:0, radius:sunR1 },
      ...planets
    ]
    flyArroundLobby2()
    setInterval(wwUpdateEntities, 17)
    setInterval(()=> sendCmd('update', {players, planets, booms, missiles}), upDalay)
  }
  if (cmd == 'updadeUsers') {
    players = payload
    players.forEach(p => players[p.userID] = p)
  }
  if (cmd == 'startGame') {
    gameStarted = payload
    // Creates 10 non owned missiles
    /*for (let i=0; i<10; i++) {
      let inc = PI2/10
      missiles.push({
        id: mkID(),
        x: cos(i*inc)*20e3,
        y: sin(i*inc)*20e3,
        velX: 0.1,
        velY: 0.1,
        rot: 0
      })
    }*/
  }

  const cmdPlayer = players[payload[0]]
  const cmdVal = payload[1]
  if (cmd == 'fireIsOn')
    cmdPlayer.fireIsOn = cmdVal
  if (cmd == 'rotJet') {
    cmdPlayer.rotJet = 0
    if (cmdVal < 0 && cmdPlayer.rotInc >-0.1) cmdPlayer.rotJet = cmdVal
    if (cmdVal > 0 && cmdPlayer.rotInc < 0.1) cmdPlayer.rotJet = cmdVal
  }
  if (cmd == 'misOn')
    cmdPlayer.misOn = cmdVal
}

function updateEnergy(player, qtd, canReduceLife) {
  player.energy += qtd
  if (player.energy <= 0) {
    if (canReduceLife) updateLife(player, -0.1)
    player.energy = 0
    player.fireIsOn = false
  }
  if (player.energy > 100) player.energy = 100
}

function updateLife(player, qtd) {
  player.life += qtd
  if (player.life < 0) dye(player)
  if (player.life > 100) player.life = 100
}

function dye(player) {
  player.velX = player.velY = player.life = 0
  player.alive = false
  explode(player)
  player.land = -1
}

function explode(entity) {
  const id = mkID()
  const myPlanet = planets[entity.land]
  entity = { ...entity, id, radius:0, src: entity.id||entity.userID }
  if (myPlanet) planetSpeedToEntity(myPlanet, entity)
  booms.push(entity)
  setTimeout(()=> booms = booms.filter(b=>b.id!=id), 5000)
}

function planetSpeedToEntity(planet, entity) {
  entity.velX = -sin(planet.a) * sunOrbitalSpeed(planet.d)
  entity.velY = +cos(planet.a) * sunOrbitalSpeed(planet.d)
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
    player.energy = 100
  })
}

function calcVec(vec1, vec2) {
  const deltaX = vec1.x - vec2.x
  const deltaY = vec1.y - vec2.y
  const dist = sqrt(deltaX**2 + deltaY**2)
  return [dist, -deltaX/dist, -deltaY/dist]
}

function calcVecToSun(vec) {
  return calcVec(vec, {x:0, y:0})
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
  let [dist, dirX, dirY] = calcVecToSun(player)
  let attraction = (sunR3**2*constG) / dist**1.5 // reduced pow 2 to long affect
  player.velX += attraction * dirX
  player.velY += attraction * dirY
  // Calcs planets attraction:
  planets.forEach((planet, i)=> {
    [dist, dirX, dirY] = calcVec(player, planetPos(planet))
    if (dist < (planet.radius + shipRadius)) {
      playerTouchPlanet(player, planet, i, dist, dirX, dirY)
    }
    attraction = (planet.radius**2.5*constG) / dist**2
    player.velX += attraction * dirX
    player.velY += attraction * dirY
  })
}

function playerTouchPlanet(player, planet, planetIndex, dist, dirX, dirY) {
  player.land = planetIndex
  if (calcSpeed(player.velX, player.velY) > speedLim/2) {
    dye(player)
  } else {
    let acos = Math.acos(-dirX)
    let asin = Math.asin(-dirY)
    player.a = asin > 0 ? acos : PI2 - acos
    let pushBack = planet.radius + shipRadius - dist
    player.x += -dirX * pushBack
    player.y += -dirY * pushBack
  }
}

function sunOrbitalSpeed(dist) {
  let attraction = (sunR3**2*constG) / dist**1.5 // reduced pow 2 to long affect
  return sqrt(attraction*dist)
}

function calcSpeed(velX, velY) {
  return sqrt(velX**2 + velY**2)
}

function calcAcceleration(entity) {
  let newVelX = entity.velX + cos(entity.rot)/50
  let newVelY = entity.velY + sin(entity.rot)/50
  let speed = calcSpeed(entity.velX, entity.velY)
  let newSpeed = calcSpeed(newVelX, newVelY)
  if (newSpeed > speed) {
    if (newSpeed > speedLim) {
      newVelX /= newSpeed/speedLim
      newVelY /= newSpeed/speedLim
    } else if (newSpeed > speedLim/2) {
      newVelX = (newVelX + entity.velX)/2
      newVelY = (newVelY + entity.velY)/2
    }
  }
  entity.velX = newVelX
  entity.velY = newVelY
}

function alivePlayers() {
  return players.filter(p=>p.alive)
}

var wwUpdateEntitiesTic = 0
function wwUpdateEntities() {
  wwUpdateEntitiesTic++
  alivePlayers().forEach(player => {
    updateEnergy(player, 0.05 - calcVecToSun(player)[0]/4e5, true)
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
    let myPlanet = planets[player.land]
    if (player.fireIsOn) {
      updateEnergy(player, -.05)
      if (myPlanet) planetSpeedToEntity(myPlanet, player)
      player.land = -1
      calcAcceleration(player)
      player.rotInc *= 0.995 // Helps to stabilize when accelerating.
    }
    if (player.land > -1) {
      updateLife(player, 0.02)
      let {x:planetX, y:planetY} = planetPos(myPlanet)
      let {x, y} = angleToVec(player.a, myPlanet.radius+shipRadius)
      player.x = planetX + x
      player.y = planetY + y
      player.rot = player.a
      player.a += myPlanet.rotInc
      player.rotInc = player.velX = player.velY = 0
    } else {
      player.x += player.velX
      player.y += player.velY
    }
    // Charge and launch missiles
    let missile = missiles.find(m => m.id == player.misID)
    if (player.misOn || (0 < player.misEn && player.misEn < 10)) {
      if (player.misEn < 100) {
        if (player.energy > 0.1) {
          player.energy -= 0.1
          player.misEn += 0.3
        } else {
          if (player.misEn > 0.01) player.misEn -= 0.01
        }
      }
    }
    else if (player.misEn) { // Launch!
      missile = { ...player, id: mkID(), src: player.userID }
      missiles.push(missile)
      if (myPlanet) planetSpeedToEntity(myPlanet, missile)
      missile.energy = player.misEn
      missile.velX += cos(missile.rot)*2
      missile.velY += sin(missile.rot)*2
      player.misEn = 0
    }
  })
  planets.forEach(planet => {
    planet.a += planet.aInc
    planet.rot += planet.rotInc
  })
  booms.forEach(boom => {
    boom.x += boom.velX
    boom.y += boom.velY
    boom.radius++
  })
  missiles.forEach(missile => {
    if (wwUpdateEntitiesTic%2) missileRecalc(missile)
    if (calcVecToSun(missile)[0] < sunR1) explodeMissile(missile)
    planetsAndSun.forEach(p => {
      if (calcVec(missile, planetPos(p))[0] < p.radius) {
        explodeMissile(missile)
      }
    })
    calcAcceleration(missile)
    missile.x += missile.velX
    missile.y += missile.velY
    missile.energy -= 0.02
    if (missile.energy < 0) explodeMissile(missile)
  })
}

function explodeMissile(missile) {
  explode(missile)
  missiles = missiles.filter(m => m.id != missile.id)
  players.filter(p => p.alive).forEach(player => {
    const distInvPct = 1 - calcVec(missile, player)[0]/(shipRadius*3)
    if (distInvPct > 0) {
      updateLife(player, -distInvPct*80)
      player.rotInc = (rnd()<.5?-.2:.2)
    }
  })
}

function difAngles(a1, a2) {
  let dif1 = ((a2 - a1) + PI) % PI2 - PI
  let dif2 = -((a1 - a2) + PI) % PI2 + PI
  return (abs(dif1) < abs(dif2)) ? dif1 : dif2
}

function missileRecalc(missile) {
  const {x, y, velX, velY, rot} = missile
  const [[dist, vecToTragetX, vecToTragetY], target] = players
    .filter(p => p.alive && p.userID != missile.userID)
    .map(p => [calcVec(missile, p), p])
    .sort((v1, v2)=> v1[0][0] - v2[0][0])[0] || [[]]
  if (!target) return

  const velAngle = Math.atan2(velY, velX)
  const angleToTarget = Math.atan2(vecToTragetY, vecToTragetX)
  const difMoveToTarget = difAngles(velAngle, angleToTarget)

  // Found missile displacement line function "y = a*x + b":
  const a = velY/velX
  const b = y - a*x
  const isAboveMoveLine = (a*target.x + b) < target.y
  const newRot = missile.rot + ((difMoveToTarget>0) ? .1 : -.1)
  // Smaller angle between target and missile rotation:
  const deltaAngle = abs(difAngles(rot, angleToTarget))
  // Correct movement line to intersect the center of the target:
  // (it does not helps when the target is berrind the missile)
  if (abs(difMoveToTarget)<PI/2 && deltaAngle < PI*.5) missile.rot = newRot

  // Is it pointing to target? (this is an axis rotation formula to take Y value)
  const rotPointUp = ( sin(-rot)*vecToTragetX + cos(-rot)*vecToTragetY ) < 0
  // Point to the target. It is the best driving solution when far away.
  missile.rot += rotPointUp ? -0.03 : 0.03

  planetsAndSun.forEach((planet, i)=> {
    const pos = planetPos(planet)
    const [distToPlanet, vecToPX, vecToPY] = calcVec(missile, pos)
    const angleToPlanet = Math.atan2(vecToPY, vecToPX)
    const difMoveToPlanet = difAngles(velAngle, angleToPlanet)
    if (
         abs(difMoveToPlanet)<(PI/2) && // Está na frente
         distToPlanet < 3e3          && // Próximo o sufuciente
         distToPlanet < dist         && // Mais próximo que o alvo
         abs(a*pos.x + b - pos.y) < planet.radius*1.5 // Realmente pode bater
       ) {
      //log('PLANET!', missile.userID||missile.id, difMoveToPlanet)
      missile.rot = angleToPlanet - ((difMoveToPlanet>0)?PI:-PI)/2
    }
  })

  if (
    // It is near enough and will move away, so explode now!
    (dist < shipRadius*3 && calcVec({x:x+velX, y:y+velY}, target)[0] > dist)
  ) explodeMissile(missile)
}
