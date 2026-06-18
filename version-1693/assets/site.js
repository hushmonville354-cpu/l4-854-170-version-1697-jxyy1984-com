(function () {
  var header = document.querySelector(".site-header");
  var navLinks = document.querySelector(".nav-links");
  var menuToggle = document.querySelector(".menu-toggle");

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var previews = Array.prototype.slice.call(document.querySelectorAll(".hero-preview"));
  var activeIndex = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    previews.forEach(function (preview, previewIndex) {
      preview.classList.toggle("is-active", previewIndex === activeIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      setHero(activeIndex + 1);
    }, 5200);
  }

  previews.forEach(function (preview, index) {
    preview.addEventListener("click", function () {
      setHero(index);
      if (timer) {
        window.clearInterval(timer);
        startHero();
      }
    });
  });

  setHero(0);
  startHero();

  Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-keywords]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-keywords") || "";
        card.style.display = !keyword || text.toLowerCase().indexOf(keyword) !== -1 ? "" : "none";
      });
    });
  });

  function cardTemplate(item) {
    return [
      '<article class="movie-card" data-keywords="', item.keywords, '">',
      '<a class="poster-link" href="', item.url, '" aria-label="', item.title, ' 在线观看">',
      '<img src="', item.cover, '" alt="', item.title, '">',
      '<span class="play-mark">▶</span>',
      '<span class="badge">', item.year, '</span>',
      '<span class="type-badge">', item.type, '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h2 class="movie-title"><a href="', item.url, '">', item.title, '</a></h2>',
      '<p class="movie-desc">', item.desc, '</p>',
      '<div class="card-meta"><span>', item.region, '</span><span>·</span><span>', item.genre, '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchResults = document.querySelector("[data-search-results]");

  if (searchInput && searchResults && Array.isArray(window.searchIndex)) {
    var initialItems = window.searchIndex.slice(0, 24);

    function renderSearch(items) {
      if (!items.length) {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
        return;
      }
      searchResults.innerHTML = items.slice(0, 80).map(cardTemplate).join("");
    }

    searchInput.addEventListener("input", function () {
      var keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) {
        renderSearch(initialItems);
        return;
      }
      var items = window.searchIndex.filter(function (item) {
        return item.keywords.toLowerCase().indexOf(keyword) !== -1;
      });
      renderSearch(items);
    });

    renderSearch(initialItems);
  }
}());

window.initPlayer = function (streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var playButton = document.querySelector("[data-player-button]");

  if (!video || !streamUrl) {
    return;
  }

  var isReady = false;

  function bindSource() {
    if (isReady) {
      return;
    }
    isReady = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.controls = true;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    bindSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playAction = video.play();
    if (playAction && typeof playAction.catch === "function") {
      playAction.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }
  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }
  video.addEventListener("click", function (event) {
    if (video.paused) {
      startPlayback(event);
    }
  });
};
