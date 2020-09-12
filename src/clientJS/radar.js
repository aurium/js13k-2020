"use strict";

const radarCtx = radarCanvas.getContext('2d')

const radarSize = 400
const radarMid = radarSize / 2
var radarZoom = 0.01

function updateRadar() {
  // Soft clear radar data
  const imgData = radarCtx.gID(0, 0, radarSize, radarSize)
  const pixels = imgData.data
  pixels.forEach((v,i)=> pixels[i]=(i%4==3)?v-5:v)
  radarCtx.pID(imgData, 0, 0)

  // Sum color light while drawing
  radarCtx.gCO('screen')

  // Draw sun
  if ((frameCounter%(updateRadarRate*5))==updateRadarRate) {
    radarCtx.sS('#040')
    radarCtx.lW(2)
    radarCtx.bP()
    radarCtx.moT(radarMid+sunR2*radarZoom, radarMid)
    let inc = PI/10
    for (let i=0; i<PI2; i+=inc) {
      radarCtx.moT(radarMid+cos(i)*sunR2*radarZoom, radarMid+sin(i)*sunR2*radarZoom)
      radarCtx.lT(radarMid+cos(i+inc/3)*sunR2*radarZoom, radarMid+sin(i+inc/3)*sunR2*radarZoom)
    }
    radarCtx.cP()
    radarCtx.st()
  }

  // Draw planets
  radarCtx.lW(0.6)
  radarCtx.sS('#080')
  radarCtx.bP()
  if ((frameCounter%(updateRadarRate*3))==0) planets.forEach(planet => {
    let radius = planet.radius * radarZoom * 0.8
    let x = radarMid + planet.x * radarZoom
    let y = radarMid + planet.y * radarZoom
    radarCtx.moT(x+radius, y)
    radarCtx.a(x, y, radius, 0, PI2)
  })
  radarCtx.cP()
  radarCtx.st()

  // Draw Ships
  radarCtx.lW(1.6)
  users.filter(p=>p.life).forEach(usr => {
    radarCtx.sS('#000')
    radarCtx.fS(usr.isMySelf ? '#00F' : '#D00')
    radarCtx.bP()
    //radarCtx.moT(radarMid+usr.x*radarZoom, radarMid+usr.y*radarZoom)
    radarCtx.a(radarMid+usr.x*radarZoom, radarMid+usr.y*radarZoom, 2, 0, PI2)
    radarCtx.cP()
    radarCtx.f()
    radarCtx.st()
  })

  // Draw Missiles
  missiles.forEach(missile => {
    radarCtx.fS((missile.userID==mySelf.userID) ? '#00F' : '#D00')
    radarCtx.fR(
      radarMid + missile.x * radarZoom,
      radarMid + missile.y * radarZoom,
      1.3, 1.3
    )
  })

  // Draw Boxes
  /*
  boxes.forEach(box => {
    radarCtx.fS('rgba(127,255,0,.1)')
    radarCtx.fR(
      radarMid + box.x * radarZoom,
      radarMid + box.y * radarZoom,
      1.3, 1.3
    )
  })
  */
}
