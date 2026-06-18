(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function loadStream() {
        if (!video || !stream || loaded) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.load();
          loaded = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          loaded = true;
          return;
        }

        video.src = stream;
        video.load();
        loaded = true;
      }

      function showButton() {
        shell.classList.remove("is-playing");
        if (button) {
          button.hidden = false;
        }
      }

      function startPlayback() {
        loadStream();
        shell.classList.add("is-playing");
        if (button) {
          button.hidden = true;
        }
        if (video) {
          video.controls = true;
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(showButton);
          }
        }
      }

      loadStream();

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayback();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback();
          }
        });
        video.addEventListener("ended", showButton);
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      }, { once: true });
    });
  });
}());
