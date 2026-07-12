(function () {
    'use strict';


    const dreams = [
        { id: 1, year: 2025, location: 'Париж', popupId: '1', title: 'Первый сон', description: 'Краткое описание...', audioUrl: 'https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams/audio/audio_1.mp3' },
        { id: 2, year: 2024, location: 'Токио', popupId: '2', title: 'Второй сон', description: 'Краткое описание...', audioUrl: null },
        { id: 3, year: 2025, location: 'Париж', popupId: '3', title: 'Третий сон', description: 'Краткое описание...', audioUrl: 'https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams/audio/audio_2.wav' },
        { id: 4, year: 2023, location: 'Нью-Йорк', popupId: '4', title: 'Четвёртый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 5, year: 2024, location: 'Токио', popupId: '5', title: 'Пятый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 6, year: 2025, location: 'Лондон', popupId: '6', title: 'Шестой сон', description: 'Краткое описание...', audioUrl: 'https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams/audio/audio_4.m4a' }
    ];


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


    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    function getUniqueLocations() {
        return [...new Set(dreams.map(d => d.location))].sort((a, b) => a.localeCompare(b, 'ru'));
    }


    const grid = document.getElementById('dreams-grid');
    const countSpan = document.getElementById('dreams-count-value');

    function renderDreams(dreamsArray) {
        const readIds = getReadDreams();
        const html = dreamsArray.map(dream => {
            const isRead = readIds.includes(dream.id);
            const readHtml = `
        <a href="#${dream.popupId}" class="dream-card__link" role="button" aria-haspopup="dialog" data-dream-id="${dream.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6l0 13" />
            <path d="M12 6l0 13" />
            <path d="M21 6l0 13" />
          </svg>
          READ
        </a>
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
            <h3 class="dream-card__title">${escapeHtml(dream.title)}</h3>
            <p class="dream-card__meta">${dream.year} · ${escapeHtml(dream.location)}</p>
            <p class="dream-card__desc">${escapeHtml(dream.description)}</p>
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

    let currentFilter = 'all';
    let currentSort = 'year-desc';

    function applyFiltersAndSort() {
        let filtered = [...dreams];
        if (currentFilter !== 'all') filtered = filtered.filter(d => d.location === currentFilter);
        switch (currentSort) {
            case 'year-desc': filtered.sort((a, b) => b.year - a.year); break;
            case 'year-asc': filtered.sort((a, b) => a.year - b.year); break;
            case 'location-asc': filtered.sort((a, b) => a.location.localeCompare(b.location, 'ru')); break;
            case 'location-desc': filtered.sort((a, b) => b.location.localeCompare(a.location, 'ru')); break;
        }
        renderDreams(filtered);
    }

    function buildFilterTabs() {
        const tabsContainer = document.getElementById('filter-tabs');
        const locations = getUniqueLocations();
        const allTab = `<button class="dreams-filter__tab dreams-filter__tab--active" data-location="all">Все</button>`;
        const locationTabs = locations.map(loc => `<button class="dreams-filter__tab" data-location="${escapeHtml(loc)}">${escapeHtml(loc)}</button>`).join('');
        tabsContainer.innerHTML = allTab + locationTabs;
    }

    document.getElementById('filter-tabs').addEventListener('click', (e) => {
        const btn = e.target.closest('.dreams-filter__tab');
        if (!btn) return;
        document.querySelectorAll('.dreams-filter__tab').forEach(b => b.classList.remove('dreams-filter__tab--active'));
        btn.classList.add('dreams-filter__tab--active');
        currentFilter = btn.dataset.location;
        applyFiltersAndSort();
    });

    document.getElementById('sort-tabs').addEventListener('click', (e) => {
        const btn = e.target.closest('.dreams-sort__tab');
        if (!btn) return;
        document.querySelectorAll('.dreams-sort__tab').forEach(b => b.classList.remove('dreams-sort__tab--active'));
        btn.classList.add('dreams-sort__tab--active');
        currentSort = btn.dataset.sort;
        applyFiltersAndSort();
    });


    grid.addEventListener('click', (e) => {
        const link = e.target.closest('.dream-card__link');
        if (!link) return;
        const dreamId = parseInt(link.dataset.dreamId, 10);
        if (!isNaN(dreamId)) {
            markAsRead(dreamId);
            const card = link.closest('.dream-card');
            if (card) card.classList.add('dream-card--read');
        }
    });


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



    // =====================
    // 10. ПЛЕЕР (с корректными обработчиками и защитой от тройного клика)
    // =====================
    let playerBar, playerToggle, playerInfo;

    function createPlayer() {
        const app = document.getElementById('dreams-app');
        if (!app) return;

        const player = document.createElement('div');
        player.id = 'dreams-player';
        player.className = 'dreams-player';
        player.style.display = 'none';

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'player-toggle';
        toggleBtn.className = 'player-toggle';
        toggleBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 4v16l13 -8z" />
    </svg>`;

        const infoSpan = document.createElement('span');
        infoSpan.id = 'player-info';
        infoSpan.className = 'player-info';

        player.appendChild(toggleBtn);
        player.appendChild(infoSpan);
        app.appendChild(player);

        playerBar = player;
        playerToggle = toggleBtn;
        playerInfo = infoSpan;

        // Обработчик клика прямо здесь, когда кнопка уже существует
        playerToggle.addEventListener('click', (e) => {
            e.stopPropagation();               // не даём всплыть до #dreams-app
            if (!voiceHowl) return;
            if (voicePlaying) {
                voiceHowl.pause();
            } else {
                voiceHowl.play();
            }
            // updatePlayer вызовется через syncAudioButtons -> updatePlayer
        });
    }

    function updatePlayer() {
        if (!playerBar) return;
        if (voiceHowl) {
            playerBar.style.display = 'flex';
            const dream = dreams.find(d => d.id === voiceDreamId);
            playerInfo.textContent = dream ? `${dream.title} (${dream.year} · ${dream.location})` : 'Сейчас играет';

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

    // Подключаем обновление плеера к syncAudioButtons
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
            onplay: function () { voicePlaying = true; syncAudioButtons(); },
            onpause: function () { voicePlaying = false; syncAudioButtons(); },
            onstop: function () { voicePlaying = false; syncAudioButtons(); },
            onend: function () {
                voicePlaying = false;
                voiceDreamId = null;
                voiceHowl = null;
                syncAudioButtons();
            }
        });

        voiceDreamId = dreamId;
        voiceHowl.play();
    });

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


    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    const titleElement = document.getElementById('dreams-app');
    if (titleElement) {
        let clickCount = 0;
        let clickTimer = null;
        titleElement.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 3) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 500);
        });
    }


    buildFilterTabs();
    applyFiltersAndSort();
    createPlayer();
    updatePlayer();

})();