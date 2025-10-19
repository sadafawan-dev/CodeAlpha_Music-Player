// ====== Simple Music Player (playlist + controls + progress + volume + autoplay) ======
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverImg = document.getElementById('coverImg');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progressContainer');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeRange = document.getElementById('volumeRange');
const playlistEl = document.getElementById('playlist');
const autoplayToggle = document.getElementById('autoplayToggle');

// Playlist (using included WAV demo files)
const tracks = [
  { src: 'songs/song1.mp3', title: 'Song One', artist: 'Artist A', cover: 'covers/cover1.png' },
  { src: 'songs/song2.mp3', title: 'Song Two', artist: 'Artist B', cover: 'covers/cover2.png' },
  { src: 'songs/song3.mp3', title: 'Song Three', artist: 'Artist C', cover: 'covers/cover3.png' }
];

let currentIndex = 0;
let isPlaying = false;

// Build playlist UI and load durations
tracks.forEach((t, i) => {
  const li = document.createElement('li');
  li.className = 'track';
  li.dataset.index = i;
  li.innerHTML = `
    <div class="meta">
      <div class="t">${t.title}</div>
      <div class="a">${t.artist}</div>
      <div class="dur" data-duration="--">Loading...</div>
    </div>
  `;
  li.addEventListener('click', () => {
    loadTrack(i);
    playTrack();
  });
  playlistEl.appendChild(li);

  // Preload to get duration
  const tempAudio = new Audio();
  tempAudio.src = t.src;
  tempAudio.addEventListener('loadedmetadata', () => {
    const dur = formatTime(tempAudio.duration);
    const durEl = li.querySelector('.dur');
    durEl.textContent = dur;
    durEl.dataset.duration = tempAudio.duration;
  });
});

// Load given track index
function loadTrack(index) {
  if (index < 0) index = tracks.length - 1;
  if (index >= tracks.length) index = 0;
  currentIndex = index;
  const t = tracks[currentIndex];
  audio.src = t.src;
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  coverImg.src = t.cover;
  updateActiveTrack();
  // reset progress UI
  progress.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
}

// Update playlist UI highlight
function updateActiveTrack(){
  document.querySelectorAll('.track').forEach(li => li.classList.remove('active'));
  const el = document.querySelector(`.track[data-index="${currentIndex}"]`);
  if(el) el.classList.add('active');
}

// Play / Pause
function playTrack(){
  audio.play().then(()=> {
    isPlaying = true;
    playBtn.textContent = '⏸';
    coverImg.style.transform = 'scale(1.03)';
  }).catch(err => {
    console.warn('Play prevented:', err);
  });
}
function pauseTrack(){
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
  coverImg.style.transform = 'scale(1)';
}

playBtn.addEventListener('click', () => {
  if (!audio.src) loadTrack(currentIndex);
  if(isPlaying) pauseTrack(); else playTrack();
});

// prev / next
prevBtn.addEventListener('click', () => {
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
  playTrack();
});
nextBtn.addEventListener('click', () => {
  loadTrack((currentIndex + 1) % tracks.length);
  playTrack();
});

// update duration & current time
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
  // ensure volume value applied
  audio.volume = parseFloat(volumeRange.value);
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});

// seek on progress click
progressContainer.addEventListener('click', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = clickX / rect.width;
  if (audio.duration) {
    audio.currentTime = ratio * audio.duration;
  }
});

// volume control
volumeRange.addEventListener('input', () => {
  audio.volume = parseFloat(volumeRange.value);
});

// when track ends
audio.addEventListener('ended', () => {
  if (autoplayToggle.checked) {
    loadTrack((currentIndex + 1) % tracks.length);
    playTrack();
  } else {
    pauseTrack();
  }
});

// helper: format seconds to m:ss
function formatTime(secs){
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

// Keyboard shortcuts (space = play/pause, right/left = next/prev)
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName.toLowerCase();
  // avoid interfering with typing in inputs
  if (tag === 'input' || tag === 'textarea') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (!audio.src) loadTrack(currentIndex);
    isPlaying ? pauseTrack() : playTrack();
  } else if (e.key === 'ArrowRight') {
    loadTrack((currentIndex + 1) % tracks.length);
    playTrack();
  } else if (e.key === 'ArrowLeft') {
    loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
    playTrack();
  }
});

// init
loadTrack(currentIndex);
