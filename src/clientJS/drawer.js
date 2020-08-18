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
var speedLim1 = 2*2 + 2*2 // Where to start to arrast stars
var speedLim2 = 4*4 + 4*4 // The maximum speed
var speedLimDelta = speedLim2 - speedLim1
var planets = []

const seed1 = [
  '..F. ..F. ..F4 ..F. ..F. ..F. .... .... .... .... .... .... ..F. ..F. ..F. ..F.',
  '..F2 ..F8 .FFf .8F8 ..F4 ..F. .... .... .... .... .... .... .... .... .... ..F.',
  '..F. ..F4 ..Ff ..F8 ..F2 ..F. .... .... .... .... .... .... .... .... .... ..F.',
  '..F. ..F. ..F. ..F. ..F. ..F. .... .... .... .... .... .... F... F... F... ....',
  '.... .... .... .... .... .... .... .... F... F... F... F... F... F..3 F... ....',
  '.... .... .... .... .... .... F... F... F... F..4 F..4 F..1 F..4 F..1 F... ....',
  '.... .... .... .... .... .... F... F..2 F4.4 F..4 F... F..4 F..2 F... F... ....',
  '.... .... .... .... .... F... F... F..f F8.f F8.8 FF.F F..8 F... F... .... ....',
  '.... .... .... .... F... F... F..4 F..f F4.8 F... FC.8 F8.6 F..2 F... .... ....',
  '.... .... .... .... F... F..2 F..8 F..8 F..4 F..2 F..2 F..3 F... F... .... ....',
  '.... .... .... F... F..1 F..4 F... F... F... F... F... F... F... .... .... ....',
  '.... .... .... F... F..2 F... F... .... .... .... F... F... F... .... .... ....',
  '.... .... .... F... F... F... .... .... .... F.8. F.8. F.84 F.8. F... F.F. ..F.',
  '.... .... .... .... .... .... .... .... .... F.F. F.88 F.F4 F.F8 F.F4 ..F2 ..F.',
  '.... .... .... .... .... .... .... .... .... F.8. F.F. F.F8 8.FF 8.F8 ..F4 ..F.',
  '.... ..F. ..F. ..F. .... .... .... .... .... F... 8.F. 8.F. 8.F. ..F4 ..F. ..F.',
]

function mkStarData(size) {
  let r=0, g=0, b=0
  if (rnd()<0.5) {
    r=g=b = 255
  } else if (rnd()<0.5) {
    b = 255
    r = round(rnd()*255)
    g = 127 + round(r/2)
  } else {
    r=g = 255
    b = round(rnd()*255)
  }
  return { x:rnd(), y:rnd(), size:rnd()*size, r,g,b }
}

for (let i=0; i< 25; i++) stars1[i] = mkStarData(7)
for (let i=0; i< 40; i++) stars2[i] = mkStarData(5)
for (let i=0; i<120; i++) stars3[i] = mkStarData(2)

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

setQuality(QUALITY.MEDIUM, '')
gameCtx.imageSmoothingEnabled = true
gameCtx.imageSmoothingQuality = 'low'
debug('Create BG 3 (Nebulas)')
drawPlasma(seed1)

function plotPix(pixelsArr, w, x,y, r,g,b,a) {
  let pos = (y*w + x) * 4
  pixelsArr[pos+0] = r
  pixelsArr[pos+1] = g
  pixelsArr[pos+2] = b
  pixelsArr[pos+3] = a
}

function drawStars(canvas, canvasSpeed, stars, maxSize) {
  const ctx = canvas.getContext('2d')
  const ctxS = canvasSpeed.getContext('2d')
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  ctxS.clearRect(0, 0, w, h)
  const imgData = ctx.getImageData(0, 0, w, h)
  const pixels = imgData.data
  const imgDataS = ctxS.getImageData(0, 0, w, h)
  const pixelsS = imgDataS.data
  stars.forEach(({x:xPct,y:yPct,size:sizeOrig,r,g,b}) => {
    let x = round( (w-4) * xPct + 2 )
    let y = round( (h-4) * yPct + 2 )
    let size = sizeOrig / divScreen
    let a = (maxSize<3 && divScreen>2) ? 128 : 255;
    [{ pixels, ss: 7 }, { pixels: pixelsS, ss:(divScreen==1)?2:1 }]
    .forEach(({pixels, ss})=> {
      plotPix(pixels, w, x,y, r,g,b,a)
      for (let i=0; i<ss; i++) {
        let a = (size-i)*255 / (maxSize/divScreen)
        plotPix(pixels, w, x+i,y, r,g,b,a)
        plotPix(pixels, w, x-i,y, r,g,b,a)
        plotPix(pixels, w, x,y+i, r,g,b,a)
        plotPix(pixels, w, x,y-i, r,g,b,a)
      }
    })
  })
  ctx.putImageData(imgData, 0, 0)
  ctxS.putImageData(imgDataS, 0, 0)
}

