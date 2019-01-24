---
title: Simple BPM Counter
categories:
  - demo
tags:
  - music
---
<script>
(function() {
  var taps = []

  function bpmCounterTap() {
    taps.push(Date.now())
    if (taps.length >= 2) {
      var mspb = (taps[taps.length - 1] - taps[0]) / (taps.length - 1)
      var bpm = 60000 / mspb
      document.getElementById('bpm').innerText = bpm.toFixed(2)
    }
    return null
  }

  function bpmCounterClear() {
    document.getElementById('bpm').innerText = ''
    taps = []
  }

  window.onkeydown = function(event) {
    if (event.repeat) {
      return
    }
    
    var which = event.keyCode || event.which
    switch (which) {
      case 32:
        bpmCounterTap()
        event.preventDefault()
        break
      case 8:
        bpmCounterClear()
        event.preventDefault()
        break
    }
  }

  window.bpmCounterTap = bpmCounterTap
  window.bpmCounterClear = bpmCounterClear
})()
</script>
## Demo
<span class="btn-group" role="group">
  <button type="button" class="btn btn-default" onclick="bpmCounterTap()">Tap</button>
  <button type="button" class="btn btn-default" onclick="bpmCounterClear()">Clear</button>
</span>

BPM: <span id="bpm"></span>

Press space to tap, backspace to clear.
