const speedLim = 5*5 + 5*5 // Where to start to arrast stars
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
const initAngleInc = 9e4 * rnd()
planets.forEach(p => {
  p.aInc = 1e4 / p.d**2  // translation speed
  p.rot = 0              // rotation angle
  p.rotInc = 0.005 + rnd()*0.01
  p.a += p.aInc * initAngleInc
})

function gameStart() {
  gameStarted = true
}

function zoomIn() {
  zoom += gameStarted ? (1-zoom*zoom)/40 + 0.001 : 0.0003
  if (zoom < 1) setTimeout(zoomIn, 40)
  else zoom = 1
}

function updateEntities() {
  users.forEach(player => {
    player.x += player.velX
    player.y += player.velY
    player.rot += player.rotInc
  })
  planets.forEach(planet => {
    planet.a += planet.aInc
    planet.rot += planet.rotInc
  })
}
setInterval(updateEntities, 17)
