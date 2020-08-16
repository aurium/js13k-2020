const body = document.body
const queryString = document.location.search.substr(1)
const DEBUG_MODE = !!queryString.match(/\bdebug=on/)
if (DEBUG_MODE) body.classList.add('debug')
const mkEl = (tag, txt='')=> {
  const el = document.createElement(tag)
  el.appendChild(document.createTextNode(txt))
  return el
}
var isRoomOwner = false
var numPlayers = 0
