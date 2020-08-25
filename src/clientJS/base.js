"use strict";

const body = document.body
const bodyClass = body.classList
const queryString = document.location.search.substr(1);

const DEBUG_MODE = !!queryString.match(/\bdebug=on/);
const BEAUTY_MODE = !queryString.match(/\braw=on/);

if (DEBUG_MODE) bodyClass.add('debug')
const mkEl = (tag, txt='')=> {
  const el = document.createElement(tag)
  el.appendChild(document.createTextNode(txt))
  return el
}

function repeat(num, func) {
  for (let i=0; i<num; i++) func(i)
}

var gameStarted = false
var users = []
var clentRTC = null

var isRoomOwner = false
var numPlayers = 0
var mySelf = { x:0, y:0, velX:0, velY:0, rot:0, rotInc:0 }

const QUALITY = { GARBAGE: 1, LOW: 2, MEDIUM: 3, HIGH: 4 }
var quality = 0
var zoom = 2
var targetZoom = 2
var targetZoomDelay = 10

const shipRadius = 30
const shipRadiusWithFire = 60
