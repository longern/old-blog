---
title: Peer to Peer Chatroom
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.16/peer.min.js"></script>
### Introduction
This is a simple chatroom based on PeerJS. Share this link: <a id="p2p-chatroom-id"></a> to start.
<textarea readonly class="form-control" id="p2p-chatroom-content"></textarea>
<form id="p2p-chatroom-form">
  <input autocomplete="off" class="form-control" id="p2p-chatroom-input">
  <input type="submit" style="display: none">
</form>
<script>
(function() {
  function onConnData(data) {
    document.getElementById('p2p-chatroom-content').value += data + '\n'
  }
  document.getElementById('p2p-chatroom-form').onsubmit = function() {
    if (conn && conn.open) {
      var textToSend = document.getElementById('p2p-chatroom-input').value
      conn.send(textToSend)
      document.getElementById('p2p-chatroom-content').value += textToSend + '\n'
      document.getElementById('p2p-chatroom-input').value = ""
    }
    return false
  }
  var peer = new Peer({
    port: 443,
    secure: true
  })
  var conn = null
  peer.on('open', function(id) {
    var idElement = document.getElementById('p2p-chatroom-id')
    var idLink = location.origin + location.pathname + '?peerid=' + id
    idElement.innerText = idLink
    idElement.href = idLink
  })
  peer.on('connection', function(c) {
    if (!conn || !conn.open) {
      conn = c
      conn.on('data', onConnData)
    }
  })
  var peerIdMatch = location.search.match(/peerid=([\da-z]+)/)
  if (peerIdMatch) {
    var peerId = peerIdMatch[1]
    conn = peer.connect(peerId)
    conn.on('data', onConnData)
  }
})()
</script>
