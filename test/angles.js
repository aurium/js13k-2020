assertEqual = require('assert').equal
PI = Math.PI
abs = Math.abs
sign = Math.sign
PI2 = PI*2
PIq = PI/4

counter = 0
function testDifAngles(a1, a2, expected) {
  counter++
  val = difAngles(a1, a2).toFixed(3)
  expected = expected.toFixed(3)
  if (val == expected) process.stdout.write('.')
  else {
    console.log(`!\nTest ${counter} fails.`)
    throw Error(`difAngles(${a1.toFixed(3)}, ${a2.toFixed(3)}) => ${val} is not equal to ${expected}.`)
  }
}

function difAngles(a1, a2) {
  let dif1 = ((a2 - a1) + PI) % PI2 - PI
  let dif2 = -((a1 - a2) + PI) % PI2 + PI
  return (abs(dif1) < abs(dif2)) ? dif1 : dif2
}

testDifAngles( 0,    0,   0)
testDifAngles( PIq,  PIq, 0)
testDifAngles(-PIq, -PIq, 0)
testDifAngles(-.1,  -.1,  0)
testDifAngles(+.1,  +.1,  0)

testDifAngles(-.1, +.1, +.2)
testDifAngles(+.1, -.1, -.2)

testDifAngles(0,  PIq,  PIq)
testDifAngles(0, -PIq, -PIq)

testDifAngles( PIq, 0, -PIq)
testDifAngles(-PIq, 0,  PIq)

testDifAngles( PI-PIq,  PIq, -PI/2)
testDifAngles( PI+PIq, -PIq,  PI/2)
testDifAngles(-PI+PIq, -PIq,  PI/2)

testDifAngles(PI,  PIq, -PIq*3)
testDifAngles(PI, -PIq,  PIq*3)

testDifAngles(PIq, PI/2,  PIq)
testDifAngles(PIq, -PIq, -PI/2)

testDifAngles( PI-.1,  PI,  .1)
testDifAngles( PI-.1, -PI,  .1)
testDifAngles(-PI+.1,  PI, -.1)
testDifAngles(-PI+.1, -PI, -.1)

testDifAngles( PI,  PI-.1, -.1)
testDifAngles(-PI, -PI+.1,  .1)

testDifAngles( PI-.1, -PI+.1,  .2)
testDifAngles(-PI+.1,  PI-.1, -.2)

testDifAngles( PI2-.1, -PI2+.1,  .2)
testDifAngles(-PI2+.1,  PI2-.1, -.2)

testDifAngles( PI2*3+.1, -.1, -.2)
testDifAngles(-PI2*3-.1,  .1,  .2)

console.log('Ok')
