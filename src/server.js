"use strict";

const log = console.log
const rooms = {}

function forgotThisRoom(gameID, minutes) {
  setTimeout(()=>{
		if (rooms[gameID]) {
      log(`Forgot room ${gameID}, after ${minutes} minutes.`)
			rooms[gameID].emit('forgotingRoom')
			delete rooms[gameID]
		}
	}, minutes*60*1000)
}

class Room {

	constructor(gameID, ownerSocket, numPlayers, isPublic) {
    this.gameID = gameID
		forgotThisRoom(this.gameID, 30)
		log(`Usr ${ownerSocket.userID} is creating room ${this.gameID} for ${numPlayers}. isPublic: ${isPublic}`)
		numPlayers = parseInt(numPlayers)
		if (!numPlayers || 2 > numPlayers || numPlayers > 10) {
			ownerSocket.emit('notifyErr', `The number of players must to be between 2 and 10`)
			log(`numPlayers fail to ${this.gameID}.`)
			return
		}
		this.players = []
		this.ownerID = ownerSocket.userID
		this.numPlayers = numPlayers
    this.isPublic = isPublic
		rooms[this.gameID] = this
		ownerSocket.emit('romCreated', this.gameID)
		this.addPlayer(ownerSocket)
	}

	addPlayer(socket) {
		log(`Adding ${socket.userID} to ${this.gameID}...`)
		if (this.players.length >= this.numPlayers) {
			log(`Fail. The room ${this.gameID} is full.`)
			return socket.emit('notifyErr', `The room ${this.gameID} is full.`)
		}

    this.players.push(socket)
		socket.join(this.gameID)
    socket.room = this
		log(`The room ${this.gameID} now have ${this.players.length} players.`)
    socket.emit('notify', 'You was added to the room ' + this.gameID)

    if (this.players.length == this.numPlayers) {
      // It is full!
      log(`The room ${this.gameID} is full! Removing it from public lobby.`)
      // Remove from public rooms list.
      this.isPublic = false
			// Forgot this room after some time.
      forgotThisRoom(this.gameID, 60)
		}

    socket.emit('numPlayers', this.numPlayers)

		// Allows to update the owner socket on page reload and other shit:
		if (socket.userID == this.ownerID) {
			this.owner = socket
			socket.emit('youAreTheOwner')
		}

    // Let everyone knows who is here:
		this.emit('usrsConn', this.players.map(s=>s.userID))
	}

	disconnect(socket) {
		this.players = this.players.filter(s => s.id != socket.id)
		this.emit('usrDisconn', socket.userID)
	}

  getPlayer(userID) {
    return this.players.find(s => s.userID == userID)
  }

	emit(cmd, msg) {
		io.to(this.gameID).emit(cmd, msg)
	}

  emitTo(userID, cmd, msg) {
    const usr = this.getPlayer(userID)
    if (usr) usr.emit(cmd, msg)
  }

}

module.exports = {

	io: (socket) => {

		socket.on('myID', (id)=> {
			socket.userID = id
			log(`Socket ${socket.id} is user ${id}.`);
		});

    socket.on('creteRoom', ({num, pub})=> {
			new Room(mkID(), socket, num, pub)
		});

    socket.on('join', (gameID) => {
			if (rooms[gameID]) rooms[gameID].addPlayer(socket)
			else socket.emit('notifyErr', `The room "${gameID}" do not exists.`)
		});

		socket.on('disconnect', () => {
			log('Disconnected: ' + (socket.userID || socket.id));
			if (socket.room) socket.room.disconnect(socket)
      clearInterval(updateLobbyInterval)
		});

    let updateLobbyInterval = setInterval(()=> {
      if (!socket.room) {
        socket.emit('rooms',
          Object.values(rooms)
                .filter(r => r.isPublic && r.players.length)
                .map(r => [r.gameID, r.players.length, r.numPlayers])
        )
      }
      else clearInterval(updateLobbyInterval)
    }, 2000)

		log(`Socket ${socket.id} connected.`);
	},

};
