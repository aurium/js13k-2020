const radarCtx = radarCanvas.getContext('2d')

const updateRadarRate = 5
const radarSize = 400
const radarMid = radarSize / 2
var radarZoom = 0.01

function updateRadar() {
  // Soft clear radar data
  const imgData = radarCtx.getImageData(0, 0, radarSize, radarSize)
  const pixels = imgData.data
  pixels.forEach((v,i)=> pixels[i]=(i%4==3)?v-2:v)
  radarCtx.putImageData(imgData, 0, 0)

  // Sum color light while drawing
  radarCtx.globalCompositeOperation = 'screen'

  // Draw sun
  if ((frameCounter%(updateRadarRate*10))==updateRadarRate) {
    radarCtx.strokeStyle = (frameCounter<=updateRadarRate) ? '#0F0' : '#040'
    radarCtx.lineWidth = 2
    radarCtx.beginPath()
    radarCtx.moveTo(radarMid+sunR2*radarZoom, radarMid)
    let inc = PI/10
    for (let i=0; i<2*PI; i+=inc) {
      radarCtx.moveTo(radarMid+cos(i)*sunR2*radarZoom, radarMid+sin(i)*sunR2*radarZoom)
      radarCtx.lineTo(radarMid+cos(i+inc/2)*sunR2*radarZoom, radarMid+sin(i+inc/2)*sunR2*radarZoom)
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
    radarCtx.arc(x, y, radius, 0, 2*PI)
  })
  radarCtx.closePath()
  radarCtx.stroke()

  // Draw Ships
  radarCtx.lineWidth = 1.6
  users.forEach(usr => {
    radarCtx.strokeStyle = '#000'
    radarCtx.fillStyle = usr.isMySelf ? '#00F' : '#F00'
    radarCtx.beginPath()
    //radarCtx.moveTo(radarMid+usr.x*radarZoom, radarMid+usr.y*radarZoom)
    radarCtx.arc(radarMid+usr.x*radarZoom, radarMid+usr.y*radarZoom, 2, 0, 2*PI)
    radarCtx.closePath()
    radarCtx.fill()
    radarCtx.stroke()
  })
}
