---
title: Hearthstone Matchup Simulator
categories:
  - demo
---
Bo3 and Bo5 are supported.
<table class="table table-striped" id="winrate-table">
  <tr>
    <th></th>
    <th>Opponent's deck 1</th>
    <th>Opponent's deck 2</th>
    <th>Opponent's deck 3</th>
  </tr>
  <tr>
    <th>Deck 1</th>
    <td contenteditable></td>
    <td contenteditable></td>
    <td contenteditable></td>
  </tr>
  <tr>
    <th>Deck 2</th>
    <td contenteditable></td>
    <td contenteditable></td>
    <td contenteditable></td>
  </tr>
  <tr>
    <th>Deck 3</th>
    <td contenteditable></td>
    <td contenteditable></td>
    <td contenteditable></td>
  </tr>
</table>
<button type="button" class="btn btn-default" onclick="matchupHandleClick()">Calculate</button>

Result:
<div id="matchup-result"></div>

<script>
function matchupCalculate(winrates) {
  var wins = [0, 0]
  var winorders1 = {}
  var winorders2 = {}
  var simulateNumber = 1000000
  for (var i = 0; i < simulateNumber; i++) {
    var decks1 = Array.apply(null, {length: winrates.length}).map(Number.call, Number)
    var decks2 = Array.apply(null, {length: winrates.length}).map(Number.call, Number)
    var winorder1 = ''
    var winorder2 = ''
    var deck1 = decks1[Math.floor(Math.random() * decks1.length)]
    var deck2 = decks2[Math.floor(Math.random() * decks2.length)]
    while(true) {
      winrate = winrates[deck1][deck2]
      if (Math.random() < winrate) {
        decks1 = decks1.filter(x => x !== deck1)
        winorder1 += deck1 + 1
        if (!decks1.length)
          break
        deck1 = decks1[Math.floor(Math.random() * decks1.length)]
      } else {
        decks2 = decks2.filter(x => x !== deck2)
        winorder2 += deck2 + 1
        if (!decks2.length)
          break
        deck2 = decks2[Math.floor(Math.random() * decks2.length)]
      }
    }
    if (!decks1.length) {
      wins[0] += 1
      winorders1[winorder1] = (winorders1[winorder1] || 0) + 1
    } else {
      wins[1] += 1
      winorders2[winorder2] = (winorders2[winorder2] || 0) + 1
    }
  }
  wins = wins.map(x => x / simulateNumber)
  for (var key in winorders1) {
    winorders1[key] *= Object.keys(winorders1).length / simulateNumber
  }
  for (var key in winorders2) {
    winorders2[key] *= Object.keys(winorders2).length / simulateNumber
  }
  return [wins, winorders1, winorders2]
}

function matchupHandleClick() {
  var table = document.getElementById('winrate-table')
  var rowNumber = 2
  if (table.rows[1].cells[3].innerText) {
    rowNumber = 3
  }
  var winrates = [[], [], []]
  winrates.length = rowNumber
  for (var i = 1; i <= rowNumber; i++) {
    for (var j = 1; j <= rowNumber; j++) {
      winrates[i - 1][j - 1] = Number(table.rows[i].cells[j].innerText) / 100
    }
  }
  var [wins, winorders1, winorders2] = matchupCalculate(winrates)
  result = 'Your winrate: ' + wins[0] + '\n' +
    'Opponent\'s winrate: ' + wins[1] + '\n' +
    'Your order: ' + JSON.stringify(winorders1, null, 2) + '\n' +
    'Opponent\'s order: ' + JSON.stringify(winorders2, null, 2) + '\n'
  document.getElementById('matchup-result').innerText = result
}
</script>
