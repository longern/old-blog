var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  lineNumbers: true,
  mode: 'text/x-python',
  matchBrackets: true
})

editor.setOption("extraKeys", {  
  Tab: function(cm) {
    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ")
    cm.replaceSelection(spaces)
  }
})

if (window.require) {
  window.setApplicationMenu([
    {
      label: '&File',
      submenu: [
        { label: 'Exit', role: 'close', accelerator: 'Alt+F4' },
      ]
    },
    {
      label: '&Edit',
      submenu: [
        { role: 'undo', accelerator: 'Ctrl+Z' },
        { role: 'redo', accelerator: 'Ctrl+Y' },
        { type: 'separator' },
        { role: 'cut', accelerator: 'Ctrl+X' },
        { role: 'copy', accelerator: 'Ctrl+C' },
        { role: 'paste', accelerator: 'Ctrl+V' }
      ]
    },
    {
      label: '&Debug',
      submenu: [
        {
          label: 'Run',
          accelerator: 'Ctrl+F5',
          click() {
            const child_process = require('child_process')
            const p = child_process.exec(
              'python',
              {},
              (err, stdout, stderr) => {
                alert(stdout)
              }
            )
            p.stdin.write(editor.doc.getValue())
            p.stdin.end()
          }
        }
      ]
    }
  ])

  const customTitlebar = require('custom-electron-titlebar')
  new customTitlebar.Titlebar({})
}