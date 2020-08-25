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
      if (BEAUTY_MODE) for (let i=0; i<ss; i++) {
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
