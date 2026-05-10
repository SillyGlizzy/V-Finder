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

// SYNTHESIZERS CAROUSEL
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

// AUDIO STATE 
let currentAudio = null;
let currentPlayBtn = null;
let luckyAudio = null;

function showAudioBar(title, url) {}
function hideAudioBar() {}

// POPULAR CHART — iTunes Search API
const CHART_QUERIES = [
  'Looping the rooms miku',
  'Execution Clap teto',
  'Brain Rot Teto',
  'Mesmerizer satsuki',
  'Ghost Experience satsuki'
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
      errorEl.textContent = '⚠️ No tracks found. Check your connection.';
      errorEl.style.display = 'block';
      return;
    }

    tracks.forEach((track, i) => renderChartCard(track, i));

  } catch (err) {
    console.error('Chart error:', err);
    spinner.style.display = 'none';
    errorEl.textContent = '⚠️ Could not load chart. Please check your connection.';
    errorEl.style.display = 'block';
  }
}

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
  if (luckyAudio) {
    luckyAudio.pause();
    luckyAudio = null;
    document.getElementById('luckyPlayBtn').textContent = '▶';
  }
  if (currentPlayBtn === btn) {
    currentAudio.pause(); currentAudio = null; currentPlayBtn = null;
    btn.classList.remove('playing'); btn.textContent = '▶';
    hideAudioBar(); return;
  }
  if (currentAudio) {
    currentAudio.pause();
    if (currentPlayBtn) { currentPlayBtn.classList.remove('playing'); currentPlayBtn.textContent = '▶'; }
  }
  currentAudio   = new Audio(btn.dataset.preview);
  currentPlayBtn = btn;
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

fetchChart();

