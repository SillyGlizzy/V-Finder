
// NAVBAR SCROLL
const navbar = document.getElementById('navbar'); 
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// HAMBURGER MENU MOBILE
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileNav.classList.remove('open'));
});

// SCROLL REVEAL
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.section-header, .synth-card, .singer-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// SYNTHSIZERS CAROUSEL
const carousel = document.getElementById('carousel');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');

arrowLeft.addEventListener('click', () => {
  carousel.scrollBy({ left: -280, behavior: 'smooth' });
});
arrowRight.addEventListener('click', () => {
  carousel.scrollBy({ left: 280, behavior: 'smooth' });
});

let isDragging = false, startX, scrollStart;

carousel.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX - carousel.offsetLeft;
  scrollStart = carousel.scrollLeft;
  carousel.style.userSelect = 'none';
});
carousel.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const x = e.pageX - carousel.offsetLeft;
  carousel.scrollLeft = scrollStart - (x - startX);
});
carousel.addEventListener('mouseup', () => { isDragging = false; carousel.style.userSelect = ''; });
carousel.addEventListener('mouseleave', () => { isDragging = false; carousel.style.userSelect = ''; });


// POPULAR CHART — iTunes Search API

const CHART_QUERIES = [
  'ループザルーム',
  'execution clap',
  'ブレインロット',
  'ghost experience satsuki',
  'girl a siinamota',
  'baumkuchen end credit',
  'let me out hallo cel',
  'retry now',
  'pppp',
  'monitoring deco'
];

