"use strict";

const eventPhase = []
eventPhase[Event.CAPTURING_PHASE] = 'CAPTURING_PHASE'
eventPhase[Event.AT_TARGET]       = 'AT_TARGET'
eventPhase[Event.BUBBLING_PHASE]  = 'BUBBLING_PHASE'

const logKind = (usr)=> isRoomOwner ? usr.kind : ''

class UserRTC {

  constructor(userID, isClient=false) {
    debug('Creating UserRTC', {userID, isClient})
    this.userID = userID
    this.isClient = isClient
    this.connected = false
    this.initICE()
    if (!isRoomOwner || !isClient) {
      createConnDisplay.bind(this)()
      this.updateDisplayInterval = setInterval(updateConnDisplay.bind(this), 200)
    }
    this.init()
  }

  get kind() {
    return this.isClient ? 'CLIENT' : 'HOST'
  }

  initICE() {
    debug(`${logKind(this)} Start ICE with ${this.userID}...`)
    createRTCPeerConnection(this)
    if (this.isClient) {
      this.peerConn.ondatachannel = (event)=> {
        debug(logKind(this), 'Hellow client dataChannel!');
        this.dataChannel = event.channel;
        initDataChannel(this);
      };
    } else {
      // I'm the room owner and this is one of my clients peerConn.
      this.dataChannel = this.peerConn.createDataChannel('game', {
        ordered: true,
        maxRetransmits: 1
      });
      initDataChannel(this);
      debug(`${logKind(this)} Create ICE offer to ${this.userID}...`)
      this.peerConn.createOffer()
      .then(onLocalSessionCreated.bind(this))
      .catch(logErrToUsr(`${logKind(this)} Create Offer to ${this.userID} FAIL.`));
    }
  }

  reconnect() {
    if (!this.connected) this.initICE()
  }

  disconnect() {
    this.peerConn.close()
    this.peerConn = null
    clearInterval(this.updateDisplayInterval)
    removeConnDisplay.bind(this)()
    if (this.onDisconnect) this.onDisconnect()
  }

  send(cmd, payload=null) {
    try {
      this.dataChannel.send(
        JSON.stringify([cmd, {userID:this.userID, payload}])
      )
    } catch(err) {
      debug(`Send "${cmd}" by RTC fail.`, err)
    }
  }

  cmd_connected({userID}) {
    if (userID == this.userID) this.connected = true
    else return logErrToUsr(`${logKind(this)} Bad Conn confirmation.`)(userID+'≠'+this.userID)
    if (isRoomOwner) notify(`${logKind(this)} ${this.userID} is connected.`)
    else notify(`You're Connected!`)
    updateUsersStatus()
  }

}


class UserRTCHost extends UserRTC {
  init() {
    debug('UserRTC Host created.', this.userID)
  }
  cmd_fireIsOn({userID, payload}) {
    sendWWCmd('fireIsOn', [userID, payload])
  }
  cmd_rotJet({userID, payload}) {
    sendWWCmd('rotJet', [userID, payload])
  }
  cmd_misOn({userID, payload}) {
    sendWWCmd('misOn', [userID, payload])
  }
}


class UserRTCClient extends UserRTC {
  init() {
    debug('UserRTC Client created.', this.userID)
  }
  cmd_update({userID, payload}) {
    updateFromRTC(payload)
  }
  cmd_winner({userID, payload}) {
    winner = payload
    if (users[winner] === mySelf) youWin.className = 'show'
    targetZoom = .3
  }
}


function onLocalSessionCreated(desc) {
  debug(`${this.kind} offer created to ${this.userID}:`, desc.sdp.replace(/.*(ice-pwd:[^\s]+).*/sm, '$1'));
  this.peerConn.setLocalDescription(desc)
  .then(()=> {
    debug(this.kind, 'Sending local desc...');
    debug(`${this.kind} is sending:`, this.peerConn.localDescription)
    socket.emit('peeringMessage', {
      FROM: 'setLocalDescription',
      fromClient: this.isClient,
      userID: this.userID,
      ...this.peerConn.localDescription.toJSON()
    });
  })
  .catch(logErrToUsr(`Set Local Description to ${logKind(this)} ${this.userID} FAIL.`));
}

function createConnDisplay() {
  this.display = mkEl('div', connStatus);
  [
    ['User', 'userID'],
    ['Signal', 'signalingState'],
    ['ICE', 'iceConnectionState'],
    ['Gathering', 'iceGatheringState'],
    ['Connected', 'connected']
  ].forEach(([label, key])=> {
    if (!this.isClient || key != 'userID') {
      const el = mkEl('span', this.display, label + ': ')
      this.display[key] = mkEl('span', el, '...')
    }
  })
}

function removeConnDisplay() {
  connStatus.removeChild(this.display)
}

