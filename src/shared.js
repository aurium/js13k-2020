"use strict";

const rnd = Math.random
const round = Math.round
const ceil = Math.ceil
const abs = Math.abs
const sign = Math.sign
const sin = Math.sin
const cos = Math.cos
const PI = Math.PI
const PI2 = PI*2
const sqrt = Math.sqrt
const mkID = ()=> rnd().toString(36).split('.')[1]
const upDalay = 100 // interval to the WebWorker send updates

function log(...args) {
  console.log((new Date).toJSON().replace(/.*T(.*)\..*/, '$1'), ...args)
}
