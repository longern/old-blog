(function() {
  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: 'text/x-python',
    matchBrackets: true
  })
  var currentFilePath = null

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
          {
            label: 'Open...',
            accelerator: 'Ctrl+O',
            click() {
              const { dialog } = require('electron').remote
              const files = dialog.showOpenDialog()
              if (files) {
                currentFilePath = files[0]
                const fs = require('fs')
                const dataBuffer = fs.readFileSync(currentFilePath)
                editor.doc.setValue(dataBuffer.toString())
              }
            }
          },
          {
            label: 'Save',
            accelerator: 'Ctrl+S',
            click() {
              if (!currentFilePath) {
                const { dialog } = require('electron').remote
                currentFilePath = dialog.showSaveDialog()
              }
              if (currentFilePath) {
                const fs = require('fs')
                fs.writeFileSync(currentFilePath, editor.doc.getValue())
              }
            }
          },
          {
            label: 'Save As...',
            accelerator: 'Ctrl+Shift+S',
            click() {
              const { dialog } = require('electron').remote
              const savePath = dialog.showSaveDialog()
              if (savePath) {
                currentFilePath = savePath
                const fs = require('fs')
                fs.writeFileSync(currentFilePath, editor.doc.getValue())
              }
            }
          },
          { type: 'separator' },
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
      },
      {
        label: '&Help',
        submenu: [
          { label: 'Update', role: 'forcereload' }
        ]
      }
    ])

    const customTitlebar = require('custom-electron-titlebar')
    new customTitlebar.Titlebar({})
  }
})()
