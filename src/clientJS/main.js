"use strict";

socket.on('disconnect', () => {
  users.forEach(u => usrDisconn(u.userID));
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
      let usr = getUserRTC(userID)
      if (!usr) {
        let Klass = isRoomOwner ? UserRTCHost : Player
        users.push( new Klass(userID) )
      }
      else if (usr.reconnect) usr.reconnect()
    })
  }
  debug(`WS Users connected: ${users.map(u=>u.userID).join(', ')}`)
  updateRoomList()
}

function usrDisconn(userID) {
  debug(`WS User disconnected: ${userID}`)
  if (!gameStarted) {
    let usr = getUserRTC(userID)
    if (usr && isRoomOwner) usr.disconnect()
    users = users.filter(u => u.userID != userID)
  }
  updateRoomList()
}

function updateUsersStatus() {
  socket.emit('RTCStatus', users.map(u => [u.userID, u.connected]) )
}

socket.on('RTCStatus', (userStatuses) => {
  if (!isRoomOwner) userStatuses.forEach(([userID, conn]) => {
    getUserRTC(userID).connected = conn
  })
  if (gameStarted) xxx()
  else updateRoomList()
})
