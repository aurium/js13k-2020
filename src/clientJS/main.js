"use strict";

var gameStarted = false
var users = []

socket.on('usrsConn', (usrIDs) => usrsConn(usrIDs));
socket.on('usrDisconn', (userID) => usrDisconn(userID));

function usrsConn(usrIDs) {
  //TODO
}

function usrDisconn(userID) {
  //TODO
}
