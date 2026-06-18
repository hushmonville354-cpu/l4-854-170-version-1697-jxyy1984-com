document.querySelectorAll('[data-player]').forEach(function (wrap) {
  var video = wrap.querySelector('video');
  var startButton = wrap.querySelector('[data-player-start]');
  var toggleButton = wrap.querySelector('[data-player-toggle]');
  var muteButton = wrap.querySelector('[data-player-mute]');
  var fullscreenButton = wrap.querySelector('[data-player-fullscreen]');
  var hls = null;
  var initialized = false;
  var Hls = window.Hls;

  function setLoading(value) {
    wrap.classList.toggle('loading', Boolean(value));
  }

  function setPlaying(value) {
    wrap.classList.toggle('playing', Boolean(value));
    if (toggleButton) {
      toggleButton.textContent = value ? 'Ⅱ' : '▶';
    }
  }

  function initPlayer() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    setLoading(true);
    var src = video.getAttribute('data-src');

    return new Promise(function (resolve) {
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setLoading(false);
            wrap.classList.remove('loading');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          setLoading(false);
          resolve();
        }, { once: true });
      } else {
        setLoading(false);
        resolve();
      }
    });
  }

  function playVideo() {
    initPlayer().then(function () {
      video.play().catch(function () {
        setPlaying(false);
      });
    });
  }

  function toggle() {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  }

  if (startButton) {
    startButton.addEventListener('click', toggle);
  }
  if (toggleButton) {
    toggleButton.addEventListener('click', toggle);
  }
  if (video) {
    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      setPlaying(true);
    });
    video.addEventListener('pause', function () {
      setPlaying(false);
    });
    video.addEventListener('waiting', function () {
      setLoading(true);
    });
    video.addEventListener('playing', function () {
      setLoading(false);
    });
  }
  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '×' : '◎';
    });
  }
  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        wrap.requestFullscreen();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
