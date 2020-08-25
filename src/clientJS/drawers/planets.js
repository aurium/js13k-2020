function drawPlanet(planet, index) {
  planet.c1 = document.createElement('canvas'), // Base texture
  planet.c2 = document.createElement('canvas'), // Shadow texture
  planet.c3 = document.createElement('canvas'), // Light texture
  planet.c4 = document.createElement('canvas')  // Sun light and shadow
//   setTimeout(()=> delayedDrawPlanet(planet), (index+1)*100)
// }
//
// function delayedDrawPlanet(planet) {
  var {radius,a/*angulo rotação*/,d/*distancia*/,r,g,b,noize} = planet
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
  ctx1.arc(radius, radius, radius, 0, 2*PI)
  ctx1.closePath()
  ctx1.clip()
  ctx1.fillStyle = `rgb(${r},${g},${b})`
  ctx1.fillRect(0,0,radius*2,radius*2)
  if (BEAUTY_MODE) {
    const imgData = ctx1.getImageData(0, 0, radius*2, radius*2)
    const pixels = imgData.data
    pixels.forEach((c,i)=> pixels[i] = (i%4==3)? c : c-(rnd()-.5)*noize )
    ctx1.putImageData(imgData, 0, 0)
  }

  // Draw sun light/shadow mask:
  let grad = ctx4.createLinearGradient(0, 0, radius*2, 0)
  grad.addColorStop(0.0, '#A0A0A0')
  grad.addColorStop(0.3, '#909090')
  grad.addColorStop(0.7, '#606060')
  grad.addColorStop(1.0, '#505050')
  ctx4.fillStyle = grad
  ctx4.beginPath()
  ctx4.arc(radius, radius, radius, 0, 2*PI)
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
  ctx4.arc(radius, radius, radius, 0, 2*PI)
  ctx4.closePath()
  ctx4.fill()

  if (BEAUTY_MODE) for (let dist=10; dist<radius; dist+=5) {
    let numCrats = round((dist/15)*Math.log2(dist*6/radius))
    if (numCrats<1) numCrats = 1
    let z = sin(PI*(1-dist/radius)/2) // Inclinação da cratera. Achata na extremidade.
    repeat(numCrats, (i)=> { //setTimeout(()=> {
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
    }) //}, rnd()*7e4+15e3))
  }
}
planets.forEach(drawPlanet)

function plotPlanet(p) {
  const {rot, radius, a, d} = p
  const diameter = radius*2*zoom / divScreen
  const [x, y] = relativeObjPos({ x: cos(a)*d, y: sin(a)*d })
  const c = -radius*zoom / divScreen
  if (DEBUG_MODE) {
    gameCtx.strokeStyle = '#0F0'
    gameCtx.beginPath()
    gameCtx.rect(x-diameter/2, y-diameter/2, diameter, diameter)
    gameCtx.closePath()
    gameCtx.stroke()
  }
  gameCtx.save()
  gameCtx.translate(x, y)
  gameCtx.rotate(rot)
  // Plot base texture
  gameCtx.drawImage(p.c1, 0, 0, radius*2, radius*2, c, c, diameter, diameter)
  if (BEAUTY_MODE) {
    // Plot shadow texture
    gameCtx.drawImage(
      p.c2,
      0, 0,
      radius*2, radius*2,
      c-sin(rot-a-PI/2), c-cos(rot-a-PI/2),
      diameter, diameter
    )
    // Plot light texture
    gameCtx.drawImage(
      p.c3,
      0, 0,
      radius*2, radius*2,
      c+sin(rot-a-PI/2), c+cos(rot-a-PI/2),
      diameter, diameter
    )
    gameCtx.rotate(-rot)
    // Plot sun light and shadow
    gameCtx.rotate(a)
    gameCtx.globalCompositeOperation = 'overlay'
    gameCtx.drawImage(
      p.c4,
      0, 0,
      radius*2, radius*2,
      c, c,
      diameter, diameter
    )
  }
  gameCtx.restore()
}
