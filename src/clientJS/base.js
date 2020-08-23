const body = document.body
const queryString = document.location.search.substr(1);

const DEBUG_MODE = !!queryString.match(/\bdebug=on/);

if (DEBUG_MODE) body.classList.add('debug')
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
var mySelf = { x:0, y:999 }

const QUALITY = { GARBAGE: 1, LOW: 2, MEDIUM: 3, HIGH: 4 }
var quality = 0
var zoom = 1

const shipRadius = 30
const shipRadiusWithFire = 60