function drawPlasma(seed) {
  const ctx = canvBG3.getContext('2d')
  const size = canvBG3.width
  if (size !== canvBG3.height || Math.log2(size) % 1 !== 0)
    throw Error('Canvas width and height must to be equal and power of 2.')
  seed = [...seed.map(l => l.replace(/\./g, '0').split(' '))]
  const seedSize = seed.length
  if (seedSize !== seed[0].length || Math.log2(seedSize) % 1 !== 0)
    throw Error('Seed width and height must to be equal and power of 2.')
  const imgData = ctx.getImageData(0, 0, size, size)
  const pixels = imgData.data
  let step = size / seedSize
  for (let y=0; y<seedSize; y++) for (let x=0; x<seedSize; x++) {
    let pos = (y*step*size + x*step) * 4
    let color = seed[y][x].split('')
    let r = parseInt(color[0]+color[0], 16)
    let g = parseInt(color[1]+color[1], 16)
    let b = parseInt(color[2]+color[2], 16)
    let a = parseInt(color[3]+color[3], 16)
    pixels[pos+0] = r
    pixels[pos+1] = g
    pixels[pos+2] = b
    pixels[pos+3] = a
  }
  while (step > 1) {
    for (let y=0; y<size; y+=step) for (let x=0; x<size; x+=step) {
      let pos = (y*size + x) * 4
      let yUp = y==0 ? size-step : y-step
      let xLeft = x==0 ? size-step : x-step
      let yMUp = y==0 ? size-step/2 : y-step/2
      let xMLeft = x==0 ? size-step/2 : x-step/2
      let posUp = (yUp*size + x) * 4
      let posLeft = (y*size + xLeft) * 4
      let posUL = (yUp*size + xLeft) * 4
      let posMUp = (yMUp*size + x) * 4
      let posMLeft = (y*size + xMLeft) * 4
      let posMUL = (yMUp*size + xMLeft) * 4
      let r = pixels[pos+0]
      let g = pixels[pos+1]
      let b = pixels[pos+2]
      let a = pixels[pos+3]
      let rUp = pixels[posUp+0]
      let gUp = pixels[posUp+1]
      let bUp = pixels[posUp+2]
      let aUp = pixels[posUp+3]
      let rLeft = pixels[posLeft+0]
      let gLeft = pixels[posLeft+1]
      let bLeft = pixels[posLeft+2]
      let aLeft = pixels[posLeft+3]
      let rndM = rnd()
      pixels[posMUp+0] = round(r*rndM + rUp*(1-rndM))
      pixels[posMUp+1] = round(g*rndM + gUp*(1-rndM))
      pixels[posMUp+2] = round(b*rndM + bUp*(1-rndM))
      pixels[posMUp+3] = round(a*rndM + aUp*(1-rndM))
      rndM = rnd()
      pixels[posMLeft+0] = round(r*rndM + rLeft*(1-rndM))
      pixels[posMLeft+1] = round(g*rndM + gLeft*(1-rndM))
      pixels[posMLeft+2] = round(b*rndM + bLeft*(1-rndM))
      pixels[posMLeft+3] = round(a*rndM + aLeft*(1-rndM))
      rndM = rnd()
      pixels[posMUL+0] = round(rLeft*rndM + rUp*(1-rndM))*0.67 + r*0.33
      pixels[posMUL+1] = round(gLeft*rndM + gUp*(1-rndM))*0.67 + g*0.33
      pixels[posMUL+2] = round(bLeft*rndM + bUp*(1-rndM))*0.67 + b*0.33
      pixels[posMUL+3] = round(aLeft*rndM + aUp*(1-rndM))*0.67 + a*0.33
    }
    step /= 2
  }
  ctx.putImageData(imgData, 0, 0)
  if (DEBUG_MODE) {
    ctx.fillStyle = 'green'
    ctx.fillText('Nebulas', 50, 50)
  }
  let ctxSpeed = canvBG3Speed.getContext('2d')
  ctxSpeed.putImageData(imgData, 0, 0)
  ctxSpeed.fillStyle = `rgba(0,0,0,0.2)`
  ctxSpeed.fillRect(0, 0, size, size)
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
  const itsFast = curQuadSpeed > speedLim1

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
  if (curQuadSpeed>speedLim1) plotBgTile(cBG1, (-x+pSpeedX/2)/2, (-y+pSpeedY/2)/2, 1)

  //debug({pSpeedX, pSpeedY, itsFast})
}