async function fetchChart() {
  const spinner = document.getElementById('chartSpinner');
  const errorEl = document.getElementById('chartError');
  const grid    = document.getElementById('chartGrid');

  spinner.style.display = 'flex';
  errorEl.style.display = 'none';
  grid.innerHTML = '';

  try {
    const promises = CHART_QUERIES.map(q =>
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=1`)
        .then(r => r.json())
    );
    const results = await Promise.all(promises);
    const tracks  = results.map(r => r.results?.[0]).filter(Boolean);

    spinner.style.display = 'none';
    if (tracks.length === 0) {
      showError(errorEl, '⚠️ No tracks found. Check your connection.');
      return;
    }
    tracks.forEach((track, i) => renderChartCard(track, i));
  } catch (err) {
    console.error('Chart error:', err);
    spinner.style.display = 'none';
    showError(errorEl, '⚠️ Could not load chart. Please check your connection.');
  }
}

let currentAudio = null;
let currentPlayBtn = null;

function renderChartCard(track, index) {
  const grid = document.getElementById('chartGrid');
  const card = document.createElement('div');
  card.className = 'chart-card';
  card.style.animationDelay = `${index * 0.09}s`;

  const rankLabel = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
  const rankClass = index < 3 ? 'chart-rank top' : 'chart-rank';

  card.innerHTML = `
    <div class="${rankClass}">${rankLabel}</div>
    ${track.artworkUrl100
      ? `<img class="chart-thumb" src="${track.artworkUrl100}" alt="${track.trackName}" loading="lazy" />`
      : `<div class="chart-thumb-placeholder">🎵</div>`}
    <div class="chart-info">
      <div class="chart-title">${track.trackName || 'Unknown Title'}</div>
      <div class="chart-artist">${track.artistName || '—'} · ${track.collectionName || ''}</div>
    </div>
    ${track.previewUrl
      ? `<button class="chart-play" data-preview="${track.previewUrl}" data-title="${track.trackName}" aria-label="Play">▶</button>`
      : `<button class="chart-play" disabled style="opacity:.35;cursor:default;" aria-label="No preview">🚫</button>`}
  `;
  grid.appendChild(card);

  const btn = card.querySelector('.chart-play[data-preview]');
  if (btn) btn.addEventListener('click', () => handlePlay(btn));
}

function handlePlay(btn) {
  if (currentPlayBtn === btn) {
    currentAudio.pause(); currentAudio = null; currentPlayBtn = null;
    btn.classList.remove('playing'); btn.textContent = '▶';
    hideAudioBar(); return;
  }
  if (currentAudio) {
    currentAudio.pause();
    if (currentPlayBtn) { currentPlayBtn.classList.remove('playing'); currentPlayBtn.textContent = '▶'; }
  }
  currentAudio    = new Audio(btn.dataset.preview);
  currentPlayBtn  = btn;
  btn.classList.add('playing'); btn.textContent = '⏸';
  showAudioBar(btn.dataset.title, btn.dataset.preview);
  currentAudio.play().catch(() => {
    btn.classList.remove('playing'); btn.textContent = '▶';
    currentAudio = null; currentPlayBtn = null;
  });
  currentAudio.addEventListener('ended', () => {
    btn.classList.remove('playing'); btn.textContent = '▶';
    currentAudio = null; currentPlayBtn = null; hideAudioBar();
  });
}

function showAudioBar(title, url) {
  let bar = document.getElementById('audioBar');
}

fetchChart();

// PRODUCER FINDER — iTunes API 

const LOCAL_PRODUCERS = [
  {
    name: 'ryo (supercell)',
    songs: ['World is Mine', 'Melt', 'Odds & Ends'],
    youtube: 'https://www.youtube.com/@supercell',
    soundcloud: '#',
    initials: 'RY'
  },
  {
    name: 'wowaka',
    songs: ['Rolling Girl', 'Unknown Mother Goose', 'Two-Faced Lovers'],
    youtube: 'https://www.youtube.com/@wowaka',
    soundcloud: '#',
    initials: 'WK'
  },
  {
    name: 'Mitchie M',
    songs: ['Freely Tomorrow', 'Ai Dee', 'Sharing The World'],
    youtube: 'https://www.youtube.com/@MitchieM',
    soundcloud: '#',
    initials: 'MM'
  },
  {
    name: 'DECO*27',
    songs: ['Ai Kotoba', 'Ghost Rule', 'Cinderella'],
    youtube: 'https://www.youtube.com/@DECO27',
    soundcloud: '#',
    initials: 'D27'
  },
  {
    name: 'Crusher-P',
    songs: ['ECHO', 'Flashes', 'Cynical Runaway Ride'],
    youtube: 'https://www.youtube.com/@CrusherP',
    soundcloud: '#',
    initials: 'CP'
  },
  {
    name: 'Hachi (Kenshi Yonezu)',
    songs: ['Matryoshka', 'Panda Hero', 'Donut Hole'],
    youtube: 'https://www.youtube.com/@KenshiYonezu',
    soundcloud: '#',
    initials: 'HC'
  },
  {
    name: 'Kikuo',
    songs: ['Good Night Baby', 'Miku', 'Flower Dance'],
    youtube: 'https://www.youtube.com/@kikuo',
    soundcloud: '#',
    initials: 'KK'
  },
  {
    name: 'cosMo@暴走P',
    songs: ['Hatsune Miku no Shoushitsu', 'Blessing', 'Dead End'],
    youtube: 'https://www.youtube.com/@cosmoP',
    soundcloud: '#',
    initials: 'CS'
  }
];

const producerSearchInput = document.getElementById('producerSearch');
const producerSearchBtn = document.getElementById('producerSearchBtn');

producerSearchBtn.addEventListener('click', searchProducers);
producerSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchProducers();
});

async function searchProducers() {
  const query = producerSearchInput.value.trim();
  if (!query) return;

  const spinner = document.getElementById('producerSpinner');
  const errorEl = document.getElementById('producerError');
  const grid = document.getElementById('producerGrid');

  spinner.style.display = 'flex';
  errorEl.style.display = 'none';
  grid.innerHTML = '';

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query + ' vocaloid')}&media=music&limit=6&country=JP`
    );
    const data = await res.json();
    const tracks = data.results || [];

    const localMatches = LOCAL_PRODUCERS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    spinner.style.display = 'none';

    if (tracks.length === 0 && localMatches.length === 0) {
      errorEl.textContent = `😕 No producers found for "${query}". Try: ryo, wowaka, mitchie m, DECO*27`;
      errorEl.style.display = 'block';
      return;
    }

    localMatches.forEach((p, i) => renderLocalProducer(p, i));

    const seen = new Set(localMatches.map(p => p.name.toLowerCase()));
    const artistMap = {};
    tracks.forEach(t => {
      if (!artistMap[t.artistName]) artistMap[t.artistName] = [];
      artistMap[t.artistName].push(t.trackName);
    });

    Object.entries(artistMap).forEach(([artist, songs], i) => {
      if (!seen.has(artist.toLowerCase())) {
        renderItunesProducer(artist, songs, localMatches.length + i);
      }
    });

  } catch (err) {
    console.error('Producer search error:', err);
    spinner.style.display = 'none';
    errorEl.textContent = '⚠️ Search failed. Showing local database results.';
    errorEl.style.display = 'block';

    const localMatches = LOCAL_PRODUCERS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    localMatches.forEach((p, i) => renderLocalProducer(p, i));
  }
}