// PRODUCER FINDER — iTunes API + local fallback
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
    image: './assets/image/singers/miku.png',
    wiki: 'https://vocaloid.fandom.com/wiki/Hatsune_Miku',
    desc: 'The virtual idol who redefined digital music culture with her iconic twin-tails and limitless collaborations.',
    longDesc: 'Hatsune Miku is a Vocaloid voicebank developed by Crypton Future Media using Yamaha’s Vocaloid engine, with her voice sampled from Saki Fujita. Since her debut in August 2007, she has grown into a worldwide phenomenon, inspiring an enormous catalog of fan-created music, illustrations, live holographic concerts, and an international creative community.',
    songs: ['World is Mine (ryo)', 'Tell Your World (kz)', 'Melt (ryo)', 'The Disappearance of Hatsune Miku (cosMo)'],
    tags: ['Vocaloid', 'Crypton', 'CV-01']
  },
  {
    name: 'Kasane Teto',
    synth: 'SynthV',
    emoji: '🥖',
    color: 'linear-gradient(135deg, #f8bbd9, #f48fb1)',
    image: './assets/image/singers/teto.webp',
    wiki: 'https://synthv.fandom.com/wiki/Kasane_Teto',
    desc: 'From parody character to beloved icon, Teto became a legendary presence in the voice synth community.',
    longDesc: 'Kasane Teto began as an April Fools’ joke in 2008, introduced as a fake Vocaloid. Her unexpected popularity led to the creation of an official UTAU voicebank, and later Synthesizer V versions. Over time, she evolved into a respected and widely recognized character with a dedicated global fanbase.',
    songs: ['Kasane Territory', 'Triple Baka', 'WAVE', 'Fake Diva'],
    tags: ['UTAU', 'SynthV', 'Fanloid Origins']
  },
  {
    name: 'Kagamine Len',
    synth: 'Vocaloid',
    emoji: '🍌',
    color: 'linear-gradient(135deg, #fff9c4, #fff176)',
    image: './assets/image/singers/len.jpg',
    wiki: 'https://vocaloid.fandom.com/wiki/Kagamine_Len',
    desc: 'The dynamic counterpart to Rin, known for his clear, youthful tone and dramatic presence.',
    longDesc: 'Kagamine Len is the counterpart of Kagamine Rin released by Crypton Future Media. His voice stands out in theatrical and narrative-driven songs, particularly in dramatic story series such as the Story of Evil, where his expressive delivery plays a central role.',
    songs: ['Servant of Evil', 'Regret Message', 'Spice!', 'Ikanaide'],
    tags: ['Vocaloid', 'Crypton', 'CV-02']
  },
  {
    name: 'Kagamine Rin',
    synth: 'Vocaloid',
    emoji: '💛',
    color: 'linear-gradient(135deg, #fff9c4, #ffeb3b)',
    image: './assets/image/singers/rin.jpg',
    wiki: 'https://vocaloid.fandom.com/wiki/Kagamine_Rin',
    desc: 'Bright, bold, and expressive — Rin brings sharp energy and emotional depth to the Kagamine duo.',
    longDesc: 'Kagamine Rin debuted alongside Len in December 2007 as part of Crypton’s CV-02 series. Characterized by her youthful yet powerful tone, Rin excels in both high-energy tracks and emotionally intense compositions, often portraying dramatic or strong-willed characters in storytelling songs.',
    songs: ['Meltdown', 'Servant of Evil', 'Kokoro', 'Roshin Yuukai'],
    tags: ['Vocaloid', 'Crypton', 'CV-02']
  },
  {
    name: 'Megurine Luka',
    synth: 'Vocaloid',
    emoji: '🐟',
    color: 'linear-gradient(135deg, #f8bbd0, #ce93d8)',
    image: './assets/image/singers/luka.webp',
    wiki: 'https://vocaloid.fandom.com/wiki/Megurine_Luka',
    desc: 'A refined bilingual Vocaloid celebrated for her smooth tone and mature musical style.',
    longDesc: 'Released in 2009 by Crypton Future Media, Megurine Luka was the first Vocaloid designed for both Japanese and English singing. Her controlled, elegant voice suits electronic, jazz, and emotional ballads, and her V4X update further enhanced her tonal flexibility and clarity.',
    songs: ['Just Be Friends', 'Luka Luka★Night Fever', 'Double Lariat', 'Palette'],
    tags: ['Vocaloid', 'Crypton', 'Female Voice', 'Bilingual']
  },
  {
    name: 'KAITO',
    synth: 'Vocaloid',
    emoji: '🔵',
    color: 'linear-gradient(135deg, #b3e5fc, #7986cb)',
    image: './assets/image/singers/kaito.jpg',
    wiki: 'https://vocaloid.fandom.com/wiki/KAITO',
    desc: 'A warm baritone voicebank recognized for its depth, clarity, and lasting legacy.',
    longDesc: 'KAITO debuted in 2006 as one of Crypton’s earliest Vocaloids. Known for his smooth baritone tone and composed image, he gained renewed popularity after receiving a V3 update, expanding his expressive capabilities for both classical and contemporary styles.',
    songs: ['Hajimete no Koi ga Owaru Toki', 'Ai no Scenario', 'Remote Control', 'Proof of Life'],
    tags: ['Vocaloid', 'Crypton', 'Male Voice']
  },
  {
    name: 'MEIKO',
    synth: 'Vocaloid',
    emoji: '🔴',
    color: 'linear-gradient(135deg, #ef9a9a, #c62828)',
    image: './assets/image/singers/meiko.webp',
    wiki: 'https://vocaloid.fandom.com/wiki/MEIKO',
    desc: 'One of the earliest Japanese Vocaloids, distinguished by her strong and confident vocal tone.',
    longDesc: 'Released in 2004 by Crypton Future Media, MEIKO was among the first Japanese-language Vocaloids. Her powerful and mature voice established her as a foundational figure in the Vocaloid lineup, later refined through a V3 update that broadened her tonal expression.',
    songs: ['Change Me', 'Nostalogic', 'Piano x Forte x Scandal', 'Evil Food Eater Conchita'],
    tags: ['Vocaloid', 'Crypton', 'Female Voice', 'Original Generation']
  },
  {
  name: 'KAFU',
  synth: 'CeVIO',
  emoji: '🧊',
  color: 'linear-gradient(135deg, #e0f7fa, #b39ddb)',
  image: './assets/image/singers/kafu.webp',
  wiki: 'https://cevio.fandom.com/wiki/KAFU',
  desc: 'A soft yet piercing voicebank known for its fragile, emotional tone and indie appeal.',
  longDesc: 'KAFU is a CeVIO AI voicebank developed by KAMITSUBAKI STUDIO and released in 2021. Based on the voice of virtual singer KAF, she is recognized for her airy, delicate timbre that conveys vulnerability and emotional intensity. KAFU is especially popular in alternative, experimental, and emotionally driven compositions, quickly becoming a favorite among modern producers.',
  songs: ['Phony', 'Envy Baby (cover versions)', 'Traffic Jam', 'Cute na Kanojo'],
  tags: ['CeVIO AI', 'KAMITSUBAKI STUDIO', 'Emotional Tone']
  },
  {
    name: 'GUMI',
    synth: 'Vocaloid',
    emoji: '💚',
    color: 'linear-gradient(135deg, #a5d6a7, #66bb6a)',
    image: './assets/image/singers/gumi.webp',
    wiki: 'https://vocaloid.fandom.com/wiki/GUMI',
    desc: 'Versatile and vibrant, GUMI is known for her adaptability across pop, rock, and emotional tracks.',
    longDesc: 'GUMI, also known as Megpoid, was released in 2009 by Internet Co., Ltd., featuring the voice of singer Megumi Nakajima. Praised for her flexible range and strong articulation, GUMI has become a staple in both high-energy rock songs and heartfelt ballads, supported by multiple engine updates.',
    songs: ['Echo', 'Matryoshka', 'Mozaik Role', 'Coward Montblanc'],
    tags: ['Vocaloid', 'Internet Co.', 'Female Voice']
  },
  {
    name: 'Flower (v flower)',
    synth: 'Vocaloid',
    emoji: '🌸',
    color: 'linear-gradient(135deg, #e8f5e9, #a5d6a7)',
    image: './assets/image/singers/flower.webp',
    wiki: 'https://vocaloid.fandom.com/wiki/Flower',
    desc: 'An androgynous powerhouse voice favored for intense, rock-driven compositions.',
    longDesc: 'v flower debuted in 2014 under Internet Co. Known for her sharp, expressive tone and distinctive vocal texture, she is frequently used in rock, alternative, and experimental tracks that demand emotional intensity and edge.',
    songs: ['Gimme×Gimme (with Hatsune Miku)', 'Reboot', 'Hibana', 'Drug Store'],
    tags: ['Vocaloid', 'Internet Co.', 'Androgynous']
  }
];

