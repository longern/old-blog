---
title: Peer to Peer Chatroom
categories:
  - demo
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.16/peer.min.js"></script>
### Introduction
This is a simple chatroom based on PeerJS. Share this link: <a id="p2p-chatroom-id"></a> to start.
<textarea readonly rows="15" class="form-control" id="p2p-chatroom-content"></textarea>
<form id="p2p-chatroom-form">
  <input autocomplete="off" class="form-control" id="p2p-chatroom-input">
  <input type="submit" style="display: none">
</form>
<script>
(function() {
  function onConnData(data) {
    var contentArea = document.getElementById('p2p-chatroom-content')
    contentArea.value += data + '\n'
    contentArea.scrollTop = contentArea.scrollHeight
    for (var i = 0; i < conns.length; i++) {
      if (conns[i] !== this && conns[i].open) {
        conns[i].send(data)
      }
    }
  }
  document.getElementById('p2p-chatroom-form').onsubmit = function() {
    var contentArea = document.getElementById('p2p-chatroom-content')
    var textToSend = document.getElementById('p2p-chatroom-input').value
    if (!textToSend) {
      return false
    }

    var onlineConns = conns.filter(conn => conn.open)
    if (onlineConns.length) {
      contentArea.value += textToSend + '\n'
    contentArea.scrollTop = contentArea.scrollHeight
      document.getElementById('p2p-chatroom-input').value = ""
    }
    for (var i = 0; i < onlineConns.length; i++) {
      onlineConns[i].send(textToSend)
    }
    return false
  }
  var peer = new Peer({
    port: 443,
    secure: true
  })
  var conns = []
  peer.on('open', function(id) {
    var idElement = document.getElementById('p2p-chatroom-id')
    var idLink = location.origin + location.pathname + '?peerid=' + id
    idElement.innerText = idLink
    idElement.href = idLink
  })
  peer.on('connection', function(conn) {
    conns.push(conn)
    conn.on('data', onConnData)
  })
  var peerIdMatch = location.search.match(/peerid=([\da-z]+)/)
  if (peerIdMatch) {
    var peerId = peerIdMatch[1]
    conn = peer.connect(peerId)
    conn.on('data', onConnData)
    conns.push(conn)
  }
})()
</script>