function updateConnDisplay() {
  if (this.peerConn) {
    if (!this.isClient) this.display.userID.innerText = this.userID
    this.display.signalingState.innerText = this.peerConn.signalingState
    this.display.iceConnectionState.innerText = this.peerConn.iceConnectionState
    this.display.iceGatheringState.innerText = this.peerConn.iceGatheringState
    this.display.connected.innerText = this.connected
  }
}

function createRTCPeerConnection(usr) {
  usr.peerConn = new RTCPeerConnection({
    iceServers: [
      {urls: `stun:stun${Math.floor(rnd()*5)||''}.l.google.com:19302`}
    ]
  });
  usr.peerConn.usr = usr

  usr.peerConn.onicecandidate = (ev)=> {
    if (ev.candidate) {
      debug(usr.kind, `ICE Candidate for ${usr.userID}:`, ev.candidate.candidate);
      socket.emit('peeringMessage', {
        FROM: 'onicecandidate',
        fromClient: usr.isClient,
        userID: usr.userID,
        type: 'candidate',
        sdpMLineIndex: ev.candidate.sdpMLineIndex,
        sdpMid: ev.candidate.sdpMid,
        candidate: ev.candidate.candidate
      });
    } else {
      debug(usr.kind, `End of ${usr.userID} candidates.`);
    }
  }

  const testICEConnectionState = (ev)=> {
    if (!usr.peerConn) return;
    if (DEBUG_MODE && ev) debug('ON ICE Connection State Change', usr.userID, usr.peerConn.iceConnectionState)
    if (usr.peerConn.iceConnectionState === 'failed') {
      notify(`WebRTC connection fail to ${usr.userID}. Let's try again!`)
      // TODO...
    }
  }
  setTimeout(testICEConnectionState.bind(usr), 1000)
  usr.peerConn.oniceconnectionstatechange = testICEConnectionState

  if (DEBUG_MODE) {
    usr.peerConn.ontrack = ev =>
      debug('ON Track', usr.userID, ev)
    usr.peerConn.onnegotiationneeded = ev =>
      debug('ON Negotiation Needed', usr.userID, ev)
    usr.peerConn.onremovetrack = ev =>
      debug('ON Remove Track', usr.userID, ev)
    usr.peerConn.onicegatheringstatechange = ev =>
      debug('ON ICE Gathering State Change', usr.userID, usr.peerConn&&usr.peerConn.iceGatheringState)
    usr.peerConn.onsignalingstatechange = ev =>
      debug('ON Signaling State Change', usr.userID, usr.peerConn&&usr.peerConn.signalingState)
  }
}

function getUserRTC(userID) {
  return users.find(u => u.userID === userID);
}

socket.on('peeringMessage', function(message) {
  const userID = (message||{}).userID
  debug(
    `WS socket received message from ${userID}:`,
    message && (message.type||'<no type>', message)
  );
  if (!message) return null;
  const badMsgLog = logErrToUsr('Bad peering message.')
  if (!userID) return badMsgLog('No userID.');
  var usr = clentRTC;
  if (message.fromClient) usr = getUserRTC(userID);
  if (!usr) return badMsgLog(`There is no user "${userID}".`);

  delete message.fromClient
  delete message.userID

  if (message.type === 'offer') {
    notify(`${logKind(this)} Got offer from ${userID}. Sending answer to peer.`);
    usr.peerConn.setRemoteDescription(new RTCSessionDescription(message))
    .then(()=> notify(`Remote Description Set Ok for ${userID}.`))
    .catch(logErrToUsr(`Remote Description Set FAIL for ${userID}.`));
    usr.peerConn.createAnswer()
    .then(onLocalSessionCreated.bind(usr))
    .catch(logErrToUsr('Answer FAIL'));

  } else if (message.type === 'answer') {
    notify(`${usr.kind} got peer answer from ${userID}!`);
    usr.peerConn.setRemoteDescription(new RTCSessionDescription(message))
    .then(()=> notify(`Remote Description Set Ok for ${userID}.`))
    .catch(logErrToUsr(`Remote Description Set FAIL for ${userID}.`));

  } else if (message.type === 'candidate') {
    debug(`${usr.kind} got identity candidate from ${userID}:`, message.candidate)
    usr.peerConn.addIceCandidate(message)
    .catch((err)=> {
      logErrToUsr(`Add ICE Candidate FAIL for ${userID}.`)(err)
      // TODO: restart negotiation
    });
  }
});

function initDataChannel(usr) {
  usr.dataChannel.onopen = ()=> {
    notify(`${logKind(usr)} ${usr.userID}'s Channel Opened!`);
    usr.send('connected')
  }
  usr.dataChannel.onclose = ()=> {
    notify(`${usr.userID}'s Channel closed.`);
    usr.connected = false;
    updateUsersStatus()
  }
  usr.dataChannel.onmessage = (ev)=> {
    const [cmd, payload] = JSON.parse(ev.data)
    //debug(usr.kind, `Got game cmd ${cmd} payload:`, payload)
    if (usr['cmd_'+cmd]) usr['cmd_'+cmd](payload)
    else logErrToUsr('Bad game command:')(cmd)
  }
}
