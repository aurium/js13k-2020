"use strict";

setTimeout(()=> {
  roomsList.innerHTML = 'Loading...'
}, 100)

function updateRoomList() {
  roomsList.innerHTML = `
    <h2>Room ${socket.room} for ${numPlayers} players</h2>
    <div id="players">${
      users
      .map(u => `<span class="${u.connected?'conn':''}">${getName(u)}</span>`)
      .join(' &nbsp; ')
    }</div>
    <p id="chatNote">Press enter to chat.</p>
  `
  if (users.length == numPlayers && !users.find(u=>!u.connected)) {
    setTimeout(gameStart, 500)
  }
}

if (queryString.match(/\bgame=/)) {
  // User is inside a game room.
  currentLobby = 2
  targetZoom = 0.3

  //if (!gameStarted) bodyClass.add('lobby2')

  socket.room = queryString.replace(/.*\bgame=([^&]*).*/, '$1')
  socket.emit('join', socket.room)
  socket.on('roomNotFound', (gameID)=> {
    notify(`The room "${gameID}" do not exists.`)
    setTimeout(()=>
      document.location.href = document.location.href.replace(/game=[^&]*/, '')
    , 2000)
  })


  window.addEventListener('keyup', ev => {
    if (ev.key == 'Enter') {
      chatInput.className = 'show'
      chatInput.focus()
    }
  })
  chatInput.addEventListener('keydown', ev => ev.stopPropagation())
  chatInput.addEventListener('keyup', ev => {
    ev.stopPropagation()
    if (ev.key == 'Enter') {
      if (chatInput.value) socket.emit('chat', chatInput.value)
      chatInput.value = chatInput.className = ''
      chatInput.blur()
    }
  })
  socket.on('chat', ({userID, msg})=> {
    notify(getName(userID)+': '+msg)
  })

  socket.on('youAreTheOwner', ()=> {
    isRoomOwner = true;
    notify("You're the owner. Don't disconnect.")
    startHostWebWorker()
  })

  socket.on('numPlayers', (num)=> {
    numPlayers = num;
  })

  // socket.on('forgotingRoom', ()=> {
  //   debug("The server is forgoting this room.")
  // })

} else {
  // User is in the public lobby.

  zoom = 0.666
  targetZoomDelay = 500
  let a = PI/2
  setInterval(()=> {
    a -= 0.001
    targetZoom = (sign(cos(a)) != sign(sin(a))) ? 0.25 : 0.05
    mySelf.x = (mySelf.x*49 + cos(a) * 6000) / 50
    mySelf.y = (mySelf.y*49 + sin(a) * 2500) / 50
  }, 33)
  //bodyClass.add('lobby1')

  socket.on('rooms', (rooms)=> {
    if (rooms.length) {
      roomsList.innerHTML = '<p>Public rooms:</p>'
      rooms.forEach( ([id, num, tot]) => {
        let link = mkEl('a', roomsList)
        link.href = `?game=${id}${DEBUG_MODE?'&debug=on':''}`
        link.innerText = `Players: ${num} of ${tot}`
      })
    } else {
      roomsList.innerHTML = 'There are no public rooms yet.'
    }
  })

  let label = mkEl('label', lobby)
  label.style.fontWeight = 'bold'
  label.innerHTML = 'Create a new room:'

  label = mkEl('label', lobby)
  label.innerText = 'Players:'
  const inputNum = mkEl('input', lobby)
  inputNum.id = 'inputNum'
  inputNum.type = 'number'
  inputNum.min = 2
  inputNum.max = 10
  inputNum.value = 2

  label = mkEl('label', lobby)
  const inputPub = mkEl('input', lobby)
  inputPub.type = 'checkbox'
  inputPub.checked = true
  mkEl('span', lobby, 'Public')

  const btCreate = mkEl('button', lobby, 'Create')
  btCreate.id = 'btCreateRoom'
  btCreate.onclick = ()=> {
    socket.emit('creteRoom', {num:inputNum.value, pub:inputPub.checked})
    lobby.classList.add('hidden')
  }
  socket.on('romCreated', (gameID)=> {
    document.location.href = `?game=${gameID}`
  })
}