function drawSunRays(x,y,r1,r2,r3) {
  const quartStep = PI/200;
  [0, quartStep*10].forEach((aInc) => {
    const grad = gameCtx.createRadialGradient(x,y,r1/3, x,y,r3)
    grad.addColorStop(0.00, '#FC0')
    grad.addColorStop(0.84, '#FC0')
    grad.addColorStop(1.00, 'rgba(255,200,0,0.1)')
    gameCtx.fillStyle = grad
    const rayPos = Date.now() / 10
    gameCtx.beginPath()
    gameCtx.moveTo(cos(aInc)*r1+x, sin(aInc)*r1+y)
    for (let a=0; a<=PI*2; a+=quartStep*4) {
      let aa = a + aInc
      let rayMoveX = cos(rayPos/7/PI+a*18) * 10/divScreen
      let rayMoveY = sin(rayPos/7/PI+a*18) * 10/divScreen
      gameCtx.bezierCurveTo(
        cos(aa+quartStep)*r2+x,            sin(aa+quartStep)*r2+y,
        cos(aa+quartStep)*r2+x+rayMoveX,   sin(aa+quartStep)*r2+y+rayMoveY,
        cos(aa+quartStep*2)*r3+x+rayMoveX, sin(aa+quartStep*2)*r3+y+rayMoveY
      )
      let step = aa + quartStep*4
      gameCtx.bezierCurveTo(
        cos(step-quartStep)*r2+x+rayMoveX, sin(step-quartStep)*r2+y+rayMoveY,
        cos(step-quartStep)*r2+x+rayMoveX, sin(step-quartStep)*r2+y+rayMoveY,
        cos(step)*r1+x,                    sin(step)*r1+y
      )
    }
    gameCtx.closePath()
    gameCtx.fill()
  })
}

function relativeObjPos({x, y}) {
  return [
    winW/2 + (x-playerX)*zoom / divScreen,
    winH/2 + (y-playerY)*zoom / divScreen
  ]
}

function updateSun() {
  const [x, y] = relativeObjPos({x:0, y:0})
  const r1 = 800*zoom / divScreen
  const r2 = 850*zoom / divScreen
  const r3 = 900*zoom / divScreen
  drawSunRays(x,y,r1,r2,r3)

  const grad = gameCtx.createRadialGradient(x,y,r1/3, x,y,r3)
  grad.addColorStop(0.00, '#F40')
  grad.addColorStop(0.60, '#F80')
  grad.addColorStop(0.82, '#FC0')
  grad.addColorStop(0.85, '#FC0')
  grad.addColorStop(0.95, 'rgba(255,200,0,0.2)')
  grad.addColorStop(0.99, 'rgba(200,100,0,0.0)')
  gameCtx.fillStyle = grad
  gameCtx.beginPath()
  gameCtx.arc(x, y, r3, 0, 360)
  gameCtx.closePath()
  gameCtx.fill()
}

function bright(colorCompo, mult=3) {
  colorCompo *= mult
  return colorCompo > 255 ? 255 : colorCompo
}

