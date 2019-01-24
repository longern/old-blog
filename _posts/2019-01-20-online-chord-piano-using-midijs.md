---
title: Online Chord Piano Using MIDI.js
---
<script src="https://cdn.jsdelivr.net/npm/midi.js@0.3.1/lib/midi.min.js"></script>
<script>
MIDI.loadPlugin({
  soundfontUrl: '/static/soundfont/',
})
var lastRootNote = null
window.onkeydown = function(event) {
  if (event.repeat) {
    return
  }
  
  var which = event.keyCode || event.which
  var shift = parseInt(document.getElementById('shift').innerText)
  if (which >= 49 && which <= 55) {
    var rootNote = [60, 62, 64, 65, 67, 57, 59][which - 49] + shift
    if (event.shiftKey) {
      rootNote -= 12
    }

    var minor = false
    if ([2, 4, 9].indexOf(rootNote % 12) !== -1) {
      minor = true
    }
    var notes = [rootNote, rootNote + (minor ? 3 : 4), rootNote + 7]
    if (lastRootNote !== rootNote) {
      notes.push(rootNote - 12)
    }
    lastRootNote = rootNote
    MIDI.chordOn(0, notes, 127, 0)
  }
}

function pitchShift(n) {
  var shift = parseInt(document.getElementById('shift').innerText) + n
  shift = Math.max(Math.min(shift, 12), -12)
  document.getElementById('shift').innerText = shift
}
</script>
Pitch shift: <span id="shift" style="display: inline-block; width: 3em">0</span>
<span class="btn-group" role="group">
  <button type="button" class="btn btn-default" onclick="pitchShift(1)">+</button>
  <button type="button" class="btn btn-default" onclick="pitchShift(-1)">-</button>
</span>

Press 1~7 to play!
