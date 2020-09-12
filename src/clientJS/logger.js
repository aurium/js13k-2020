function debug(...args) {
  if (DEBUG_MODE) log(...args)
}

function notify(msg) {
  let el = mkEl('div', msgList)
  let logMsg = mkEl('div', el, msg)
  el.classList.add('new')
  logMsg.classList.add('logmsg')

  setTimeout(()=> el.classList.remove('new'), 200)
  setTimeout(()=> el.classList.add('remove'), 20000)
  setTimeout(()=> msgList.removeChild(el), 23000)
}

// function delayedTip(secs, msg) {
//   setTimeout(()=> notify('tip', msg), secs*1000)
// }

//const logErrToUsr = (title)=> (msg)=> notify('error', title, msg)