function cratePlanet({x,y,radius,a/*angulo rotação*/,d/*distancia*/,r,g,b,noize}) {
  var planet = {
    a, d, rot:0, r:radius,
    c1: document.createElement('canvas'), // Base texture
    c2: document.createElement('canvas'), // Shadow texture
    c3: document.createElement('canvas'), // Light texture
    c4: document.createElement('canvas')  // Sun light and shadow
  }
  ;['c1','c2','c3','c4'].forEach(c => {
    planet[c].width = radius*2
    planet[c].height = radius*2
    body.appendChild(planet[c])
  })
  const ctx1 = planet.ctx1 = planet.c1.getContext('2d')
  const ctx2 = planet.ctx2 = planet.c2.getContext('2d')
  const ctx3 = planet.ctx3 = planet.c3.getContext('2d')
  const ctx4 = planet.ctx4 = planet.c4.getContext('2d')

  // Draw round base planet texture:
  ctx1.beginPath()
  ctx1.arc(radius, radius, radius, 0, 360)
  ctx1.closePath()
  ctx1.clip()
  ctx1.fillStyle = `rgb(${r},${g},${b})`
  ctx1.fillRect(0,0,radius*2,radius*2)
  const imgData = ctx1.getImageData(0, 0, radius*2, radius*2)
  const pixels = imgData.data
  pixels.forEach((c,i)=> pixels[i] = (i%4==3)? c : c-(rnd()-.5)*noize )
  ctx1.putImageData(imgData, 0, 0)

  // Draw sun light/shadow mask:
  let grad = ctx4.createLinearGradient(0, 0, radius*2, 0)
  grad.addColorStop(0.0, '#A0A0A0')
  grad.addColorStop(0.3, '#909090')
  grad.addColorStop(0.7, '#606060')
  grad.addColorStop(1.0, '#505050')
  ctx4.fillStyle = grad
  ctx4.beginPath()
  ctx4.arc(radius, radius, radius, 0, 360)
  ctx4.closePath()
  ctx4.fill()
  grad = ctx4.createRadialGradient(
    radius*0.6, radius, radius*0.5,
    radius*0.8, radius, radius*1.2
  )
  grad.addColorStop(0, 'rgba(150,150,150, 0)')
  grad.addColorStop(1, 'rgba(  1,  1,  1, 1)')
  ctx4.fillStyle = grad
  ctx4.beginPath()
  ctx4.arc(radius, radius, radius, 0, 360)
  ctx4.closePath()
  ctx4.fill()

  for (let dist=10; dist<radius; dist+=5) {
    let numCrats = round((dist/15)*Math.log2(dist*6/radius))
    if (numCrats<1) numCrats = 1
    let z = sin(PI*(1-dist/radius)/2) // Inclinação da cratera. Achata na extremidade.
    for (let i=0; i<numCrats; i++) {
      let rndRotate = rnd()*PI*2
      let rCratY = 2+rnd()*8 * (z+0.5);
      let rCratX = rCratY * z;
      [
        [ctx2, `rgba(${r/2},${g/2},${b/2},${(z*2+1)/3})`],
        [ctx3, `rgba(${bright(r)},${bright(g)},${bright(b)},${(z*2+1)/8})`]
      ].forEach(([ctx, strokeStyle]) => {
        ctx.save()
        ctx.translate(radius, radius)
        //ctx.rotate(i*0.1) // debug
        ctx.rotate(rndRotate)
        //rCratX = rCratY = 2 // debug
        // Remove a possible border intersection:
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.ellipse(dist, 0, rCratX, rCratY, 0, 0, 360)
        ctx.closePath()
        ctx.fill()
        // Draw the border:
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 1
        ctx.strokeStyle = strokeStyle
        ctx.beginPath()
        ctx.ellipse(dist, 0, rCratX, rCratY, 0, 0, 360)
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
      })
    }
  }
  planets.push(planet)
}
cratePlanet({ radius: 200, a:-PI/12, d:1100, r:0, g:80, b:200, noize:30 })
cratePlanet({ radius: 350, a:-PI/12, d:1650, r:100, g:50, b:30, noize:50 })

function plotPlanet(p) {
  const diameter = p.r*2*zoom / divScreen
  //const x = winW/2 + (cos(p.a) * p.d)*zoom / divScreen - playerX
  //const y = winH/2 + (sin(p.a) * p.d)*zoom / divScreen - playerY
  const [x, y] = relativeObjPos({ x: cos(p.a)*p.d, y: sin(p.a)*p.d })
  const c = -p.r*zoom / divScreen
  p.a += 0.002
  p.rot += 0.01
  gameCtx.save()
  gameCtx.translate(x, y)
  gameCtx.rotate(p.rot)
  // Plot base texture
  gameCtx.drawImage(p.c1, 0, 0, p.r*2, p.r*2, c, c, diameter, diameter)
  // Plot shadow texture
  gameCtx.drawImage(
    p.c2,
    0, 0,
    p.r*2, p.r*2,
    c-sin(p.rot-p.a-PI/2), c-cos(p.rot-p.a-PI/2),
    diameter, diameter
  )
  // Plot light texture
  gameCtx.drawImage(
    p.c3,
    0, 0,
    p.r*2, p.r*2,
    c+sin(p.rot-p.a-PI/2), c+cos(p.rot-p.a-PI/2),
    diameter, diameter
  )
  gameCtx.rotate(-p.rot)
  // Plot sun light and shadow
  gameCtx.rotate(p.a)
  gameCtx.globalCompositeOperation = 'overlay'
  gameCtx.drawImage(
    p.c4,
    0, 0,
    p.r*2, p.r*2,
    c, c,
    diameter, diameter
  )
  gameCtx.restore()
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
  playerX += pSpeedX
  playerY += pSpeedY
  updateBg(playerX, playerY)
  gameCtx.globalCompositeOperation = 'source-over'
  updateSun()
  gameCtx.globalCompositeOperation = 'source-over'
  planets.forEach(plotPlanet)
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
updateGameCanvas()

window.addEventListener('keydown', (ev)=> {
  if (ev.key == 'ArrowUp')    pSpeedY -= 0.25
  if (ev.key == 'ArrowDown')  pSpeedY += 0.25
  if (ev.key == 'ArrowLeft')  pSpeedX -= 0.25
  if (ev.key == 'ArrowRight') pSpeedX += 0.25
})
