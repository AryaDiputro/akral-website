const video = document.getElementById('camera');
const status = document.getElementById('status');
const indicator = document.getElementById('indicator');

const detectionHistory = {
  hand: [],
  gesture: []
};
const HISTORY_LENGTH = 6;
const HISTORY_THRESHOLD = 2;

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
});

hands.setOptions({
  selfieMode: true,
  maxNumHands: 2,
  modelComplexity: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.35,
  minTrackingConfidence: 0.35,
  smoothLandmarks: true
});

hands.onResults(onResults);

function setStatus(message, statusType = 'normal') {
  status.textContent = message;
  status.classList.toggle('error', statusType === 'error');
  status.classList.toggle('active', statusType === 'active');
}

function setIndicator(message, active = false) {
  indicator.textContent = message;
  indicator.classList.toggle('active', active);
  indicator.classList.toggle('inactive', !active);
}

async function startCamera() {
  if (typeof Hands !== 'function') {
    setStatus('MediaPipe tidak tersedia. Jalankan dengan koneksi internet dan server lokal.', 'error');
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus('Browser tidak mendukung kamera. Gunakan Chrome/Edge/Firefox lewat HTTPS atau localhost.', 'error');
    return;
  }

  setStatus('Mencari kamera...');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: { ideal: 'user' }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
    setStatus('Kamera aktif. Tunjukkan gesture 2 jari untuk blur.');
    setIndicator('Menunggu deteksi...', false);
    requestAnimationFrame(processFrame);
  } catch (error) {
    console.error(error);
    let message = 'Tidak dapat mengakses kamera. Jalankan halaman di HTTPS atau localhost.';

    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      message = 'Izin kamera ditolak. Izinkan akses kamera pada browser.';
    } else if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
      message = 'Tidak ada kamera ditemukan pada perangkat ini.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      message = 'Kamera tidak dapat dibuka. Pastikan tidak ada aplikasi lain yang menggunakan kamera.';
    }

    setStatus(message, 'error');
  }
}

async function processFrame() {
  try {
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      await hands.send({image: video});
    }
  } catch (error) {
    console.warn('MediaPipe error:', error);
  }
  requestAnimationFrame(processFrame);
}

function updateHistory(type, value) {
  detectionHistory[type].push(value ? 1 : 0);
  if (detectionHistory[type].length > HISTORY_LENGTH) {
    detectionHistory[type].shift();
  }
  const sum = detectionHistory[type].reduce((acc, val) => acc + val, 0);
  return sum >= HISTORY_THRESHOLD;
}

function onResults(results) {
  const currentHandDetected = Array.isArray(results.multiHandLandmarks) && results.multiHandLandmarks.length > 0;
  const currentGestureActive = currentHandDetected && results.multiHandLandmarks.some(isTwoFingerGesture);

  const handDetected = updateHistory('hand', currentHandDetected);
  const gestureActive = updateHistory('gesture', currentGestureActive);

  setIndicator(handDetected ? 'Tangan terdeteksi' : 'Tangan tidak terdeteksi', handDetected);

  if (!handDetected) {
    video.classList.remove('blur');
    status.textContent = 'Tunjukkan 2 jari (gesture V) untuk mengaktifkan blur.';
    status.classList.remove('active');
    return;
  }

  if (gestureActive) {
    video.classList.add('blur');
    status.textContent = 'Blur aktif — jaga pose 2 jari.';
    status.classList.add('active');
  } else {
    video.classList.remove('blur');
    status.textContent = 'Tunjukkan 2 jari (gesture V) untuk mengaktifkan blur.';
    status.classList.remove('active');
  }
}

function isTwoFingerGesture(landmarks) {
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];

  const indexUp = indexTip.y < indexPip.y;
  const middleUp = middleTip.y < middlePip.y;
  const ringDown = ringTip.y > ringPip.y;
  const pinkyDown = pinkyTip.y > pinkyPip.y;
  const fingerSpread = Math.abs(indexTip.x - middleTip.x) > 0.05;

  return indexUp && middleUp && ringDown && pinkyDown && fingerSpread;
}

startCamera();
    

