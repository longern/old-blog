if (!window.tf) {
  console.error('Import tensorflow.js first')
}

export function getWindow(window, winLength) {
  const windowDomain = tf.range(0, winLength)
  switch(window) {
    case 'hann':
      return tf.mul(
        0.5,
        tf.sub(1, tf.cos(tf.mul((2 * Math.PI) / winLength, windowDomain)))
      )
    default:
      return null
  }
}

export function pad(y, len, mode) {
  switch(mode) {
    case 'reflect':
      const cycleNumber = Math.ceil(len / (2 * (y.size - 1)))

      const backwardCycle = tf.concat([
        y.slice(0, y.size - 1),
        y.reverse().slice(0, y.size - 1)
      ]).tile([cycleNumber])
      const forwardCycle = tf.concat([
        y.reverse().slice(1),
        y.slice(1)
      ]).tile([cycleNumber])

      return tf.concat([
        backwardCycle.slice(backwardCycle.size - len, len),
        y,
        forwardCycle.slice(0, len)
      ])
    default:
      return y
  }
}

export function stft(y, params) {
  if (!y.size) {
    return null
  }

  params = params || {}
  const nFft = params.nFft || 2048
  const winLength = params.winLength || nFft
  const hopLength = params.hopLength || Math.floor(winLength / 4)
  const center = params.center !== undefined ? params.center : true
  const padMode = params.padMode || 'reflect'

  const fftWindow = rosa.getWindow('hann', winLength)

  if (center) {
    y = pad(y, Math.floor(nFft / 2), padMode)
  }

  const stftRealBuffer = []
  const stftImagBuffer = []

  const height = 1 + Math.floor(nFft / 2)

  for (let i = 0; ; i++) {
    const ind = i * hopLength
    if (ind + nFft > y.size) {
      const stftResult = {
        real: tf.stack(stftRealBuffer, 1),
        imag: tf.stack(stftImagBuffer, 1)
      }
      return stftResult
    }
    const buffer = y.slice(ind, nFft)

    const [colRealSliced, colImagSliced] = tf.tidy(() => {
      const winBuffer = tf.mul(buffer, fftWindow)
      const col = tf.fft(winBuffer.asType('complex64'))
      const colReal = tf.real(col).squeeze()
      const colImag = tf.imag(col).squeeze()
      return [colReal.slice(0, height), colImag.slice(0, height)]
    })
    stftRealBuffer.push(colRealSliced)
    stftImagBuffer.push(colImagSliced)
  }
}

export function powerToDb(spec, amin = 1e-10, topDb = 80.0) {
  var logSpec = tf.mul(
    10.0,
    tf.div(tf.maximum(spec, amin).log(), tf.log(10.))
  )

  if (topDb) {
    const maxVal = logSpec.max(1, true)
    logSpec = tf.maximum(
      logSpec,
      tf.sub(maxVal, topDb).tile([1, logSpec.shape[1]])
    )
  }

  return logSpec;
}

export function hzToMel(hz) {
  if (hz instanceof tf.Tensor) {
    return tf.mul(
      1125.0,
      tf.log(tf.add(1, tf.div(hz, 700.0)))
    )
  } else {
    return 1125.0 * Math.log(1 + hz / 700.0)
  }
}

export function melToHz(mel) {
  if (mel instanceof tf.Tensor) {
    return tf.mul(
      700.0,
      tf.sub(tf.exp(tf.div(mel, 1125.0)), 1)
    )
  } else {
    return 700.0 * (Math.exp(mel / 1125.0) - 1)
  }
}

export function fftFrequencies(sampleRate, nFft) {
  return tf.linspace(0, sampleRate / 2, Math.floor(1 + nFft / 2));
}

export function melFrequencies(nMels, fMin, fMax) {
  const melMin = hzToMel(fMin);
  const melMax = hzToMel(fMax);

  // Construct linearly spaced array of nMel intervals, between melMin and
  // melMax.
  const mels = tf.linspace(melMin, melMax, nMels);
  const hzs = melToHz(mels);
  return hzs;
}

function magSpectrogram(stftReal, stftImag) {
  const spec = tf.add(stftReal.square(), stftImag.square())
  const nFft = 2 * stftReal.shape[0] - 1
  return [spec, nFft]
}

function internalDiff(x) {
  return tf.sub(x.slice(1), x.slice(0, x.shape[0] - 1))
}

function outerSubtract(arr, arr2) {
  const tiledArr = arr.expandDims(1).tile([1, arr2.shape[0]])
  const tiledArr2 = arr2.expandDims(0).tile([arr.shape[0], 1])
  return tf.sub(tiledArr, tiledArr2)
}

export function createMelFilterbank(params) {
  params = params || {}
  const sampleRate = params.sampleRate || 22050
  const fMin = params.fMin || 0
  const fMax = params.fMax || sampleRate / 2
  const nMels = params.nMels || 128
  const nFft = params.nFft || 2048
  const norm = params.norm || 1

  // Center freqs of each FFT band.
  const fftFreqs = fftFrequencies(sampleRate, nFft)
  // (Pseudo) center freqs of each Mel band.
  const melFreqs = melFrequencies(nMels + 2, fMin, fMax)

  const melDiff = internalDiff(melFreqs)
  const ramps = outerSubtract(melFreqs, fftFreqs)
  const filterSize = ramps.shape[1]

  const lower = tf.div(
    ramps.slice(0, ramps.shape[0] - 2),
    melDiff.slice(0, melDiff.shape[0] - 1).expandDims(1).tile([1, filterSize])
  ).neg()
  const upper = tf.div(
    ramps.slice(2),
    melDiff.slice(1).expandDims(1).tile([1, filterSize])
  )
  var weights = tf.maximum(0, tf.minimum(lower, upper))

  if (norm === 1) {
    const enorm = tf.div(
      2.0,
      tf.sub(melFreqs.slice(2), melFreqs.slice(0, melFreqs.size - 2))
    )
    weights = tf.mul(weights, enorm.expandDims(1).tile([1, weights.shape[1]]))
  }

  return weights;
}

export function melSpectrogram(y, params) {
  params = params || {}
  const { real: stftReal, imag: stftImag } = stft(y, params)
  const [spec, nFft] = magSpectrogram(stftReal, stftImag)

  params.nFft = nFft
  const melBasis = createMelFilterbank(params)
  return tf.dot(melBasis, spec)
}
