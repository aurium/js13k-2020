"use strict";

const shipCanvasSize = 300

function drawShipFire() {
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
    ctx.fillStyle = isMySelf ? 'rgba(0,80,255,0.2)' : 'rgba(255,0,0,0.2)'
    ctx.fillRect(-quarter*2, -quarter*2, shipCanvasSize, shipCanvasSize)
  }

  // Nacele Esq
  ctx.beginPath()
  ctx.moveTo(cos(PI*0.7)*quarter, -sin(PI*0.7)*quarter)
  ctx.arc(0, 0, quarter, PI*0.7, PI*1.3)
  ctx.closePath()
  grad = ctx.createLinearGradient(-quarter,0, -quarter/2,0)
  grad.addColorStop(0, '#BBB')
  grad.addColorStop(1, '#000')
  ctx.fillStyle = grad
  ctx.fill()

  // Nacele Dir
  ctx.beginPath()
  ctx.moveTo(cos(PI*0.3)*quarter, -sin(PI*0.3)*quarter)
  ctx.arc(0, 0, quarter, PI*0.3, -PI*0.3, true)
  ctx.closePath()
  grad = ctx.createLinearGradient(quarter,0, quarter/2,0)
  grad.addColorStop(0, '#BBB')
  grad.addColorStop(1, '#000')
  ctx.fillStyle = grad
  ctx.fill()

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
  grad.addColorStop(0.5, '#AAA')
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
  grad = ctx.createLinearGradient(-quarter/2,0, quarter/2,0)
  grad.addColorStop(0.0, '#222')
  grad.addColorStop(0.5, '#888')
  grad.addColorStop(1.0, '#222')
  ctx.fillStyle = grad
  ctx.fill()

  // Color
  ctx.globalCompositeOperation = 'multiply'
  ctx.strokeStyle = isMySelf ? 'rgba(0,80,255,0.6)' : 'rgba(255,20,0,0.6)'
  ctx.lineWidth = 4
  ctx.beginPath()
  repeat(4, (i)=> {
    ctx.moveTo(-quarter*0.3, quarter-(10*i)-10)
    ctx.lineTo( quarter*0.3, quarter-(10*i)-10)
  })
  ctx.moveTo(-quarter*0.3, quarter-50)
  ctx.lineTo(-quarter*0.1, quarter-50)
  ctx.lineTo(-quarter*0.1, -quarter/3)
  ctx.moveTo( quarter*0.3, quarter-50)
  ctx.lineTo( quarter*0.1, quarter-50)
  ctx.lineTo( quarter*0.1, -quarter/3)
  ctx.stroke()

  ctx.beginPath()
  ctx.rect(-quarter,-quarter, quarter*0.4,quarter*2)
  ctx.rect(quarter*0.6,-quarter, quarter*0.4,quarter*2)
  ctx.closePath()
  ctx.clip()

  ctx.beginPath()
  ctx.arc(0, 0, quarter-5, 0, PI*2)
  ctx.closePath()
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
  if (player.fireIsOn) {
    gameCtx.fillStyle = '#F80'
    gameCtx.beginPath()
    gameCtx.moveTo(-quarter*.9, 0)
    gameCtx.bezierCurveTo(
      -quarter, -quarter*.6,
      -quarter, -quarter*.1,
      -quarter*2, 0
    )
    gameCtx.bezierCurveTo(
      -quarter, quarter*.1,
      -quarter, quarter*.6,
      -quarter*.9, 0
    )
    gameCtx.closePath()
    gameCtx.fill()
  }
  gameCtx.drawImage(
    canvas,
    0, 0, shipCanvasSize, shipCanvasSize,
    -totSize/2, -totSize/2, totSize, totSize
  )
  gameCtx.restore()
  if (DEBUG_MODE) {
    gameCtx.strokeStyle = '#0F0'
    gameCtx.beginPath()
    //gameCtx.rect(x-totSize/2, y-totSize/2, totSize, totSize)
    gameCtx.moveTo(x+radius, y)
    gameCtx.arc(x, y, radius, 0, 2*PI)
    gameCtx.closePath()
    gameCtx.stroke()
  }
}
