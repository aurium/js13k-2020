const _log = console.log
console.log = ()=> { throw Error('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') }

function log(...args) {
  _log((new Date).toJSON().replace(/.*T(.*)\..*/, '$1'), ...args)
}

function debug(...args) {
  if (DEBUG_MODE) _log(...args)
}

function notify(...args) {
  let el = mkEl('div')
  msgList.appendChild(el)
  let logMsg = mkEl('div')
  el.appendChild(logMsg)

  let cssClass = 'info'
  if (args.length > 1) cssClass = args.shift()

  log(`Notify ${cssClass}:`, ...args)
  args.forEach(msg => logMsg.appendChild(mkEl('span', msg)))

  el.classList.add('new')
  logMsg.classList.add('logmsg', cssClass)

  setTimeout(()=> el.classList.remove('new'), 200)
  setTimeout(()=> el.classList.add('remove'), 15000)
  setTimeout(()=> msgList.removeChild(el), 18000)
}

function delayedTip(secs, msg) {
  setTimeout(()=> notify('tip', msg), secs*1000)
}

const logErrToUsr = (title)=> (msg)=> notify('error', title, msg)
