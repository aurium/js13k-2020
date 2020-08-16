"use strict";

var gameStarted = false
var users = []
var clentRTC = null

socket.on('disconnect', () => {
  users.forEach(u => usrDisconn(u.userID));
  users = [];
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
      if (!usr) users.push( isRoomOwner ? new UserRTCHost(userID) : { userID } )
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
