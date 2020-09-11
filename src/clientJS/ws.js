var socket = io({ upgrade: false, transports: ["websocket"] });

if (!(localStorage.userID||'').match(/\n/)) {
  let nick = prompt('Set your player name:')
  localStorage.userID = (nick ? nick+'\n' : 'unnamed-') + mkID()
}

socket.on('connect', () => {
  debug('Connected to the server');
  socket.emit('myID', localStorage.userID);
});

//socket.on('disconnect', () => notify('Server Connection lost!'));

//socket.on('error', (msg) => logErrToUsr('Server connection error! ' + msg));

socket.on('notify', (msg) => notify(msg));
//socket.on('notifyErr', logErrToUsr('Srv Error:'));