function renderLocalProducer(producer, index) {
  const grid = document.getElementById('producerGrid');
  const card = document.createElement('div');
  card.className = 'producer-card';
  card.style.animationDelay = `${index * 0.08}s`;

  card.innerHTML = `
    <div class="producer-thumb" style="display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:0.85rem;color:var(--accent);">${producer.initials}</div>
    <div class="producer-name">${producer.name}</div>
    <div class="producer-artist">⭐ Curated Producer</div>
    ${producer.songs.map(s => `<div class="producer-song">🎵 ${s}</div>`).join('')}
    <div class="producer-links">
      <a class="producer-link" href="${producer.youtube}" target="_blank" rel="noopener">YouTube</a>
      <a class="producer-link" href="${producer.soundcloud}" target="_blank" rel="noopener">SoundCloud</a>
    </div>
  `;
  grid.appendChild(card);
}

function renderItunesProducer(artist, songs, index) {
  const grid = document.getElementById('producerGrid');
  const card = document.createElement('div');
  card.className = 'producer-card';
  card.style.animationDelay = `${index * 0.08}s`;

  const initials = artist.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  card.innerHTML = `
    <div class="producer-thumb" style="display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:0.85rem;color:var(--blue-400);">${initials}</div>
    <div class="producer-name">${artist}</div>
    <div class="producer-artist">🎵 via iTunes</div>
    ${songs.slice(0, 3).map(s => `<div class="producer-song">🎵 ${s}</div>`).join('')}
    <div class="producer-links">
      <a class="producer-link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(artist + ' vocaloid')}" target="_blank" rel="noopener">YouTube</a>
      <a class="producer-link" href="https://soundcloud.com/search?q=${encodeURIComponent(artist)}" target="_blank" rel="noopener">SoundCloud</a>
    </div>
  `;
  grid.appendChild(card);
}



// SINGER PROFILES

