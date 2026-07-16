(function () {
    'use strict';


    // 1. Data loading 

    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQITS5CstuDRDakSdIX02kOiEMCmoF1Kflh56TQXfdSaoOjJUB50E3D8wwxNnZE8peKrkpXDjgnFMt9/pub?gid=0&single=true&output=csv';
    let dreams = [];

    async function loadDreams() {
        try {
            const response = await fetch(CSV_URL + '&t=' + Date.now());
            if (!response.ok) throw new Error('Network error');
            const csvText = await response.text();

            // Используем PapaParse для корректного разбора CSV с кавычками и запятыми
            const result = Papa.parse(csvText, {
                header: true,           // первая строка — заголовки
                skipEmptyLines: true,
                trimHeaders: true,
                trimValues: true
            });

            dreams = result.data.map(row => ({
                ...row,
                id: parseInt(row.id, 10) || 0,
                year: parseInt(row.year, 10) || 0
            })).filter(d => d.id > 0);
        } catch (err) {
            console.warn('CSV load failed, using local data.js', err);
            dreams = window.dreamsData || [];
        }

        buildFilterTabs();
        applyFiltersAndSort();
        updatePlayer();
    }

    // 2. Dreams read

    const STORAGE_KEY = 'dreams_read';
    function getReadDreams() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
    }
    function markAsRead(dreamId) {
        const read = getReadDreams();
        if (!read.includes(dreamId)) {
            read.push(dreamId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(read));
        }
    }

    // 3. Utils

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function applyTypography(text) {
        if (!text) return text;
        // Список коротких слов, после которых пробел заменяется на неразрывный
        const shortWords = [
            'a', 'an', 'the', 'in', 'on', 'at', 'by', 'for', 'to', 'of', 'with',
            'and', 'or', 'but', 'nor', 'so', 'yet', 'not', 'from', 'into', 'onto',
            'upon', 'within', 'without', 'over', 'under', 'above', 'below',
            'between', 'among', 'through', 'during', 'before', 'after',
            'behind', 'beside', 'along', 'around', 'down', 'up', 'off', 'out',
            'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
            'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could',
            'I', 'you', 'he', 'she', 'it', 'we', 'they',
            'me', 'him', 'her', 'us', 'them',
            'my', 'your', 'his', 'its', 'our', 'their',
            'mine', 'yours', 'hers', 'ours', 'theirs',
            'this', 'that', 'these', 'those',
            'no', 'not', 'as', 'if', 'or'
        ];
        // Ищем короткое слово + пробел (учитываем границы слова, регистр)
        const regex = new RegExp(`\\b(${shortWords.join('|')})\\s+`, 'gi');
        return text.replace(regex, (match, p1) => p1 + '\u00A0');
    }

    function getUniqueLocations() {
        return [...new Set(dreams.map(d => d.location))].sort((a, b) => a.localeCompare(b));
    }


    // 4. Render of Cards

    const grid = document.getElementById('dreams-grid');
    const countSpan = document.getElementById('dreams-count-value');

    function renderDreams(dreamsArray) {
        const readIds = getReadDreams();
        const html = dreamsArray.map(dream => {
            const isRead = readIds.includes(dream.id);
            const readHtml = `
        <button class="dream-card__link" data-dream-id="${dream.id}" aria-expanded="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6l0 13" />
            <path d="M12 6l0 13" />
            <path d="M21 6l0 13" />
          </svg>
          READ
        </button>
      `;
            const audioHtml = dream.audioUrl ? `
        <button class="dream-card__audio-btn" data-audio="${escapeHtml(dream.audioUrl)}" data-dream-id="${dream.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3" />
            <path d="M15 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3" />
            <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
          </svg>
          LISTEN
        </button>
      ` : '';
            return `
  <div class="dream-card ${isRead ? 'dream-card--read' : ''}" data-dream-id="${dream.id}">
    <div class="dream-card__content">
      <h3 class="dream-card__title">${escapeHtml(applyTypography(dream.dreamer || 'Untitled'))}</h3>
      <p class="dream-card__meta">${escapeHtml(dream.yearDisplay || dream.year)} · ${escapeHtml(dream.place || dream.location)}</p>
      ${dream.description ? `<p class="dream-card__desc">${escapeHtml(applyTypography(dream.description))}</p>` : ''}
      <div class="dream-card__details" style="display: none;">
        <div class="dream-card__source"><strong>Source:</strong> ${escapeHtml(applyTypography(dream.source || ''))}</div>
        <div class="dream-card__fulltext">${escapeHtml(applyTypography(dream.fullText || ''))}</div>
      </div>
    </div>
    <div class="dream-card__actions">
      ${readHtml}
      ${audioHtml}
    </div>
  </div>
`;
        }).join('');
        grid.innerHTML = html;
        countSpan.textContent = dreamsArray.length;
        syncAudioButtons();
    }

    // 5. Filters, Sort

    let currentFilter = 'all';
    let currentSort = 'id-asc';

    function applyFiltersAndSort() {
        let filtered = [...dreams];
        if (currentFilter !== 'all') filtered = filtered.filter(d => d.location === currentFilter);
        switch (currentSort) {
            case 'id-asc': filtered.sort((a, b) => a.id - b.id); break;
            case 'year-desc': filtered.sort((a, b) => b.year - a.year); break;
            case 'year-asc': filtered.sort((a, b) => a.year - b.year); break;
            case 'location-asc': filtered.sort((a, b) => a.location.localeCompare(b.location)); break;
            case 'location-desc': filtered.sort((a, b) => b.location.localeCompare(a.location)); break;
        }
        renderDreams(filtered);
    }

    function buildFilterTabs() {
        const tabsContainer = document.getElementById('filter-tabs');
        const locations = getUniqueLocations();
        const allTab = `<button class="dreams-filter__tab dreams-filter__tab--active" data-location="all">All</button>`;
        const locationTabs = locations.map(loc => `<button class="dreams-filter__tab" data-location="${escapeHtml(loc)}">${escapeHtml(loc)}</button>`).join('');
        tabsContainer.innerHTML = allTab + locationTabs;
    }

    // FLIP-animaton
    function flipSort(sortFunction) {
        const oldCards = document.querySelectorAll('.dream-card');
        const oldPositions = {};
        oldCards.forEach(card => {
            const id = card.dataset.dreamId;
            if (id) oldPositions[id] = card.getBoundingClientRect();
        });
        sortFunction();
        const newCards = document.querySelectorAll('.dream-card');
        newCards.forEach(card => {
            const id = card.dataset.dreamId;
            const oldRect = oldPositions[id];
            const newRect = card.getBoundingClientRect();
            if (!oldRect) {
                gsap.from(card, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.out' });
                return;
            }
            const deltaX = oldRect.left - newRect.left;
            const deltaY = oldRect.top - newRect.top;
            if (deltaX !== 0 || deltaY !== 0) {
                gsap.set(card, { x: deltaX, y: deltaY });
                gsap.to(card, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
            }
        });
    }

    document.getElementById('filter-tabs').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target.closest('.dreams-filter__tab');
        if (!btn) return;
        document.querySelectorAll('.dreams-filter__tab').forEach(b => b.classList.remove('dreams-filter__tab--active'));
        btn.classList.add('dreams-filter__tab--active');
        currentFilter = btn.dataset.location;
        flipSort(() => applyFiltersAndSort());
    });

    document.getElementById('sort-tabs').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target.closest('.dreams-sort__tab');
        if (!btn) return;
        document.querySelectorAll('.dreams-sort__tab').forEach(b => b.classList.remove('dreams-sort__tab--active'));
        btn.classList.add('dreams-sort__tab--active');
        currentSort = btn.dataset.sort;
        flipSort(() => applyFiltersAndSort());
    });

    // 6. card: read checking and card opening

    grid.addEventListener('click', (event) => {
        const link = event.target.closest('.dream-card__link');
        if (!link) return;

        const dreamId = parseInt(link.dataset.dreamId, 10);
        if (isNaN(dreamId)) return;

        const card = link.closest('.dream-card');
        if (!card) return;

        const details = card.querySelector('.dream-card__details');
        if (!details) return;

        const isHidden = details.style.display === 'none';

        if (isHidden) {
            // Закрываем все остальные открытые карточки
            document.querySelectorAll('.dream-card__details[style*="display: block"]').forEach(otherDetails => {
                if (otherDetails !== details) {
                    otherDetails.style.display = 'none';
                    otherDetails.closest('.dream-card').classList.remove('dream-card--expanded');
                    const otherLink = otherDetails.closest('.dream-card').querySelector('.dream-card__link');
                    if (otherLink) {
                        otherLink.setAttribute('aria-expanded', 'false');
                        otherLink.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
              <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
              <path d="M3 6l0 13" />
              <path d="M12 6l0 13" />
              <path d="M21 6l0 13" />
            </svg>
            READ`;
                        otherLink.blur(); // убираем фокус с закрытой кнопки
                    }
                }
            });

            // Открываем текущую
            card.classList.add('dream-card--expanded');
            
            details.style.display = 'block';
            link.setAttribute('aria-expanded', 'true');
            link.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
      </svg> CLOSE`;
            link.blur(); // сразу убираем фокус, чтобы на мобильных не подсвечивался
            card.classList.add('dream-card--expanded');
        } else {
            // Закрываем текущую
            details.style.display = 'none';
            link.setAttribute('aria-expanded', 'false');
            link.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
        <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
        <path d="M3 6l0 13" />
        <path d="M12 6l0 13" />
        <path d="M21 6l0 13" />
      </svg> READ`;
            link.blur();
            card.classList.remove('dream-card--expanded');

            // Отмечаем прочитанным
            markAsRead(dreamId);
            card.classList.add('dream-card--read');

            // Возвращаемся к карточке (чтобы не уезжала вверх)
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        }
    });

    // 7. Audio & Player

    const ambientBtn = document.getElementById('ambient-toggle');
    const ambient = new Howl({
        src: ['https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams/audio/ambient.wav'],
        loop: true,
        volume: 0,
        preload: true
    });
    let ambientOn = false;

    let voiceHowl = null;
    let voiceDreamId = null;
    let voicePlaying = false;

    function syncAudioButtons() {
        document.querySelectorAll('.dream-card__audio-btn').forEach(btn => {
            const btnDreamId = parseInt(btn.dataset.dreamId, 10);
            if (voiceHowl && voiceDreamId === btnDreamId && voicePlaying) {
                btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
            <path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
          </svg>
          PAUSE
        `;
            } else {
                btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3" />
            <path d="M15 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3" />
            <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
          </svg>
          LISTEN
        `;
            }
        });
    }

    const playerBar = document.getElementById('dreams-player');
    const playerToggle = document.getElementById('player-toggle');
    const playerInfo = document.getElementById('player-info');

    if (playerToggle) {
        playerToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!voiceHowl) return;
            if (voicePlaying) {
                voiceHowl.pause();
            } else {
                voiceHowl.play();
            }
        });
    }

    if (ambientBtn) {
        ambientBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!ambientOn) {
                ambient.volume(1.0);
                ambient.play();
                ambientBtn.classList.add('ambient-btn--on');
                ambientBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        <path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
        <path d="M9 17v-13h10v13" />
        <path d="M9 8h10" />
      </svg>`;
                ambientOn = true;
            } else {
                ambient.pause();
                ambient.volume(0);
                ambientBtn.classList.remove('ambient-btn--on');
                ambientBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M14.42 14.45a3 3 0 1 0 4.138 4.119" />
        <path d="M9 17v-8m0 -4v-1h10v11" />
        <path d="M12 8h7" />
        <path d="M3 3l18 18" />
      </svg>`;
                ambientOn = false;
            }
        });
    }

    function updatePlayer() {
        if (!playerBar) return;
        if (voiceHowl) {
            playerBar.style.display = 'flex';
            const dream = dreams.find(d => d.id === voiceDreamId);
            playerInfo.textContent = dream ? `${dream.dreamer || 'Untitled'} · ${dream.yearDisplay || dream.year}` : 'In Focus';
            playerToggle.innerHTML = voicePlaying ?
                `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
         <path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
         <path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
       </svg>` :
                `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
         <path d="M7 4v16l13 -8z" />
       </svg>`;
        } else {
            playerBar.style.display = 'none';
        }
    }

    const originalSync = syncAudioButtons;
    syncAudioButtons = function () {
        originalSync();
        updatePlayer();
    };

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.dream-card__audio-btn');
        if (!btn) return;
        e.stopPropagation();

        const url = btn.dataset.audio;
        const dreamId = parseInt(btn.dataset.dreamId, 10);
        if (!url || isNaN(dreamId)) return;

        if (voiceHowl && voiceDreamId === dreamId) {
            if (voicePlaying) {
                voiceHowl.pause();
                voicePlaying = false;
            } else {
                voiceHowl.play();
                voicePlaying = true;
            }
            syncAudioButtons();
            return;
        }

        if (voiceHowl) {
            voiceHowl.stop();
            voiceHowl.unload();
            voiceHowl = null;
            voiceDreamId = null;
            voicePlaying = false;
        }

        voiceHowl = new Howl({
            src: [url],
            preload: true,
            onplay: function () {
                voicePlaying = true;
                syncAudioButtons();
            },
            onpause: function () { voicePlaying = false; syncAudioButtons(); },
            onstop: function () { voicePlaying = false; syncAudioButtons(); },
            onend: function () {
                voicePlaying = false;
                voiceDreamId = null;
                voiceHowl = null;
                syncAudioButtons();
            },
        });
        voiceDreamId = dreamId;
        voiceHowl.play();
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    const secretReset = document.getElementById('secret-reset');
    if (secretReset) {
        let clickCount = 0;
        let clickTimer = null;
        secretReset.addEventListener('click', (event) => {
            event.stopPropagation();
            clickCount++;
            if (clickCount >= 3) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 800);
        });
    }

    // 8. Start

    loadDreams();
})();