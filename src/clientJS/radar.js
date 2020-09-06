"use strict";

const radarCtx = radarCanvas.getContext('2d')

const updateRadarRate = 5
const radarSize = 400
const radarMid = radarSize / 2
var radarZoom = 0.01

function updateRadar() {
  // Soft clear radar data
  const imgData = radarCtx.getImageData(0, 0, radarSize, radarSize)
  const pixels = imgData.data
  pixels.forEach((v,i)=> pixels[i]=(i%4==3)?v-5:v)
  radarCtx.putImageData(imgData, 0, 0)

  // Sum color light while drawing
  radarCtx.globalCompositeOperation = 'screen'

  // Draw sun
  if ((frameCounter%(updateRadarRate*5))==updateRadarRate) {
    radarCtx.strokeStyle = '#040'
    radarCtx.lineWidth = 2
    radarCtx.beginPath()
    radarCtx.moveTo(radarMid+sunR2*radarZoom, radarMid)
    let inc = PI/10
    for (let i=0; i<PI2; i+=inc) {
      radarCtx.moveTo(radarMid+cos(i)*sunR2*radarZoom, radarMid+sin(i)*sunR2*radarZoom)
      radarCtx.lineTo(radarMid+cos(i+inc/3)*sunR2*radarZoom, radarMid+sin(i+inc/3)*sunR2*radarZoom)
    }
    radarCtx.closePath()
    radarCtx.stroke()
  }

  // Draw planets
  radarCtx.lineWidth = 0.6
  radarCtx.strokeStyle = '#080'
  radarCtx.beginPath()
  if ((frameCounter%(updateRadarRate*3))==0) planets.forEach(planet => {
    let dist = planet.d * radarZoom
    let radius = planet.radius * radarZoom * 0.8
    let x = radarMid + cos(planet.a) * dist
    let y = radarMid + sin(planet.a) * dist
    radarCtx.moveTo(x+radius, y)
    radarCtx.arc(x, y, radius, 0, PI2)
  })
  radarCtx.closePath()
  radarCtx.stroke()

  // Draw Ships
  radarCtx.lineWidth = 1.6
  users.filter(p=>p.life).forEach(usr => {
    radarCtx.strokeStyle = '#000'
    radarCtx.fillStyle = usr.isMySelf ? '#00F' : '#D00'
    radarCtx.beginPath()
    //radarCtx.moveTo(radarMid+usr.x*radarZoom, radarMid+usr.y*radarZoom)
    radarCtx.arc(radarMid+usr.x*radarZoom, radarMid+usr.y*radarZoom, 2, 0, PI2)
    radarCtx.closePath()
    radarCtx.fill()
    radarCtx.stroke()
  })

  // Draw Missiles
  missiles.forEach(missile => {
    radarCtx.fillStyle = (missile.userID==mySelf.userID) ? '#00F' : '#D00'
    radarCtx.fillRect(
      radarMid + missile.x * radarZoom,
      radarMid + missile.y * radarZoom,
      1.3, 1.3
    )
  })
}
