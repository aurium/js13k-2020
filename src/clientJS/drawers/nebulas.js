const seed = [
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

function drawPlasma() {
  const ctx = canvBG3.getContext('2d')
  const size = canvBG3.width
  // if (size !== canvBG3.height || Math.log2(size) % 1 !== 0)
  //   throw Error('Canvas width and height must to be equal and power of 2.')
  seed = seed.map(l => l.replace(/\./g, '0').split(' '))
  const seedSize = seed.length
  // if (seedSize !== seed[0].length || Math.log2(seedSize) % 1 !== 0)
  //   throw Error('Seed width and height must to be equal and power of 2.')
  const imgData = ctx.gID(0, 0, size, size)
  const pixels = imgData.data
  let step = size / seedSize
  for (let y=0; y<seedSize; y++) for (let x=0; x<seedSize; x++) {
    let pos = (y*step*size + x*step) * 4
    let color = seed[y][x].split('')
    for (let i=0; i<4; i++) pixels[pos+i] = parseInt(color[i]+color[i], 16)
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
      let rndM = [rnd(), rnd(), rnd()]
      for (let cc=0; cc<4; cc++) { // cc means Color Component
        let center = pixels[pos+cc]
        let up = pixels[posUp+cc]
        let left = pixels[posLeft+cc]
        pixels[posMUp+cc] = (center*rndM[0] + up*(1-rndM[0]))
        pixels[posMLeft+cc] = (center*rndM[1] + left*(1-rndM[1]))
        pixels[posMUL+cc] = (left*rndM[2] + up*(1-rndM[2]))*0.67 + center*0.33
      }
    }
    step /= 2
  }
  ctx.pID(imgData, 0, 0)
  if (DEBUG_MODE) {
    ctx.fS('green')
    ctx.fT('Nebulas', 50, 50)
  }
}
