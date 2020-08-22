"use strict";

/*
Notes:
Max Speed must give 5.5 px per frame
*/

const baseRndSeed = parseInt(Date.now().toString().replace(/0/g,''))


var FORCE_QUALITY = false
if (queryString.match(/.*\bquality=([0-9]).*/)) {
  FORCE_QUALITY = queryString.replace(/.*\bquality=([0-9]).*/, '$1')
  if (FORCE_QUALITY && Object.values(QUALITY).indexOf(parseInt(FORCE_QUALITY))==-1) {
    alert(
      `⚠️ Bad qualit parameter (${FORCE_QUALITY}) ⚠️\n\n` +
      'The valid quality values are:\n' +
      Object.entries(QUALITY).map(([k,v])=>`   ${v} - ${k}`).join('\n')
    )
  }
  FORCE_QUALITY = parseInt(FORCE_QUALITY)
}

var gameCtx = null
var winW = window.innerWidth
var winH = window.innerHeight
var divScreen = 1
var FPS = 30
var stars1 = [], stars2 = [], stars3 = []
// Speed Limits are the speed module power 2

function setQuality(newQuality, msg='', force) {
  if (FORCE_QUALITY) newQuality = FORCE_QUALITY
  //if (force) notify('Force screen reset')
  if (quality !== newQuality || force) {
    let name = Object.entries(QUALITY).find(([k,v])=> v === newQuality)[0]
    if (quality !== 0 && quality < newQuality) {
      notify(msg+` Great! Render quality up to "${name.toLowerCase()}".`)
    }
    if (quality !== 0 && quality > newQuality) {
      notify(msg+` Render quality down to "${name.toLowerCase()}".`)
    }
    quality = newQuality
    divScreen = 5 - quality
    debug(`Current render quality: ${name} (${quality})`)
    debug(`Divide screen by: ${divScreen}`)

    winW = round(window.innerWidth/divScreen)
    winH = round(window.innerHeight/divScreen)

    gameCanvas.width = winW
    gameCanvas.height = winH

    gameCtx = gameCanvas.getContext('2d')
    gameCtx.fillStyle = '#000'
    gameCtx.fillRect(0, 0, winW, winH)

    canvBG1Speed.width = canvBG2Speed.width = canvBG4Speed.width =
    canvBG1.width = canvBG2.width = canvBG4.width = round(winW/3)*2
    canvBG1Speed.height = canvBG2Speed.height = canvBG4Speed.height =
    canvBG1.height = canvBG2.height = canvBG4.height = round(winH/3)*2
    debug('Create BG 1 (stars)')
    drawStars(canvBG1, canvBG1Speed, stars1, 7)
    debug('Create BG 2 (stars)')
    drawStars(canvBG2, canvBG2Speed, stars2, 5)
    debug('Create BG 4 (stars)')
    drawStars(canvBG4, canvBG4Speed, stars3, 2)
    if (DEBUG_MODE) {
      canvBG1.getContext('2d').fillStyle = 'green'
      canvBG1.getContext('2d').fillText('Stars 1', 50, 50)
      canvBG2.getContext('2d').fillStyle = 'green'
      canvBG2.getContext('2d').fillText('Stars 2', 50, 50)
      canvBG4.getContext('2d').fillStyle = 'green'
      canvBG4.getContext('2d').fillText('Stars 3', 50, 50)
      canvBG1Speed.getContext('2d').fillStyle = 'green'
      canvBG1Speed.getContext('2d').fillText('S 1', 50, 50)
      canvBG2Speed.getContext('2d').fillStyle = 'green'
      canvBG2Speed.getContext('2d').fillText('S 2', 50, 50)
      canvBG4Speed.getContext('2d').fillStyle = 'green'
      canvBG4Speed.getContext('2d').fillText('S 3', 50, 50)
    }
  }
}
window.setQuality = setQuality // DEBUG

window.addEventListener('resize', ()=> setQuality(quality, '', true))

var hideMouseTimeout = null
body.addEventListener('mousemove', ()=> {
  body.classList.add('mouse-alive')
  clearTimeout(hideMouseTimeout)
  hideMouseTimeout = setTimeout(()=> body.classList.remove('mouse-alive'), 1000)
})

