"use strict";

const shipCanvasSize = 300

function drawShipFire(quarter) {
  let grad = gameCtx.createRadialGradient(-quarter*1.1,0, 2, -quarter*1.2,0, quarter/3)
  grad.addColorStop(0, '#8FF')
  grad.addColorStop(1, '#08F')
  gameCtx.fillStyle = grad
  gameCtx.beginPath()
  const wav = 1.15
  gameCtx.moveTo(-quarter*.8, 0)
  gameCtx.bezierCurveTo(
    -quarter*wav, -quarter*.6,
    -quarter*wav, -quarter*.1,
    -quarter*(2 + sin( (Date.now()/30) % (2*PI) ) / 20), 0
  )
  gameCtx.bezierCurveTo(
    -quarter*wav, quarter*.1,
    -quarter*wav, quarter*.6,
    -quarter*.8, 0
  )
  gameCtx.fill()
}
function drawShipRotJet(dir) {
}
function drawShipLander() {
}

function drawShip(canvas, isMySelf) {
  var grad
  const quarter = shipCanvasSize/4
  const ctx = canvas.getContext('2d')
  ctx.translate(quarter*2, quarter*2)
  ctx.rotate(PI/2)
  if (DEBUG_MODE) {
    //ctx.fillStyle = isMySelf ? 'rgba(0,80,255,0.2)' : 'rgba(255,0,0,0.2)'
    //ctx.fillRect(-quarter*2, -quarter*2, shipCanvasSize, shipCanvasSize)
  }

  // Nacele Esq
  function mkNacele(side) {
    ctx.beginPath()
    let ini = PI*(5-side*2)/10
    ctx.moveTo(cos(ini)*quarter, -sin(ini)*quarter)
    ctx.arc(0, 0, quarter, ini, PI*(5-side*8)/10, side>0)
    ctx.closePath()
    grad = ctx.createLinearGradient(quarter*side,0, quarter*side*.6,0)
    grad.addColorStop( 0, '#BBB')
    grad.addColorStop(.5, isMySelf ? '#369' : '#943')
    grad.addColorStop( 1, '#222')
    ctx.fillStyle = grad
    ctx.fill()
  }
  mkNacele(-1) // Left
  mkNacele(+1) // Right

  // wing support
  //ctx.fillRect(-quarter*0.7, 0, quarter*1.4, quarter/2)
  ctx.beginPath()
  ctx.moveTo(-quarter*0.6, 0)
  ctx.lineTo( quarter*0.6, 0)
  ctx.bezierCurveTo(
    quarter*0.8, 0,
    quarter*0.8, quarter/2,
    quarter*0.6, quarter/2
  )
  ctx.lineTo(-quarter*0.6, quarter/2)
  ctx.bezierCurveTo(
    -quarter*0.8, quarter/2,
    -quarter*0.8, 0,
    -quarter*0.6, 0
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(0,0, 0,quarter/2)
  grad.addColorStop(0.0, '#333')
  grad.addColorStop(0.5, '#999')
  grad.addColorStop(1.0, '#333')
  ctx.fillStyle = grad
  ctx.fill()

  // Main Body
  ctx.beginPath()
  ctx.moveTo(0, -quarter*1.2)
  ctx.bezierCurveTo(
    quarter*0.4, -quarter,
    quarter*0.4, -quarter/2,
    quarter*0.4, 0
  )
  ctx.lineTo( quarter*0.4, quarter)
  ctx.lineTo(-quarter*0.4, quarter)
  ctx.lineTo(-quarter*0.4, 0)
  ctx.bezierCurveTo(
    -quarter*0.4, -quarter/2,
    -quarter*0.4, -quarter,
    0           , -quarter*1.2
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(-quarter/2,0, quarter/2,0)
  grad.addColorStop(0.0, '#444')
  grad.addColorStop(0.5, '#BBB')
  grad.addColorStop(1.0, '#444')
  ctx.fillStyle = grad
  ctx.fill()

  // Glass
  ctx.beginPath()
  ctx.moveTo(0, -quarter)
  ctx.bezierCurveTo(
    quarter*0.3, -quarter,
    quarter*0.3, -quarter/2,
    quarter*0.3, -quarter/2
  )
  ctx.lineTo(-quarter*0.3, -quarter/2)
  ctx.bezierCurveTo(
    -quarter*0.3, -quarter/2,
    -quarter*0.3, -quarter,
    0           , -quarter
  )
  ctx.closePath()
  grad = ctx.createLinearGradient(-quarter*.3,0, quarter*.3,0)
  grad.addColorStop(0.0, '#222')
  grad.addColorStop(0.4, '#888')
  grad.addColorStop(0.6, '#888')
  grad.addColorStop(1.0, '#222')
  ctx.fillStyle = grad
  ctx.fill()

  // Color
  ctx.globalCompositeOperation = 'multiply'
  ctx.beginPath()
  let lim = quarter*0.39
  repeat(3, (i)=> {
    ctx.moveTo(-lim, quarter-(14*i)-14)
    ctx.lineTo( lim, quarter-(14*i)-14)
  })
  function mkLLine(side) {
    ctx.moveTo(side*lim        ,  quarter-56)
    ctx.lineTo(side*quarter*0.1,  quarter-56)
    ctx.lineTo(side*quarter*0.1,  quarter*.05)
    ctx.moveTo(side*quarter*0.1, -quarter*.04)
    ctx.lineTo(side*quarter*0.1, -quarter*.16)
    ctx.moveTo(side*quarter*0.1, -quarter*.25)
    ctx.lineTo(side*quarter*0.1, -quarter*.33)
  }
  mkLLine(-1)
  mkLLine(+1)

  ctx.strokeStyle = isMySelf ? 'rgba(0,100,255,0.4)' : 'rgba(255,60,0,0.4)'
  ctx.lineWidth = 8
  ctx.stroke()
}
drawShip(canvShip1, true)
drawShip(canvShip2)

function plotShip(player) {
  const [x, y] = relativeObjPos(player)
  const totSize = shipRadiusWithFire * 2 * zoom / divScreen
  const quarter = totSize / 4
  const radius = shipRadius*zoom/divScreen
  const canvas = player.isMySelf ? canvShip1 : canvShip2
  gameCtx.save()
  gameCtx.translate(x, y)
  gameCtx.fillStyle = 'rgba(255,255,255,0.6)'
  gameCtx.font = `normal ${8/divScreen+5}px sans-serif`
  gameCtx.textAlign = 'center'
  gameCtx.fillText(player.userID, 0, -radius - 16/divScreen)
  gameCtx.rotate(player.rot)
  if (player.fireIsOn) drawShipFire(quarter)
  gameCtx.drawImage(
    canvas,
    0, 0, shipCanvasSize, shipCanvasSize,
    -totSize/2, -totSize/2, totSize, totSize
  )
  gameCtx.restore()
  if (DEBUG_MODE) {
    gameCtx.strokeStyle = 'rgba(0,255,0,.75)'
    gameCtx.lineWidth = 0.6
    gameCtx.beginPath()
    gameCtx.moveTo(x+radius, y)
    gameCtx.arc(x, y, radius, 0, 2*PI)
    gameCtx.closePath()
    gameCtx.stroke()
  }
}
