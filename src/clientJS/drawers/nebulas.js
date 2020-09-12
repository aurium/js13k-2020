const seed = [
  '00F0 00F0 00F4 00F0 00F0 00F0       00F0 00F0 00F0 00F0',
  '00F2 00F8 0FFf 08F8 00F4 00F0          00F0',
  '00F0 00F4 00Ff 00F8 00F2 00F0          00F0',
  '00F0 00F0 00F0 00F0 00F0 00F0       F000 F000 F000 ',
  '        F000 F000 F000 F000 F000 F003 F000 ',
  '      F000 F000 F000 F004 F004 F001 F004 F001 F000 ',
  '      F000 F002 F404 F004 F000 F004 F002 F000 F000 ',
  '     F000 F000 F00f F80f F808 FF0F F008 F000 F000  ',
  '    F000 F000 F004 F00f F408 F000 FC08 F806 F002 F000  ',
  '    F000 F002 F008 F008 F004 F002 F002 F003 F000 F000  ',
  '   F000 F001 F004 F000 F000 F000 F000 F000 F000 F000   ',
  '   F000 F002 F000 F000    F000 F000 F000   ',
  '   F000 F000 F000    F080 F080 F084 F080 F000 F0F0 00F0',
  '         F0F0 F088 F0F4 F0F8 F0F4 00F2 00F0',
  '         F080 F0F0 F0F8 80FF 80F8 00F4 00F0',
  ' 00F0 00F0 00F0      F000 80F0 80F0 80F0 00F4 00F0 00F0',
]

function drawPlasma() {
  const ctx = canvBG3.getContext('2d')
  const size = canvBG3.width
  // if (size !== canvBG3.height || Math.log2(size) % 1 !== 0)
  //   throw Error('Canvas width and height must to be equal and power of 2.')
  seed = seed.map(l => l.split(' '))
  const seedSize = seed.length
  // if (seedSize !== seed[0].length || Math.log2(seedSize) % 1 !== 0)
  //   throw Error('Seed width and height must to be equal and power of 2.')
  const imgData = ctx.gID(0, 0, size, size)
  const pixels = imgData.data
  let step = size / seedSize
  for (let y=0; y<seedSize; y++) for (let x=0; x<seedSize; x++) {
    let pos = (y*step*size + x*step) * 4
    let color = seed[y][x].split('')
    for (let i=0; i<4; i++) pixels[pos+i] = parseInt(color[i]+color[i]||'00', 16)
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
