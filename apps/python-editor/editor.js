(function() {
  function updateStorage() {
    localStorage.setItem('PythonEditorStorage', JSON.stringify(storage))
    if (storage.currentFilePath) {
      document.title = storage.currentFilePath.replace(/.*(\/|\\)/, '') + ' - Python Editor'
    } else {
      document.title = 'Python Editor'
    }
    if (titlebar) {
      titlebar.updateTitle()
    }
  }

  var titlebar = null
  var storage = JSON.parse(localStorage.getItem('PythonEditorStorage') || '{}')
  storage.currentFilePath = storage.currentFilePath || null
  storage.recentFiles = storage.recentFiles || []
  updateStorage()

  function openFile(filepath) {
    storage.currentFilePath = filepath
    if (storage.recentFiles.indexOf(filepath) === -1) {
      storage.recentFiles.push(filepath)
    }
    if (storage.recentFiles.length >= 10) {
      storage.recentFiles.length = 10
    }
    updateStorage()
    const fs = require('fs')
    const dataBuffer = fs.readFileSync(filepath)
    editor.doc.setValue(dataBuffer.toString())
  }

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
    if (storage.currentFilePath) {
      openFile(storage.currentFilePath)
    }

    document.body.addEventListener('drop', (ev) => {
      ev.preventDefault()
      openFile(ev.dataTransfer.files[0].path)
    }, true)

    window.setApplicationMenu([
      {
        label: '&File',
        submenu: [
          {
            label: 'New',
            accelerator: 'Ctrl+N',
            click() {
              storage.currentFilePath = null
              updateStorage()
              editor.doc.setValue('')
            }
          },
          {
            label: 'Open...',
            accelerator: 'Ctrl+O',
            click() {
              const { dialog } = require('electron').remote
              const files = dialog.showOpenDialog()
              if (files) {
                openFile(files[0])
              }
            }
          },
          {
            label: 'Open recent file',
            submenu: storage.recentFiles.map(file => ({
              label: file,
              click() {
                openFile(file)
              }
            }))
          },
          {
            label: 'Save',
            accelerator: 'Ctrl+S',
            click() {
              if (!storage.currentFilePath) {
                const { dialog } = require('electron').remote
                storage.currentFilePath = dialog.showSaveDialog()
              }
              if (storage.currentFilePath) {
                updateStorage()
                const fs = require('fs')
                fs.writeFileSync(storage.currentFilePath, editor.doc.getValue())
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
                storage.currentFilePath = savePath
                updateStorage()
                const fs = require('fs')
                fs.writeFileSync(storage.currentFilePath, editor.doc.getValue())
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
          { role: 'paste', accelerator: 'Ctrl+V' },
          { type: 'separator' },
          {
            label: 'Insert date',
            click() {
              editor.doc.replaceSelection(new Date().toUTCString())
            }
          }
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
    titlebar = new customTitlebar.Titlebar({})
  }
})()
