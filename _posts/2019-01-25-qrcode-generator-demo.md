---
title: QRCode Generator Demo
categories:
  - demo
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.1/qrcode.min.js"></script>
<script>
function makeQRCode(data, imgId) {
  var qr = qrcode(0, 'M');
  qr.addData(data);
  qr.make();
  document.getElementById(imgId).src = qr.createDataURL(4);
}
</script>
## Demo
<script>
function handleSubmit() {
  var data = document.getElementById('qr-input').value;
  makeQRCode(data, 'qrcode');
  return false;
}
</script>
<form onsubmit="return handleSubmit();">
  <input autocomplete="off" id="qr-input" class="form-control">
  <input type="submit" hidden>
</form>
<img id="qrcode">
## Source
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.1/qrcode.min.js"></script>
<script>
function makeQRCode(data, imgId) {
  var qr = qrcode(0, 'M');
  qr.addData(data);
  qr.make();
  document.getElementById(imgId).src = qr.createImgTag();
}
```
