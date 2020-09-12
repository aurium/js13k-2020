"use strict";

const shipCanvasSize = 300

function drawShipFire(quarter) {
  // let grad = gameCtx.cRG(-quarter*1.1,0, 2, -quarter*1.2,0, quarter/3)
  // grad.addColorStop(0, '#8FF')
  // grad.addColorStop(1, '#08F')
  // gameCtx.fS(grad)
  gameCtx.g(1,'fS', -quarter*1.1,0, 2, -quarter*1.2,0, quarter/3, ['#8FF'], ['#08F'])
  gameCtx.bP()
  const wav = 1.15
  gameCtx.moT(-quarter*.8, 0)
  gameCtx.bCT(
    -quarter*wav, -quarter*.6,
    -quarter*wav, -quarter*.1,
    -quarter*(2 + sin( (frameNow/30) % PI2 ) / 20), 0
  )
  gameCtx.bCT(
    -quarter*wav, quarter*.1,
    -quarter*wav, quarter*.6,
    -quarter*.8, 0
  )
  gameCtx.f()
}
function drawShipRotJet(quarter, dir) {
  gameCtx.bP()
  gameCtx.moT( quarter*.75, -quarter*.65*dir)
  gameCtx.lT( quarter*.5,  -quarter*1.5*dir)
  gameCtx.moT(-quarter*.75,  quarter*.65*dir)
  gameCtx.lT(-quarter*.5,   quarter*1.5*dir)
  // const grad = gameCtx.cRG(0,0, quarter*.8, 0,0, quarter*1.5)
  // grad.addColorStop(0, 'rgba(255,255,255,0.5)')
  // grad.addColorStop(1, 'rgba(255,255,255,0)')
  // gameCtx.sS(grad)
  gameCtx.g(1,'sS', 0,0, quarter*.8, 0,0, quarter*1.5, ['rgba(255,255,255,0.5)'], ['rgba(255,255,255,0)'])
  gameCtx.lW(2)
  gameCtx.st()
}

function drawShipBrake(quarter) {
  gameCtx.bP()
  gameCtx.moT(0, 0)
  gameCtx.moT(cos(.8)*quarter, sin(.8)*quarter)
  gameCtx.a(0, 0, quarter*1.15, .8, 2.5, 0)
  gameCtx.moT(cos(-.8)*quarter, sin(-.8)*quarter)
  gameCtx.a(0, 0, quarter*1.15, -.8, -2.5, 1)
  gameCtx.moT(0, 0)
  gameCtx.lW(quarter/2.5)

  // const grad = gameCtx.cRG(0,0, quarter, 0,0, quarter*1.4)
  // grad.addColorStop(0, '#0FF')
  // grad.addColorStop(1, 'rgba(0,0,255,0)')
  // gameCtx.sS(grad)
  gameCtx.g(1,'sS', 0,0, quarter, 0,0, quarter*1.4, ['#0FF'], ['rgba(0,0,255,0)'])
  //gameCtx.sS('rgba(0,80,255,0.4)')
  gameCtx.st()
}

