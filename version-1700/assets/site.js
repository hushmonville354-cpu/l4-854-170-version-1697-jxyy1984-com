(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function resetTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(next, 5000);
    }

    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        resetTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        resetTimer();
      });
    });

    resetTimer();
  }

  var searchInput = document.querySelector('[data-card-search]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));

      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
      var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
      var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;

      card.classList.toggle('is-hidden', !(matchesQuery && matchesRegion && matchesType && matchesYear));
    });
  }

  if (cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('moviePlayer');
  var button = document.getElementById('moviePlayButton');

  if (!video || !button || !sourceUrl) {
    return;
  }

  var hlsInstance = null;
  var initialized = false;

  function tryPlay() {
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function start() {
    if (initialized) {
      tryPlay();
      return;
    }

    initialized = true;
    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', tryPlay, { once: true });
      tryPlay();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      video.addEventListener('canplay', tryPlay, { once: true });
      return;
    }

    video.src = sourceUrl;
    video.addEventListener('loadedmetadata', tryPlay, { once: true });
    tryPlay();
  }

  button.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (!initialized) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
