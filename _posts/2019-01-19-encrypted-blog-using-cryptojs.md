---
title: Encrypted Blog Using CryptoJS
---
<form onsubmit="return cryptoSubmit()">
  <label>Password:</label>
  <input type="text" autocomplete="off" id="crypto-key" class="form-control">
  <input type="submit" hidden>
</form>
<div id="decrypted-content"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js"></script>
<script>
function cryptoSubmit() {
  var decryptedContentElement = document.getElementById('decrypted-content')
  var key = document.getElementById('crypto-key').value
  var ciphertext = 'U2FsdGVkX19ZS8PPl0RE2pIZYe6oz4+mdwJvuzC3idc='
  var bytes = CryptoJS.AES.decrypt(ciphertext, key)
  try {
    var text = bytes.toString(CryptoJS.enc.Utf8)
    if (!text) {
      throw ''
    }
    decryptedContentElement.innerHTML = text
  } catch (e) {
    decryptedContentElement.innerText = 'Wrong Password'
  }
  return false
}
</script>
