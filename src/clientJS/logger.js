const _log = console.log
console.log = ()=> { throw Error('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') }

function log(...args) {
  _log((new Date).toJSON().replace(/.*T(.*)\..*/, '$1'), ...args)
}

function debug(...args) {
  if (DEBUG_MODE) log(...args)
}

function notify(msg) {
  log(msg)
  let el = document.createElement('div')
  el.innerText = msg
  msgList.appendChild(el)
  el.classList.add('new')
  setTimeout(()=> el.classList.remove('new'), 10)
  setTimeout(()=> el.classList.add('remove'), 12000)
  setTimeout(()=> msgList.removeChild(el), 13000)
}

const logErrToUsr = (title)=> (msg)=> notify(`🛑 ${title} ${msg}`)
