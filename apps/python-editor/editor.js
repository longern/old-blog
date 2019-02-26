(function() {
  function updateStorage() {
    localStorage.setItem('NaiveEditorStorage', JSON.stringify(storage))
    if (storage.currentFilePath) {
      document.title = storage.currentFilePath.replace(/.*(\/|\\)/, '') + ' - Naive Editor'
    } else {
      document.title = 'Naive Editor'
    }
    if (titlebar) {
      titlebar.updateTitle()
    }
  }

  var titlebar = null
  var storage = JSON.parse(localStorage.getItem('NaiveEditorStorage') || '{}')
  storage.currentFilePath = storage.currentFilePath || null
  storage.recentFiles = storage.recentFiles || []
  updateStorage()

  var markdownRenderer = null

  function renderMarkdown() {
    if (!markdownRenderer && window.markdownit) {
      markdownRenderer = markdownit({
        html: true,
        linkify: true
      })
    }
    if (markdownRenderer) {
      $('#markdown-display').html(markdownRenderer.render(editor.doc.getValue()))
    }
  }

  function openFile(filepath) {
    if (filepath) {
      const fs = require('fs')
      if (!fs.existsSync(filepath)) {
        if (storage.currentFilePath === filepath) {
          storage.currentFilePath = null
          updateStorage()
        }
        return
      }

      if (storage.recentFiles.indexOf(filepath) === -1) {
        storage.recentFiles.push(filepath)
      }
      if (storage.recentFiles.length >= 10) {
        storage.recentFiles.length = 10
      }
      const dataBuffer = fs.readFileSync(filepath)
      editor.doc.setValue(dataBuffer.toString())
    } else {
      editor.doc.setValue('')
    }
    storage.currentFilePath = filepath
    updateStorage()

    var ext;
    if (ext = /.+\.([^.]+)$/.exec(filepath)) {
      var info = CodeMirror.findModeByExtension(ext[1]);
      if (info) {
        editor.setOption("mode", info.mime);
        CodeMirror.autoLoadMode(editor, info.mode);
      }
    }

    if (ext && ext[1] === 'md') {
      if (!window.markdownit) {
        var scriptElement = document.createElement('script')
        scriptElement.src = "https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.4.2/markdown-it.min.js"
        scriptElement.addEventListener('load', renderMarkdown)
        document.head.appendChild(scriptElement)
      }
      $('#editor-box').css('width', '50%')
      $('#markdown-display').show()
      renderMarkdown()
      editor.on('change', renderMarkdown)
    } else {
      $('#editor-box').css('width', '100%')
      $('#markdown-display').hide()
      editor.off('change', renderMarkdown)
    }

    editor.focus()
  }

  $.i18n().load({
    'zh-CN': 'i18n/zh-CN.json'
  })
    .then(function() {
      storage.i18nMessages = $.i18n().messageStore.messages
      updateStorage()
    })

  $.i18n().load(storage.i18nMessages)

  CodeMirror.modeURL = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/mode/%N/%N.js";
  var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true
  })

  editor.setOption("extraKeys", {  
    Tab: function(cm) {
      var spaces = Array(cm.getOption("indentUnit") + 1).join(" ")
      cm.replaceSelection(spaces)
    }
  })

  if (window.require) {
    for (var ext of ['html', 'js', 'py', 'txt']) {
      window.registerFileExtension(ext)
    }

    if (window.argv) {
      storage.currentFilePath = argv
    }

    if (storage.currentFilePath) {
      openFile(storage.currentFilePath)
    }

    document.body.addEventListener('drop', (ev) => {
      ev.preventDefault()
      openFile(ev.dataTransfer.files[0].path)
    }, true)

    window.setApplicationMenu([
      {
        label: $.i18n('&File'),
        submenu: [
          {
            label: $.i18n('New'),
            accelerator: 'Ctrl+N',
            click() {
              openFile(null)
            }
          },
          {
            label: $.i18n('Open...'),
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
            label: $.i18n('Open Recent File'),
            submenu: storage.recentFiles.map(file => ({
              label: file,
              click() {
                openFile(file)
              }
            }))
          },
          {
            label: $.i18n('Save'),
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
              editor.focus()
            }
          },
          {
            label: $.i18n('Save As...'),
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
          { label: $.i18n('Exit'), role: 'close', accelerator: 'Alt+F4' },
        ]
      },
      {
        label: $.i18n('&Edit'),
        submenu: [
          { role: 'undo', accelerator: 'Ctrl+Z' },
          { role: 'redo', accelerator: 'Ctrl+Y' },
          { type: 'separator' },
          { role: 'cut', accelerator: 'Ctrl+X' },
          { role: 'copy', accelerator: 'Ctrl+C' },
          { role: 'paste', accelerator: 'Ctrl+V' },
          { type: 'separator' },
          {
            label: $.i18n('Insert Date'),
            click() {
              editor.doc.replaceSelection(new Date().toUTCString())
              editor.focus()
            }
          }
        ]
      },
      {
        label: $.i18n('&Debug'),
        submenu: [
          {
            label: $.i18n('Run'),
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
        label: $.i18n('&Help'),
        submenu: [
          { label: $.i18n('Update'), role: 'forcereload' }
        ]
      }
    ])

    const customTitlebar = require('custom-electron-titlebar')
    titlebar = new customTitlebar.Titlebar({})
  }
})()
