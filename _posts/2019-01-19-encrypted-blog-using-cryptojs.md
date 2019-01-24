---
title: Encrypted Blog Using CryptoJS
categories:
  - demo
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
## Tutorial
Import CryptoJS.
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js"></script>
```
Convert your content into ciphertext in console.
DO NOT commit or it will leak from git history.
```js
CryptoJS.AES.encrypt('Hello world', 'key').toString()
```
Save the ciphertext.
```js
var ciphertext = 'U2FsdGVkX19ZS8PPl0RE2pIZYe6oz4+mdwJvuzC3idc='
```
Decrypt ciphertext with the key from input and convert to string.
```js
var bytes = CryptoJS.AES.decrypt(ciphertext, key)
var text = bytes.toString(CryptoJS.enc.Utf8)
```
