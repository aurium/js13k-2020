function drawPlanet(planet, index) {
  var {radius,a/*angulo rotação*/,d/*distancia*/,r,g,b,noize} = planet
  const diameter = radius*2
  ;['c1','c2','c3','c4'].forEach(c => {
    planet[c] = document.createElement('canvas')
    planet[c].width = diameter
    planet[c].height = diameter
    body.appendChild(planet[c])
  })
  const ctx1 = planet.c1.getContext('2d')
  const ctx2 = planet.c2.getContext('2d')
  const ctx3 = planet.c3.getContext('2d')
  const ctx4 = planet.c4.getContext('2d')

  // Draw round base planet texture:
  ctx1.bP()
  ctx1.a(radius, radius, radius-1, 0, PI2)
  ctx1.cP()
  ctx1.clip()
  ctx1.fS(`rgb(${r},${g},${b})`)
  ctx1.fR(0,0,diameter,diameter)

  if (BEAUTY_MODE) {
    const imgData = ctx1.gID(0, 0, diameter, diameter)
    const pixels = imgData.data
    pixels.forEach((c,i)=> pixels[i] = (i%4==3)? c : c-(rnd()-.5)*noize )
    ctx1.pID(imgData, 0, 0)
  }

  // Draw sun light/shadow mask:
  ctx4.fS('#FFF')
  ctx4.fR(0,0,diameter,diameter)
  // let grad = ctx4.cRG(
  //   radius*0.5, radius, radius*0.2,
  //   radius*0.8, radius, radius*1.2
  // )
  // grad.addColorStop(0, 'rgba(255,255,255, 0)')
  // grad.addColorStop(1, 'rgba(  1,  1,  1, 1)')
  // ctx4.fS(grad)
  ctx4.g(1, 'fS',
    radius*0.5, radius, radius*0.2,
    radius*0.8, radius, radius*1.2,
    ['rgba(255,255,255, 0)'], ['rgba(  1,  1,  1, 1)']
  )
  ctx4.bP()
  ctx4.a(radius, radius, radius, 0, PI2)
  ctx4.cP()
  ctx4.f()

  if (BEAUTY_MODE) for (let dist=10; dist<radius; dist+=5) {
    let numCrats = round((dist/15)*Math.log2(dist*6/radius))
    if (numCrats<1) numCrats = 1
    let z = sin(PI*(1-dist/radius)/2) // Inclinação da cratera. Achata na extremidade.
    repeat(numCrats, (i)=> {
      let rndRotate = rnd()*PI2
      let rCratY = 2+rnd()*8 * (z+0.5);
      let rCratX = rCratY * z;
      [
        [ctx2, `rgba(${r/2},${g/2},${b/2},${(z*2+1)/3})`],
        [ctx3, `rgba(255,255,255,${(z*2+1)/11})`]
      ].forEach(([ctx, strokeStyle]) => {
        ctx.s()
        ctx.tr(radius, radius)
        //ctx.ro(i*0.1) // debug
        ctx.ro(rndRotate)
        //rCratX = rCratY = 2 // debug
        // Remove a possible border intersection:
        ctx.gCO('destination-out')
        ctx.fS('#000')
        ctx.bP()
        ctx.ellipse(dist, 0, rCratX, rCratY, 0, 0, 360)
        ctx.cP()
        ctx.f()
        // Draw the border:
        ctx.gCO('source-over')
        ctx.lW(1)
        ctx.sS(strokeStyle)
        ctx.bP()
        ctx.ellipse(dist, 0, rCratX, rCratY, 0, 0, 360)
        ctx.cP()
        ctx.st()
        ctx.re()
      })
    })
  }
}
planets.forEach(drawPlanet)

function plotPlanet(p) {
  const {rot, radius, a, d} = p
  const diamOrig = radius*2
  const diamDest = diamOrig*zoom / divScreen
  //const [x, y] = relativeObjPos({ x: cos(a)*d, y: sin(a)*d })
  const [x, y] = relativeObjPos(p)
  const c = -radius*zoom / divScreen
  if (DEBUG_MODE) {
    gameCtx.sS('#0F0')
    gameCtx.bP()
    gameCtx.rect(x-diamDest/2, y-diamDest/2, diamDest, diamDest)
    gameCtx.cP()
    gameCtx.st()
  }
  gameCtx.s()
  gameCtx.tr(x, y)
  // Plot base texture
  gameCtx.ro(rot)
  gameCtx.dI(p.c1, 0, 0, diamOrig, diamOrig, c, c, diamDest, diamDest)
  if (BEAUTY_MODE) {
    // Plot shadow texture
    gameCtx.dI(
      p.c2,
      0, 0,
      diamOrig, diamOrig,
      c-sin(rot-a-PI/2), c-cos(rot-a-PI/2),
      diamDest, diamDest
    )
    // Plot light texture
    gameCtx.dI(
      p.c3,
      0, 0,
      diamOrig, diamOrig,
      c+(divScreen>1?0:sin(rot-a-PI/2)), c+(divScreen>1?0:cos(rot-a-PI/2)),
      diamDest, diamDest
    )
    gameCtx.ro(-rot)
    // Plot sun light and shadow
    gameCtx.ro(a)
    gameCtx.gCO('multiply')
    gameCtx.dI(
      p.c4,
      0, 0,
      diamOrig, diamOrig,
      c, c,
      diamDest, diamDest
    )
  }
  gameCtx.re()
}
