function drawSunRays(x,y,r1,r2,r3) {
  const quartStep = PI/180;
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
      let rayMoveX = cos(rayPos/7/PI+a*18) * 15*zoom/divScreen
      let rayMoveY = sin(rayPos/7/PI+a*18) * 15*zoom/divScreen
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

function updateSun() {
  const [x, y] = relativeObjPos({x:0, y:0})
  const r1 = sunR1*zoom / divScreen
  const r2 = sunR2*zoom / divScreen
  const r3 = sunR3*zoom / divScreen
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
