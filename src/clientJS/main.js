"use strict";

if (DEBUG_MODE) {
  window.setQuality = setQuality
  window.setZoom = (z)=> { targetZoom = z; targetZoomDelay = 10 }
}

socket.on('disconnect', () => {
  //notify('Disconnected from my Web Socket.')
  users.forEach(u => usrDisconn(u.userID, true));
  if (!gameStarted) users = [];
});
socket.on('usrsConn', (usrIDs) => usrsConn(usrIDs));
socket.on('usrDisconn', (userID) => usrDisconn(userID));

function usrsConn(usrIDs) {
  if (gameStarted) {
    usrIDs.forEach(userID => {
      if (users[userID] && isRoomOwner) users[userID].reconnect()
    })
  } else {
    // Init Client RTCPeerConnection:
    if (!clentRTC) clentRTC = new UserRTCClient(localStorage.userID, true)
    usrIDs.forEach(userID => {
      let usr = users[userID]
      if (!usr) {
        let Klass = isRoomOwner ? UserRTCHost : Player
        let usr = new Klass(userID)
        users.push(usr)
        users[userID] = usr
        sendUsersToWW()
      }
    })
  }
  debug(`WS Users connected: ${users.map(u=>u.userID).join(', ')}`)
  updateRoomList()
}

function usrDisconn(userID, lostMyWS) {
  if (!lostMyWS && DEBUG_MODE) notify(`WS User disconnected: ${userID}`)
  if (!gameStarted) {
    let usr = users[userID]
    if (usr && isRoomOwner) usr.disconnect()
    users = users.filter(u => u.userID != userID)
    users.forEach(u => users[u.userID] = u)
    sendUsersToWW()
  }
  updateRoomList()
}

function updateUsersStatus() {
  socket.emit('RTCStatus', users.map(u => [u.userID, u.connected]) )
}

socket.on('RTCStatus', (userStatuses) => {
  if (!isRoomOwner) userStatuses.forEach(([userID, conn]) => {
    users[userID].connected = conn
  })
  //if (gameStarted) xxx()
  if (!gameStarted) updateRoomList()
})

initDrawer()
