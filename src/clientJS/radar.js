const radarCtx = radarCanvas.getContext('2d')

const radarSize = 400
const radarMid = radarSize / 2
var radarZoom = 0.01

function updateRadar() {
  radarCtx.clearRect(0,0,radarSize,radarSize)

  radarCtx.strokeStyle = '#0F0'
  radarCtx.beginPath()
  radarCtx.moveTo(radarMid+sunR2*radarZoom, radarMid)
  radarCtx.arc(radarMid, radarMid, sunR2*radarZoom, 0, 360)
  planets.forEach(planet => {
    let dist = planet.d * radarZoom
    let radius = planet.radius * radarZoom
    let x = radarMid + cos(planet.a) * dist
    let y = radarMid + sin(planet.a) * dist
    radarCtx.moveTo(x+radius, y)
    radarCtx.arc(x, y, radius, 0, 360)
  })
  radarCtx.closePath()
  radarCtx.stroke()
}