if (navigator.userAgent.match(/Firefox\//)) document.body.classList.add('firefox')

function plotPix(pixelsArr, w, x,y, r,g,b,a) {
  let pos = (y*w + x) * 4
  pixelsArr[pos+0] = r
  pixelsArr[pos+1] = g
  pixelsArr[pos+2] = b
  pixelsArr[pos+3] = a
}

function plotBgTile(canvas, tileX, tileY, scale) {
  let w = canvas.width
  let h = canvas.height
  let ws = w * scale
  let hs = h * scale
  tileX /= divScreen
  tileY /= divScreen
  tileX %= ws; if (tileX > 0) tileX -= ws
  tileY %= hs; if (tileY > 0) tileY -= hs
  for (let x = tileX; x < winW; x += ws) {
    for (let y = tileY; y < winH; y += hs) {
      gameCtx.drawImage(canvas, 0, 0, w, h, x, y, ws, hs)
    }
  }
}

function updateBg(x, y) {
  const curQuadSpeed = pSpeedX**2 + pSpeedY**2
  const itsFast = curQuadSpeed > speedLim

  if (itsFast) {
    // Reduce in one point the color light, to slow clear old frames:
    gameCtx.globalCompositeOperation = 'difference'
    gameCtx.fillStyle = `#010101`
    gameCtx.fillRect(0, 0, winW, winH)
  } else {
    // Instant clear old frame:
    gameCtx.globalCompositeOperation = 'source-over'
    gameCtx.fillStyle = `#000`
    gameCtx.fillRect(0, 0, winW, winH)
  }

  // Plot level 3 stars
  gameCtx.globalCompositeOperation = 'screen'
  plotBgTile(itsFast ? canvBG4Speed : canvBG4, -x/7, -y/7, 1)

  // Plot Nebulas
  gameCtx.globalCompositeOperation = 'lighten'
  const nebula = itsFast ? canvBG3Speed : canvBG3
  plotBgTile(nebula, -(x+9000)/5, -(y+7000)/5, 2/divScreen)

  // Plot level 2 stars
  gameCtx.globalCompositeOperation = 'screen'
  plotBgTile(itsFast ? canvBG2Speed : canvBG2, -x/3, -y/3, 1)

  // Plot level 1 stars
  const cBG1 = itsFast ? canvBG1Speed : canvBG1
  plotBgTile(cBG1, -x/2, -y/2, 1)
  if (curQuadSpeed>speedLim) plotBgTile(cBG1, (-x+pSpeedX/2)/2, (-y+pSpeedY/2)/2, 1)

  //debug({pSpeedX, pSpeedY, itsFast})
}

function relativeObjPos({x, y}) {
  return [
    winW/2 + (x-playerX)*zoom / divScreen,
    winH/2 + (y-playerY)*zoom / divScreen
  ]
}

function bright(colorCompo, mult=3) {
  colorCompo *= mult
  return colorCompo > 255 ? 255 : colorCompo
}


var frameCounter = 0
var fpsDelay = 0
var lastUpdate = Date.now()
var alertFPS = 0
const framesToCompute = 10 // number of frames between FPS calculation
function updateGameCanvas() {
  window.requestAnimationFrame(updateGameCanvas)
  //setTimeout(updateGameCanvas, 500)
  frameCounter++
  updateBg(playerX, playerY)
  gameCtx.globalCompositeOperation = 'source-over'
  updateSun()
  gameCtx.globalCompositeOperation = 'source-over'
  planets.forEach(plotPlanet)
  if ((frameCounter%updateRadarRate)==0) updateRadar()
  if (frameCounter%framesToCompute === 0) {
    let delay = Date.now() - lastUpdate
    FPS = round(framesToCompute*1000/delay)
    fps.innerText = 'FPS: ' + FPS
    if (FPS > 33) {
      alertFPS++
    } else if (FPS < 20) {
      alertFPS--
      if (FPS < 12) alertFPS -= 5
    } else {
      alertFPS /= 2
    }
    lastUpdate = Date.now()
    if (alertFPS < -2) {
      if (gameStarted && quality > 1) setQuality(quality - 1, 'Low FPS.')
      alertFPS = 0
    }
    if (alertFPS > 800/framesToCompute) {
      if (quality < QUALITY.HIGH) setQuality(quality + 1, 'High FPS.')
      alertFPS = 0
    }
  }
}

// Init Drawer:
setTimeout(()=> {
  setQuality(QUALITY.MEDIUM, '')
  gameCtx.imageSmoothingEnabled = true
  gameCtx.imageSmoothingQuality = 'low'
  debug('Create BG 3 (Nebulas)')
  drawPlasma(seed1)
  updateGameCanvas()
}, 1)

window.addEventListener('keydown', (ev)=> {
  if (ev.key == 'ArrowUp')    pSpeedY -= 0.25
  if (ev.key == 'ArrowDown')  pSpeedY += 0.25
  if (ev.key == 'ArrowLeft')  pSpeedX -= 0.25
  if (ev.key == 'ArrowRight') pSpeedX += 0.25
})