function drawShip(canvas, isMySelf) {
  var grad
  const quarter = shipCanvasSize/4
  const ctx = canvas.getContext('2d')
  ctx.tr(quarter*2, quarter*2)
  ctx.ro(PI/2)
  if (DEBUG_MODE) {
    //ctx.fS(isMySelf ? 'rgba(0,80,255,0.2)' : 'rgba(255,0,0,0.2)')
    //ctx.fR(-quarter*2, -quarter*2, shipCanvasSize, shipCanvasSize)
  }

  // Nacele
  function mkNacele(side) {
    ctx.bP()
    let ini = PI*(5-side*2)/10
    ctx.moT(cos(ini)*quarter, -sin(ini)*quarter)
    ctx.a(0, 0, quarter, ini, PI*(5-side*8)/10, side>0)
    ctx.cP()
    // grad = ctx.cLG(quarter*side,0, quarter*side*.6,0)
    // grad.addColorStop( 0, '#BBB')
    // grad.addColorStop(.5, isMySelf ? '#369' : '#943')
    // grad.addColorStop( 1, '#222')
    // ctx.fS(grad)
    ctx.g(0,'fS',
      quarter*side,0,0, quarter*side*.6,0,0,
      ['#BBB'], [isMySelf ? '#369' : '#943'], ['#222']
    )
    ctx.f()
  }
  mkNacele(-1) // Left
  mkNacele(+1) // Right

  // wing support
  //ctx.fR(-quarter*0.7, 0, quarter*1.4, quarter/2)
  ctx.bP()
  ctx.moT(-quarter*0.6, 0)
  ctx.lT( quarter*0.6, 0)
  ctx.bCT(
    quarter*0.8, 0,
    quarter*0.8, quarter/2,
    quarter*0.6, quarter/2
  )
  ctx.lT(-quarter*0.6, quarter/2)
  ctx.bCT(
    -quarter*0.8, quarter/2,
    -quarter*0.8, 0,
    -quarter*0.6, 0
  )
  ctx.cP()
  // grad = ctx.cLG(0,0, 0,quarter/2)
  // grad.addColorStop(0.0, '#333')
  // grad.addColorStop(0.5, '#999')
  // grad.addColorStop(1.0, '#333')
  // ctx.fS(grad)
  ctx.g(0,'fS',
    0,0,0, 0,quarter/2,0,
    ['#333'], ['#999'], ['#333']
  )
  ctx.f()

  // Main Body
  ctx.bP()
  ctx.moT(0, -quarter*1.2)
  ctx.bCT(
    quarter*0.4, -quarter,
    quarter*0.4, -quarter/2,
    quarter*0.4, 0
  )
  ctx.lT( quarter*0.4, quarter)
  ctx.lT(-quarter*0.4, quarter)
  ctx.lT(-quarter*0.4, 0)
  ctx.bCT(
    -quarter*0.4, -quarter/2,
    -quarter*0.4, -quarter,
    0           , -quarter*1.2
  )
  ctx.cP()
  // grad = ctx.cLG(-quarter/2,0, quarter/2,0)
  // grad.addColorStop(0.0, '#444')
  // grad.addColorStop(0.5, '#BBB')
  // grad.addColorStop(1.0, '#444')
  // ctx.fS(grad)
  ctx.g(0,'fS',
    -quarter/2,0,0, quarter/2,0,0,
    ['#444'], ['#BBB'], ['#444']
  )
  ctx.f()

  // Glass
  ctx.bP()
  ctx.moT(0, -quarter)
  ctx.bCT(
    quarter*0.3, -quarter,
    quarter*0.3, -quarter/2,
    quarter*0.3, -quarter/2
  )
  ctx.lT(-quarter*0.3, -quarter/2)
  ctx.bCT(
    -quarter*0.3, -quarter/2,
    -quarter*0.3, -quarter,
    0           , -quarter
  )
  ctx.cP()
  // grad = ctx.cLG(-quarter*.3,0, quarter*.3,0)
  // grad.addColorStop(0.0, '#222')
  // grad.addColorStop(0.4, '#888')
  // grad.addColorStop(0.6, '#888')
  // grad.addColorStop(1.0, '#222')
  // ctx.fS(grad)
  ctx.g(0,'fS',
    -quarter*.3,0,0, quarter*.3,0,0,
    ['#222'], ['#888'], ['#888'], ['#222']
  )
  ctx.f()

  // Color
  ctx.gCO('multiply')
  ctx.bP()
  let lim = quarter*0.39
  repeat(3, (i)=> {
    ctx.moT(-lim, quarter-(14*i)-14)
    ctx.lT( lim, quarter-(14*i)-14)
  })
  function mkLLine(side) {
    ctx.moT(side*lim        ,  quarter-56)
    ctx.lT(side*quarter*0.1,  quarter-56)
    ctx.lT(side*quarter*0.1,  quarter*.05)
    ctx.moT(side*quarter*0.1, -quarter*.04)
    ctx.lT(side*quarter*0.1, -quarter*.16)
    ctx.moT(side*quarter*0.1, -quarter*.25)
    ctx.lT(side*quarter*0.1, -quarter*.33)
  }
  mkLLine(-1)
  mkLLine(+1)

  ctx.sS(isMySelf ? 'rgba(0,100,255,0.4)' : 'rgba(255,60,0,0.4)')
  ctx.lW(8)
  ctx.st()
}
drawShip(canvShip1, true)
drawShip(canvShip2)

function plotShip(player) {
  const [x, y] = relativeObjPos(player)
  const totSize = shipRadiusWithFire * 2 * zoom / divScreen
  const quarter = totSize / 4
  const radius = shipRadius*zoom/divScreen
  const canvas = player.isMySelf ? canvShip1 : canvShip2
  gameCtx.s()
  gameCtx.tr(x, y)
  gameCtx.fS('rgba(255,255,255,0.6)')
  if (!player.isMySelf) {
    gameCtx.font = `normal ${8/divScreen+5}px sans-serif`
    gameCtx.tA('center')
    gameCtx.fT(getName(player), 0, -radius - 16/divScreen)
  }
  gameCtx.ro(player.rot)
  if (player.fireIsOn) drawShipFire(quarter)
  if (player.re) drawShipBrake(quarter)
  if (player.rotJet!=0) drawShipRotJet(quarter, player.rotJet)
  gameCtx.dI(
    canvas,
    0, 0, shipCanvasSize, shipCanvasSize,
    -totSize/2, -totSize/2, totSize, totSize
  )
  gameCtx.re()
  if (DEBUG_MODE) {
    gameCtx.sS('rgba(0,255,0,.75)')
    gameCtx.lW(0.6)
    gameCtx.bP()
    gameCtx.moT(x+radius, y)
    gameCtx.a(x, y, radius, 0, PI2)
    gameCtx.st()
  }
}

