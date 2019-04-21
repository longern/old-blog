var rosa
var model

if (window.require) {
  window.fetch = window.fetch.bind(window)
  window.tf = require('@tensorflow/tfjs-node')

  if (!window.tf) {
    window.installPackage(['@tensorflow/tfjs-node']).then(location.reload)
  }

  tf.setBackend('tensorflow')
}

import('./rosa.js').then((rosaModule) => {
  rosa = rosaModule
})

async function loadTranscribeModel() {
  const modelPath = '/mini-ml/models/onsets_train/model.json'
  const transcribeModel = await tf.loadLayersModel(modelPath)
  const warmupTensor = tf.tidy(() => (
    transcribeModel.predict(tf.zeros([1, 1, 229, 1]))
  ))
  await warmupTensor.data()
  warmupTensor.dispose()
  model = transcribeModel
}

function makePrediction(bands) {
  if (makePrediction.busyLock) {
    return
  }
  makePrediction.busyLock = true

  if (!makePrediction.lastBands) {
    makePrediction.lastBands = tf.zeros([2048])
    makePrediction.lastPitches = tf.zeros([1, 88])
  }

  tf.tidy(() => {
    const bandsTensor = tf.tensor(bands)
    const frames = tf.concat([
      makePrediction.lastBands,
      bandsTensor
    ])

    const melSpec = rosa.melSpectrogram(frames, {
      sampleRate: 16000,
      nMels: 229,
      fMin: 30,
      center: false
    }).transpose()
    const spec = rosa.powerToDb(melSpec)

    const inputs = spec
      .reshape([spec.shape[0], 1, 1, 229, 1])
      .unstack()
    const prediction = tf
      .stack(inputs.map(input => model.predict(input)))
      .reshape([spec.shape[0], 88])

    const remainedBuffer = tf.keep(frames.slice(spec.shape[0] * 512))
    makePrediction.lastBands.dispose()
    makePrediction.lastBands = remainedBuffer

    const maskedPrediction = tf.mul(
      prediction,
      tf.pad(
        makePrediction.lastPitches.lessEqual(0.5).cast('float32'),
        [[0, prediction.shape[0] - 1], [0, 0]],
        1
      )
    )

    makePrediction.lastPitches.dispose()
    makePrediction.lastPitches = tf.keep(
      maskedPrediction.slice(maskedPrediction.shape[0] - 1, 1)
    )

    tf.whereAsync(maskedPrediction.greater(0.5)).then(async (indices) => {
      const indicesData = await tf.tidy(() => indices.slice([0, 1]).squeeze()).array()
      makePrediction.busyLock = false
      if (indicesData.length)
        console.log(_.uniq(indicesData).sort())
    })
  })
}

loadTranscribeModel()

var audioElement = new Audio()
var audioContext = new AudioContext()

var source = audioContext.createMediaElementSource(audioElement)
var processor = audioContext.createScriptProcessor(4096, 1, 1)

// wire up nodes
source.connect(processor)
source.connect(audioContext.destination)
processor.connect(audioContext.destination)

processor.onaudioprocess = async function(ev) {
  if (audioElement.paused) {
    return
  }

  if (!model || !rosa) {
    return
  }

  // Resample to 16000 Hz
  const offlineAudioContext = new OfflineAudioContext({
    numberOfChannels: 1,
    length: 1486,
    sampleRate: 16000
  })

  const offlineSource = offlineAudioContext.createBufferSource()
  offlineSource.buffer = ev.inputBuffer
  offlineSource.connect(offlineAudioContext.destination)
  offlineSource.start()

  const offlineBuffer = await offlineAudioContext.startRendering()
  // retreive the data from the first channel
  var bands = offlineBuffer.getChannelData(0)
  makePrediction(bands)
}

function loadAudioFile(file) {
  var reader = new FileReader()
  reader.onload = function (e) {
    audioElement.src = e.target.result
    audioElement.play()

    if (model) {
      model.resetStates()
    }
  }
  reader.readAsDataURL(file)
}

document.getElementById('audioFile').addEventListener('change', function(ev) {
  var file = ev.currentTarget.files[0]

  if (ev.currentTarget.files && file) {
    loadAudioFile(file)
  }
})
