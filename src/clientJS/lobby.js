function updateRoomList() {
  roomsList.innerHTML = `
    <h2>Room ${socket.room} for ${numPlayers} players.</h2>
    <p>players:</p>
    <div id="players">${
      users
      .map(u => `<span class="${u.connected?'conn':''}">${u.userID}</span>`)
      .join(' &nbsp; ')
    }</div>
    <p id="chatNote">Press enter to chat.</p>
  `
  if (users.length == numPlayers && !users.find(u=>!u.connected)) {
    lobby.classList.add('hidden')
    setTimeout(gameStart, 500)
  }
}

if (queryString.match(/\bgame=/)) {
  // User is inside a game room.

  if (!gameStarted) {
    zoom = 0.2
    setTimeout(zoomIn, 1000)
    body.classList.add('lobby2')
  }

  window.addEventListener('keyup', ev => {
    if (ev.key == 'Enter') {
      let msg = prompt('Write a message to the other players:')
      if (msg) socket.emit('chat', msg)
    }
  })
  socket.on('chat', ({userID, msg})=> {
    notify('chat', userID+':', msg)
  })

  socket.on('youAreTheOwner', ()=> {
    isRoomOwner = true;
    notify("You'r the owner. Don't disconnect.")
  })

  socket.on('numPlayers', (num)=> {
    numPlayers = num;
  })

  socket.on('forgotingRoom', ()=> {
    debug("The server is forgoting this room.")
  })

} else {
  // User is in the public lobby.

  zoom = 0.8
  let a = PI
  setInterval(()=> {
    a -= 0.003
    playerX = cos(a) * 4000
    playerY = sin(a) * 1100
  }, 33)
  body.classList.add('lobby1')

  socket.on('rooms', (rooms)=> {
    if (rooms.length) {
      roomsList.innerHTML = '<p>Public rooms:</p>'
      rooms.forEach( ([id, num, tot]) => {
        let link = mkEl('a')
        link.href = '?game=' + id
        link.innerText = `Players: ${num} of ${tot}`
        roomsList.appendChild(link)
      })
    } else {
      roomsList.innerHTML = 'There are no public rooms yet.'
    }
  })

  let label = mkEl('label')
  label.style.fontWeight = 'bold'
  label.innerHTML = 'Create a new room:'
  lobby.appendChild(label)

  label = mkEl('label')
  label.innerText = 'Players:'
  lobby.appendChild(label)
  const inputNum = mkEl('input')
  inputNum.id = 'inputNum'
  inputNum.type = 'number'
  inputNum.min = 2
  inputNum.max = 10
  inputNum.value = 2
  label.appendChild(inputNum)

  label = mkEl('label')
  lobby.appendChild(label)
  const inputPub = mkEl('input')
  inputPub.type = 'checkbox'
  inputPub.checked = true
  label.appendChild(inputPub)
  label.appendChild(mkEl('span', 'Public'))

  const btCreate = mkEl('button')
  btCreate.id = 'btCreateRoom'
  btCreate.innerText = 'Create'
  lobby.appendChild(btCreate)
  btCreateRoom.onclick = ()=> {
    socket.emit('creteRoom', {num:inputNum.value, pub:inputPub.checked})
  }
  socket.on('romCreated', (gameID)=> {
    document.location.href = `?game=${gameID}${DEBUG_MODE?'&debug=on':''}`
  })
}
