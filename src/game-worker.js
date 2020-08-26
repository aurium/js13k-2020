"use strict";

importScripts('shared.js')
var players, planets, sunR1, sunR2, sunR3

const sendCmd = (cmd, payload)=> postMessage([cmd, payload])

sendCmd('started') // Notify WebWorker is alive to init.

onmessage = ({data:[cmd, payload]})=> {
  log('Worker receive:', cmd, payload)
  if (cmd == 'init') {
    players = payload.players
    planets = payload.planets
    sunR1 = payload.sunR1
    sunR2 = payload.sunR2
    sunR3 = payload.sunR3
    setInterval(updateEntities, 17)
    setInterval(()=> sendCmd('update', {players, planets}), 200)
  }
}

function updateEntities() {
  players.forEach(player => {
    player.x += player.velX
    player.y += player.velY
    player.rot += player.rotInc
    if (player.fireIsOn) {
      mySelf.velX += cos(mySelf.rot)/50
      mySelf.velY += sin(mySelf.rot)/50
    }
    if (player.rotJetOnLeft && player.rotInc>-0.1) mySelf.rotInc -= 0.002
    if (player.rotJetOnRight && player.rotInc<0.1) mySelf.rotInc += 0.002
  })
  planets.forEach(planet => {
    planet.a += planet.aInc
    planet.rot += planet.rotInc
  })
}