function plotBox(box) {
  const radius = shipRadius*zoom/divScreen
  const [x, y] = relativeObjPos(box)
  gameCtx.s()
  gameCtx.tr(x, y)
  gameCtx.ro(frameNow/1000%PI2)
  if (DEBUG_MODE) {
    gameCtx.bP()
    gameCtx.moT(radius, 0)
    gameCtx.a(0, 0, radius, 0, PI2)
    gameCtx.sS('#08F')
    gameCtx.st()
  }
  gameCtx.fS('#852')
  gameCtx.bP()
  gameCtx.moT(radius*.7,-radius*.9)
  gameCtx.lT(radius*.9,-radius*.7)
  gameCtx.lT(radius*.9, radius*.9)
  gameCtx.lT(0, 0)
  gameCtx.f()
  gameCtx.fS('#631')
  gameCtx.bP()
  gameCtx.moT(-radius*.9, radius*.7)
  gameCtx.lT(-radius*.7, radius*.9)
  gameCtx.lT( radius*.9, radius*.9)
  gameCtx.lT(0, 0)
  gameCtx.f()
  gameCtx.fS('#A73')
  gameCtx.fR(-radius*.9,-radius*.9,radius*1.6,radius*1.6)
  // Name it
  gameCtx.ro(PI/4)
  gameCtx.fS('#421')
  gameCtx.font = `normal ${radius/3}px sans-serif`
  gameCtx.tA('center')
  gameCtx.fT('WEAPON', -radius/8, radius/8)
  gameCtx.re()
}

function plotMissile(missile) {
  const radius = (shipRadius/2)*zoom/divScreen
  const [x, y] = relativeObjPos(missile)
  gameCtx.s()
  gameCtx.tr(x, y)
  gameCtx.ro(missile.rot)
  // Fire
  // let grad = gameCtx.cRG(-radius*1.1,0, 1, -radius*1.2,0, radius/3)
  // grad.addColorStop(0, '#8FF')
  // grad.addColorStop(1, '#08F')
  // gameCtx.fS(grad)
  gameCtx.g(1,'fS', -radius*1.1,0, 1, -radius*1.2,0, radius/3, ['#8FF'], ['#08F'])
  gameCtx.bP()
  const bazierX = -radius*1.1
  gameCtx.moT(-radius*.9, 0)
  gameCtx.bCT(
    bazierX, -radius*.3,
    bazierX, -radius*.1,
    -radius*2, 0
  )
  gameCtx.bCT(
    bazierX, radius*.1,
    bazierX, radius*.3,
    -radius*.9, 0
  )
  gameCtx.f()
  // Wings and head
  gameCtx.bP()
  gameCtx.moT(-radius, 0)
  gameCtx.lT(-radius*.6, -radius/3)
  gameCtx.lT(0, 0)
  gameCtx.lT(-radius*.6,  radius/3)
  gameCtx.moT(radius, 0)
  gameCtx.a(radius*.8, 0, radius*.2, 0, PI2)
  gameCtx.fS('#888')
  gameCtx.f()
  // Body
  gameCtx.fS('#BBB')
  gameCtx.fR(-radius, -radius*.1, radius*1.6, radius*.2)
  gameCtx.re()
  if (DEBUG_MODE) {
    gameCtx.sS('rgba(0,255,0,.75)')
    gameCtx.lW(0.6)
    gameCtx.bP()
    gameCtx.moT(x+radius, y)
    gameCtx.a(x, y, radius, 0, PI2)
    const a = missile.velY/missile.velX
    const b = y - a*x
    gameCtx.moT(0, a*0 + b)
    gameCtx.lT(3000, a*3000 + b)
    gameCtx.st()
  }
}

function plotExplosion(boom) {
  const [x, y] = relativeObjPos(boom)
  const radius = boom.radius
  const viewRadius = (shipRadius/4) + radius*zoom/divScreen
  gameCtx.bP()
  gameCtx.a(x, y, viewRadius, 0, PI2)
  gameCtx.cP()
  gameCtx.sS(`rgba(255,${255-radius},0,${1-(radius/255)**2})`)
  gameCtx.lW(viewRadius*2 / (1+((radius/2)<shipRadius ? 0 : ((radius/2)-shipRadius)/4)))
  gameCtx.st()
  gameCtx.lW(1)
}
