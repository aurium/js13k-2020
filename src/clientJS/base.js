"use strict";

const body = document.body
const bodyClass = body.classList
const queryString = document.location.search.substr(1);

const DEBUG_MODE = !!queryString.match(/\bdebug=on/);
const BEAUTY_MODE = !queryString.match(/\braw=on/);

if (DEBUG_MODE) bodyClass.add('debug')
const mkEl = (tag, parent, txt='')=> {
  const el = document.createElement(tag)
  el.appendChild(document.createTextNode(txt))
  parent.appendChild(el)
  return el
}

const canvasCtxProto = CanvasRenderingContext2D.prototype
Object.keys(canvasCtxProto).sort().forEach(fName => {
  let sigla = fName[0] + fName.replace(/[^A-Z]/g, '')
  if (canvasCtxProto[sigla]) sigla = fName[0] + fName[1] + fName.replace(/[^A-Z]/g, '')
  try {
    if (typeof(canvasCtxProto[fName]) == 'function') {
      canvasCtxProto[sigla] = canvasCtxProto[fName]
    }
    else throw 1
  } catch (err) {
    canvasCtxProto[sigla] = function (val){ this[fName] = val }
  }
  if (DEBUG_MODE) log(`${sigla} -> ${fName}`)
})

function getName(user) {
  return (user.userID ? user.userID : user).split('\n')[0]
}

function repeat(num, func) {
  for (let i=0; i<num; i++) func(i)
}

var currentLobby = 1
var gameStarted = false
var users = []
var clentRTC = null

var isRoomOwner = false
var numPlayers = 0
var mySelf = { x:3e3, y:0, velX:0, velY:0, rot:0, rotInc:0 }

const QUALITY = { GARBAGE: 1, LOW: 2, MEDIUM: 3, HIGH: 4 }
var quality = 0
var zoom = 0.05
var targetZoom = 2
var targetZoomDelay = 10

const shipRadius = 30
const shipRadiusWithFire = 60
const speedLim = sqrt(7*7 + 7*7)
