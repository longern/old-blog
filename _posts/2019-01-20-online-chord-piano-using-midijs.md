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
  var which = event.keyCode || event.which
  if (which >= 49 && which <= 55) {
    var rootNote = [57, 59, 61, 62, 64, 66, 68][which - 49]
    if (event.shiftKey) {
      rootNote -= 12
    }

    var minor = false
    if ([11, 1, 6].indexOf(rootNote % 12) !== -1) {
      minor = true;
    }
    var notes = [rootNote, rootNote + (minor ? 3 : 4), rootNote + 7]
    if (lastRootNote !== rootNote) {
      notes.push(rootNote - 12)
    }
    lastRootNote = rootNote
    MIDI.chordOn(0, notes, 127, 0)
  }
}
</script>
Press 1~7 to play!