function renderSingers() {
  const grid = document.getElementById('singersGrid');
  SINGERS.forEach((singer) => {
    const card = document.createElement('div');
    card.className = 'singer-card reveal';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View ${singer.name} profile`);

    card.innerHTML = `
      <div class="singer-photo-wrap">
        <img
          class="singer-photo"
          src="${singer.image}"
          alt="${singer.name}"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="singer-avatar-fallback" style="background:${singer.color}; display:none;">${singer.emoji}</div>
      </div>
      <div class="singer-info">
        <div class="singer-name">${singer.name}</div>
        <div class="singer-synth">${singer.synth}</div>
        <div class="singer-desc">${singer.desc}</div>
      </div>
      <button class="singer-wiki-btn" aria-label="Open ${singer.name} Fandom Wiki">
        🔗 Open Fandom Wiki
      </button>
    `;

    // Card body click 
    card.addEventListener('click', (e) => {
      if (e.target.closest('.singer-wiki-btn')) return;
      openSingerModal(singer);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openSingerModal(singer);
    });

    // Wiki button 
    card.querySelector('.singer-wiki-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(singer.wiki, '_blank', 'noopener');
    });

    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

renderSingers();

// FEELING LUCKY — iTunes Search API (same reason as chart)
const LUCKY_QUERIES = [
  'hatsune miku',
  'kagamine rin',
  'kagamine len',
  'megurine luka',
  'kaito vocaloid',
  'gumi vocaloid',
  'ia vocaloid',
  'v-flower vocaloid',
  'kasane teto',
  'kafu vocaloid',
  'kaai yuki vocaloid',
  'zundamon',
  'nurse_robot type-t',
  'deco*27',
  'iyowa vocaloid',
  'sasakure.uk vocaloid',
  'nayutalien vocaloid',
  'pinocchioP vocaloid',
  'tosho_aTe',
  'R sound design vocaloid',
  'MIMI vocaloid',
  'pinocchioP vocaloid',
  'jamie paige teto',
  'sawtowne vocaloid'
];

async function fetchLuckyTrack(retries = 5) {
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
    const res   = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20`
    );
    const data  = await res.json();
    const tracks = (data.results || []).filter(t => t.previewUrl);

    spinner.style.display = 'none';

    if (tracks.length === 0) {
      if (retries > 0) return fetchLuckyTrack(retries - 1);
      placeholder.style.display = 'flex';
      errorEl.textContent = '⚠️ No preview found. Try again!';
      errorEl.style.display = 'block';
      return;
    }

    const track = tracks[Math.floor(Math.random() * tracks.length)];
    playLuckyTrack(track);

  } catch (err) {
    console.error('Lucky error:', err);
    spinner.style.display = 'none';
    placeholder.style.display = 'flex';
    errorEl.textContent = '⚠️ Could not fetch a track. Check your connection.';
    errorEl.style.display = 'block';
  }
}

function playLuckyTrack(track) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    if (currentPlayBtn) {
      currentPlayBtn.classList.remove('playing');
      currentPlayBtn.textContent = '▶';
      currentPlayBtn = null;
    }
  }

  const card    = document.getElementById('luckyCard');
  const thumb   = document.getElementById('luckyThumb');
  const title   = document.getElementById('luckyTitle');
  const artist  = document.getElementById('luckyArtist');
  const playBtn = document.getElementById('luckyPlayBtn');

  thumb.src          = track.artworkUrl100 || '';
  thumb.alt          = track.trackName;
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
    <div class="modal-avatar">
      <img
        class="modal-avatar-img"
        src="${singer.image}"
        alt="${singer.name}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="modal-avatar-fallback" style="background:${singer.color}; display:none;">${singer.emoji}</div>
    </div>
    <div class="modal-name">${singer.name}</div>
    <div class="modal-meta">
      ${singer.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
    </div>
    <p class="modal-desc">${singer.longDesc}</p>
    <div class="modal-songs">
      <h4>🎵 Notable Songs</h4>
      ${singer.songs.map(s => `<div class="modal-song-item">${s}</div>`).join('')}
    </div>
    <a class="modal-wiki-btn" href="${singer.wiki}" target="_blank" rel="noopener">
      🔗 View Full Profile on Fandom Wiki
    </a>
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

// SECTION REVEAL
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
