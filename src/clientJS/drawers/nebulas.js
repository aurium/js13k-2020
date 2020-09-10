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

function drawPlasma(seed) {
  const ctx = canvBG3.getContext('2d')
  const size = canvBG3.width
  if (size !== canvBG3.height || Math.log2(size) % 1 !== 0)
    throw Error('Canvas width and height must to be equal and power of 2.')
  seed = [...seed.map(l => l.replace(/\./g, '0').split(' '))]
  const seedSize = seed.length
  if (seedSize !== seed[0].length || Math.log2(seedSize) % 1 !== 0)
    throw Error('Seed width and height must to be equal and power of 2.')
  const imgData = ctx.gID(0, 0, size, size)
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
  while (step > 1 && BEAUTY_MODE) {
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
  ctx.pID(imgData, 0, 0)
  if (DEBUG_MODE) {
    ctx.fS('green')
    ctx.fT('Nebulas', 50, 50)
  }
}
