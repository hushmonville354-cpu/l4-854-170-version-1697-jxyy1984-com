(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    window.CinemaPlayer = {
        setup: function (options) {
            ready(function () {
                var video = document.getElementById(options.videoId);
                var overlay = document.getElementById(options.overlayId);
                var button = document.getElementById(options.buttonId);
                var loaded = false;

                function startPlayback(event) {
                    if (event) {
                        event.preventDefault();
                    }
                    if (!video) {
                        return;
                    }
                    if (!loaded) {
                        if (video.canPlayType("application/vnd.apple.mpegurl")) {
                            video.src = options.stream;
                        } else if (window.Hls && window.Hls.isSupported()) {
                            var hls = new window.Hls({
                                maxBufferLength: 30,
                                enableWorker: true
                            });
                            hls.loadSource(options.stream);
                            hls.attachMedia(video);
                            video.hlsInstance = hls;
                        } else {
                            video.src = options.stream;
                        }
                        loaded = true;
                    }
                    video.controls = true;
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                    var playAction = video.play();
                    if (playAction && playAction.catch) {
                        playAction.catch(function () {});
                    }
                }

                if (overlay) {
                    overlay.addEventListener("click", startPlayback);
                }
                if (button) {
                    button.addEventListener("click", startPlayback);
                }
                if (video) {
                    video.addEventListener("click", function () {
                        if (!loaded || video.paused) {
                            startPlayback();
                        }
                    });
                }
            });
        }
    };
})();