const SINGERS = [
  {
    name: 'Hatsune Miku',
    synth: 'Vocaloid',
    emoji: '🩵',
    color: 'linear-gradient(135deg, #b3e5fc, #4dd0e1)',
    desc: 'The world\'s most iconic virtual singer. A 16-year-old with twin teal pigtails who conquered the globe.',
    longDesc: 'Hatsune Miku is a Vocaloid software voicebank developed by Crypton Future Media, using Yamaha\'s Vocaloid 2 synthesizer engine. Her voice is sampled from voice actress Saki Fujita. Debuting in August 2007, she became a cultural phenomenon, inspiring millions of fan-made songs, artworks, concerts, and a worldwide community.',
    songs: ['World is Mine (ryo)', 'Tell Your World (kz)', 'Melt (ryo)', 'The Disappearance of Hatsune Miku (cosMo)'],
    tags: ['Vocaloid', 'Crypton', 'CV-01']
  },
  {
    name: 'Kagamine Rin',
    synth: 'Vocaloid',
    emoji: '💛',
    color: 'linear-gradient(135deg, #fff9c4, #ffeb3b)',
    desc: 'Energetic and playful. Rin shares a "mirror image" bond with her twin Len, voiced by Asami Shimoda.',
    longDesc: 'Kagamine Rin & Len are Vocaloid vocals developed by Crypton Future Media, debuting December 2007. They are designed as 14-year-old twins, though officially described as "mirror images." Rin\'s voice is bright and youthful, making her popular for both upbeat and emotional songs.',
    songs: ['Meltdown', 'Servant of Evil', 'Kokoro', 'Roshin Yuukai'],
    tags: ['Vocaloid', 'Crypton', 'CV-02']
  },
  {
    name: 'Kagamine Len',
    synth: 'Vocaloid',
    emoji: '💙',
    color: 'linear-gradient(135deg, #fff9c4, #fff176)',
    desc: 'Rin\'s mirror twin. Len\'s voice carries a youthful boyish tone beloved in dramatic and emotional songs.',
    longDesc: 'Len Kagamine is the male counterpart of the Kagamine pair. His voice was provided by the same voice actress (Asami Shimoda) pitched differently. He is iconic in narrative, dramatic, and theatrical Vocaloid songs.',
    songs: ['Servant of Evil', 'Regret Message', 'Spice!', 'Ikanaide'],
    tags: ['Vocaloid', 'Crypton', 'CV-02']
  },
  {
    name: 'KAITO',
    synth: 'Vocaloid',
    emoji: '🔵',
    color: 'linear-gradient(135deg, #b3e5fc, #7986cb)',
    desc: 'A deep, mature male Vocaloid with a devoted fanbase. One of Crypton\'s original voices from 2006.',
    longDesc: 'KAITO is a Vocaloid voicebank by Crypton Future Media, first released in 2006 — making him one of the oldest Vocaloids. Known for his warm baritone voice and blue scarf, KAITO is beloved for emotional ballads and classical Japanese songs. He later received a major V3 update.',
    songs: ['Hajimete no Koi ga Owaru Toki', 'Ai no Scenario', 'Remote Control', 'Proof of Life'],
    tags: ['Vocaloid', 'Crypton', 'Male Voice']
  },
  {
    name: 'Kasane Teto',
    synth: 'UTAU',
    emoji: '🌸',
    color: 'linear-gradient(135deg, #f8bbd9, #f48fb1)',
    desc: 'Originally an April Fools\' prank, Teto became one of the most beloved UTAU voicebanks ever made.',
    longDesc: 'Kasane Teto was created on April 1, 2008 as a fictitious "new Vocaloid" prank. She became so popular that a real UTAU voicebank was created for her. She is distinguished by her twin drill-shaped hair and chimera heritage in her lore. She has a dedicated global fanbase and has since received Synthesizer V and other voice bank versions.',
    songs: ['Teto Territory', 'WAVE', 'Fukkireta', 'Fake Diva'],
    tags: ['UTAU', 'SynthV', 'Fanloid Origins']
  },
  {
    name: 'IA',
    synth: 'Vocaloid',
    emoji: '🌙',
    color: 'linear-gradient(135deg, #e8eaf6, #c5cae9)',
    desc: 'Voiced by Lia from Alchemy Sound, IA carries an ethereal quality perfect for atmospheric and dreamy music.',
    longDesc: 'IA is a Vocaloid developed by 1st Place Co. in 2012, using the voice of Japanese singer Lia. She is especially popular in the Western Vocaloid fandom for songs like "Imagination" and is the primary voice in numerous Jin/Shizen no Teki-P tracks from the Kagerou Project media franchise.',
    songs: ['Imagination', 'Headphone Actor', 'Outer Science', 'daze'],
    tags: ['Vocaloid', '1st Place', 'Kagerou Project']
  },
  {
    name: 'Flower (v flower)',
    synth: 'Vocaloid',
    emoji: '🌸',
    color: 'linear-gradient(135deg, #e8f5e9, #a5d6a7)',
    desc: 'A cool androgynous voice that became a fan favorite for rock, edgy, and expressive music styles.',
    longDesc: 'v flower is a Vocaloid developed by Internet Co., released in 2014. Her androgynous voice is provided by Yuzuki Yukari\'s voice actress. She\'s popular for rock and experimental songs, and her ambiguous gender presentation has made her especially beloved in LGBTQ+ and youth fan circles.',
    songs: ['Gimme×Gimme (with Hatsune Miku)', 'Reboot', 'Hibana', 'Drug Store'],
    tags: ['Vocaloid', 'Internet Co.', 'Androgynous']
  },
  {
    name: 'Solaria',
    synth: 'Synthesizer V',
    emoji: '✨',
    color: 'linear-gradient(135deg, #fce4ec, #f48fb1)',
    desc: 'An expressive AI-powered English singing voice for Synthesizer V, loved for her clear and emotive tone.',
    longDesc: 'Solaria is an English Synthesizer V voicebank developed by Eclipsed Sounds and published by Dreamtonics. Released in 2022, she features a bright and versatile English voice capable of deep emotional expression. She was one of the first community-produced SynthV voices to achieve wide mainstream attention in the Western virtual singer scene.',
    songs: ['Love Me Like You Do (cover)', 'Enemy (cover)', 'Original community tracks'],
    tags: ['Synthesizer V', 'English', 'Eclipsed Sounds']
  }
];

