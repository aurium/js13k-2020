var socket = io({ upgrade: false, transports: ["websocket"] });

if (!localStorage.userID) localStorage.userID = mkID()

socket.on('connect', () => {
  notify('Conected to the server');
  socket.emit('myID', localStorage.userID);
  if (queryString.match(/\bgame=/)) {
    socket.room = queryString.replace(/.*\bgame=([^&]*).*/, '$1')
    socket.emit('join', socket.room)
  }
});

socket.on('disconnect', () => notify('Server Connection lost!'));

socket.on('error', (msg) => logErrToUsr('Server connection error! ' + msg));

socket.on('notify', (msg) => notify(msg));
socket.on('notifyErr', logErrToUsr('Srv Error:'));
