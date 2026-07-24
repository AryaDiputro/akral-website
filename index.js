const video = document.getElementById('camera');
const status = document.getElementById('status');

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
});

hands.setOptions({
  selfieMode: true,
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

function setStatus(message, statusType = 'normal') {
  status.textContent = message;
  status.classList.toggle('error', statusType === 'error');
  status.classList.toggle('active', statusType === 'active');
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
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: { ideal: 'user' }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
    setStatus('Kamera aktif. Tunjukkan gesture 2 jari untuk blur.');
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

function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    video.classList.remove('blur');
    status.textContent = 'Tunjukkan 2 jari (gesture V) untuk mengaktifkan blur.';
    status.classList.remove('active');
    return;
  }

  const gestureActive = results.multiHandLandmarks.some(isTwoFingerGesture);

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

  return indexUp && middleUp && ringDown && pinkyDown;
}

startCamera();
    

