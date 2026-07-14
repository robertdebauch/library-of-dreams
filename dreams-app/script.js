(function () {
    'use strict';


    const dreams = [
        { id: 1, year: 2025, location: 'Париж', popupId: '1', title: 'Первый сон', description: 'Краткое описание...', audioUrl: 'https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams/audio/audio_1.mp3' },
        { id: 2, year: 2024, location: 'Токио', popupId: '2', title: 'Второй сон', description: 'Краткое описание...', audioUrl: null },
        { id: 3, year: 2025, location: 'Париж', popupId: '3', title: 'Третий сон', description: 'Краткое описание...', audioUrl: 'https://cdn.jsdelivr.net/gh/robertdebauch/library-of-dreams/audio/audio_2.wav' },
        { id: 4, year: 2023, location: 'Нью-Йорк', popupId: '4', title: 'Четвёртый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 5, year: 2024, location: 'Токио', popupId: '5', title: 'Пятый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 6, year: 2025, location: 'Лондон', popupId: '6', title: 'Шестой сон', description: 'Краткое описание...', audioUrl: null },
        { id: 7, year: 2025, location: 'Париж', popupId: '7', title: 'Седьмой сон', description: 'Краткое описание...', audioUrl: null },
        { id: 8, year: 2024, location: 'Токио', popupId: '8', title: 'Восьмой сон', description: 'Краткое описание...', audioUrl: null },
        { id: 9, year: 2025, location: 'Париж', popupId: '9', title: 'Девятый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 10, year: 2023, location: 'Нью-Йорк', popupId: '10', title: 'Десятый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 11, year: 2024, location: 'Токио', popupId: '11', title: 'Одиннадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 12, year: 2025, location: 'Лондон', popupId: '12', title: 'Двенадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 13, year: 2024, location: 'Токио', popupId: '13', title: 'Тринадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 14, year: 2025, location: 'Лондон', popupId: '14', title: 'Четырнадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 15, year: 2025, location: 'Париж', popupId: '15', title: 'Пятьнадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 16, year: 2024, location: 'Токио', popupId: '16', title: 'Шестьнадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 17, year: 2025, location: 'Париж', popupId: '17', title: 'Семьнадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 18, year: 2023, location: 'Нью-Йорк', popupId: '18', title: 'Восемьнадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 19, year: 2024, location: 'Токио', popupId: '19', title: 'Девятьнадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 20, year: 2025, location: 'Лондон', popupId: '20', title: 'Двадцатый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 21, year: 2024, location: 'Токио', popupId: '21', title: 'Двадцать первый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 22, year: 2025, location: 'Париж', popupId: '22', title: 'Двадцать второй сон', description: 'Краткое описание...', audioUrl: null },
        { id: 23, year: 2023, location: 'Нью-Йорк', popupId: '23', title: 'Двадцать третий сон', description: 'Краткое описание...', audioUrl: null },
        { id: 24, year: 2024, location: 'Токио', popupId: '24', title: 'Двадцать четвёртый сон', description: 'Краткое описание...', audioUrl: null },
        { id: 25, year: 2025, location: 'Лондон', popupId: '25', title: 'Двадцать пятый сон', description: 'Краткое описание...', audioUrl: null }
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
        return [...new Set(dreams.map(d => d.location))].sort((a, b) => a.localeCompare(b));
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
        const allTab = `<button class="dreams-filter__tab dreams-filter__tab--active" data-location="all">Все</button>`;
        const locationTabs = locations.map(loc => `<button class="dreams-filter__tab" data-location="${escapeHtml(loc)}">${escapeHtml(loc)}</button>`).join('');
        tabsContainer.innerHTML = allTab + locationTabs;
    }

    document.getElementById('filter-tabs').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target.closest('.dreams-filter__tab');
        if (!btn) return;
        document.querySelectorAll('.dreams-filter__tab').forEach(b => b.classList.remove('dreams-filter__tab--active'));
        btn.classList.add('dreams-filter__tab--active');
        currentFilter = btn.dataset.location;
        applyFiltersAndSort();
    });

    document.getElementById('sort-tabs').addEventListener('click', (e) => {
        e.stopPropagation();
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
    // 10. ПЛЕЕР + ЭМБИЕНТ (статичный бар)
    // =====================
    const playerBar = document.getElementById('dreams-player');
    const playerToggle = document.getElementById('player-toggle');
    const playerInfo = document.getElementById('player-info');
    // const ambientBtn = document.getElementById('ambient-toggle');

    // Обработчик клика по плееру
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

    // Обработчик эмбиента (заменяет старый, который был на ambientBtn)
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

    // const titleElement = document.getElementById('dreams-app');
    // if (titleElement) {
    //     let clickCount = 0;
    //     let clickTimer = null;
    //     titleElement.addEventListener('click', () => {
    //         clickCount++;
    //         if (clickCount === 3) {
    //             localStorage.removeItem(STORAGE_KEY);
    //             location.reload();
    //         }
    //         clearTimeout(clickTimer);
    //         clickTimer = setTimeout(() => { clickCount = 0; }, 500);
    //     });
    // }

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

    buildFilterTabs();
    applyFiltersAndSort();
    updatePlayer();

})();