function renderSingers() {
  const grid = document.getElementById('singersGrid');
  SINGERS.forEach((singer, i) => {
    const card = document.createElement('div');
    card.className = 'singer-card reveal';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View ${singer.name} profile`);

    card.innerHTML = `
      <div class="singer-avatar" style="background:${singer.color};">${singer.emoji}</div>
      <div class="singer-name">${singer.name}</div>
      <div class="singer-synth">${singer.synth}</div>
      <div class="singer-desc">${singer.desc}</div>
    `;

    card.addEventListener('click', () => openSingerModal(singer));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openSingerModal(singer);
    });

    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

renderSingers();

// RANDOMIZER (FEELING LUCKY)

const LUCKY_QUERIES = [
  'hatsune miku', 'kagamine rin', 'kagamine len', 'kaito vocaloid',
  'megurine luka', 'gumi vocaloid', 'ia vocaloid', 'flower vocaloid',
  'kasane teto', 'vocaloid world is mine', 'vocaloid melt',
  'vocaloid ghost rule', 'vocaloid remote control', 'vocaloid decorator',
  'vocaloid odds ends', 'vocaloid blessing', 'vocaloid hibana',
  'wowaka vocaloid', 'ryo supercell', 'mitchie m vocaloid',
  'deco27 vocaloid', 'kenshi yonezu vocaloid', 'kz livetune miku',
  'vocaloid sweet devil', 'vocaloid romeo cinderella', 'vocaloid unfragment',
  'solaria synthesizer v', 'eleanor forte', 'synthesizer v cover'
];

let luckyAudio = null;

async function fetchLuckyTrack() {
  const spinner     = document.getElementById('luckySpinner');
  const errorEl     = document.getElementById('luckyError');
  const card        = document.getElementById('luckyCard');
  const placeholder = document.getElementById('luckyPlaceholder');

  if (luckyAudio) {
    luckyAudio.pause();
    luckyAudio = null;
    document.getElementById('luckyPlayBtn').textContent = '▶';
  }

  spinner.style.display = 'flex';
  errorEl.style.display = 'none';
  card.style.display = 'none';
  placeholder.style.display = 'none';

  try {
    const query = LUCKY_QUERIES[Math.floor(Math.random() * LUCKY_QUERIES.length)];
    const offset = Math.floor(Math.random() * 5); // vary the result each time
    const res  = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
    );
    const data = await res.json();

    const tracks = (data.results || []).filter(t => t.previewUrl);

    spinner.style.display = 'none';

    if (tracks.length === 0) {
      placeholder.style.display = 'flex';
      showError(errorEl, '⚠️ No preview found for this track. Try again!');
      return;
    }

    const track = tracks[Math.floor(Math.random() * tracks.length)];
    playLuckyTrack(track);

  } catch (err) {
    spinner.style.display = 'none';
    placeholder.style.display = 'flex';
    showError(errorEl, '⚠️ Could not fetch a track. Check your connection.');
  }
}

function playLuckyTrack(track) {
  const card    = document.getElementById('luckyCard');
  const thumb   = document.getElementById('luckyThumb');
  const title   = document.getElementById('luckyTitle');
  const artist  = document.getElementById('luckyArtist');
  const playBtn = document.getElementById('luckyPlayBtn');

  thumb.src  = track.artworkUrl100?.replace('100x100', '300x300') || '';
  thumb.alt  = track.trackName;
  title.textContent  = track.trackName  || 'Unknown Title';
  artist.textContent = `${track.artistName || '—'} · ${track.collectionName || ''}`;

  card.style.display = 'flex';

  luckyAudio = new Audio(track.previewUrl);
  luckyAudio.play().catch(() => {});
  playBtn.textContent = '⏸';

  luckyAudio.addEventListener('ended', () => {
    playBtn.textContent = '▶';
  });

  playBtn.onclick = () => {
    if (luckyAudio.paused) {
      luckyAudio.play();
      playBtn.textContent = '⏸';
    } else {
      luckyAudio.pause();
      playBtn.textContent = '▶';
    }
  };
}

document.getElementById('luckyBtn').addEventListener('click', fetchLuckyTrack);

// MODAL
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');

function openSingerModal(singer) {
  modalContent.innerHTML = `
    <div class="modal-avatar" style="background:${singer.color};">${singer.emoji}</div>
    <div class="modal-name">${singer.name}</div>
    <div class="modal-meta">
      ${singer.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
    </div>
    <p class="modal-desc">${singer.longDesc}</p>
    <div class="modal-songs">
      <h4>🎵 Notable Songs</h4>
      ${singer.songs.map(s => `<div class="modal-song-item">${s}</div>`).join('')}
    </div>
  `;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// MODAL ANIM
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.reveal').forEach(el => {
          el.classList.add('visible');
        });
      }
    });
  },
  { threshold: 0.05 }
);

document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));
