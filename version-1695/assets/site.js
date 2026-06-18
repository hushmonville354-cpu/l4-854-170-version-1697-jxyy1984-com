(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function toggleMenu() {
        var button = document.querySelector("[data-menu-button]");
        var links = document.querySelector("[data-nav-links]");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;

        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    function setupFilters() {
        var input = document.querySelector("[data-search-input]");
        var select = document.querySelector("[data-year-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card-item"));
        var empty = document.querySelector("[data-empty-message]");
        if (!cards.length || (!input && !select)) {
            return;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var year = select ? select.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute("data-year") === year;
                var shouldShow = matchKeyword && matchYear;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
        apply();
    }

    function attachHls(video, source) {
        if (video.dataset.ready === "1") {
            return Promise.resolve();
        }
        video.dataset.ready = "1";

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
            return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
    }

    window.SitePlayer = {
        create: function (videoId, source) {
            ready(function () {
                var video = document.getElementById(videoId);
                if (!video) {
                    return;
                }
                var frame = video.closest(".player-frame");
                var startButton = frame ? frame.querySelector(".play-button") : null;
                var cover = frame ? frame.querySelector(".play-cover") : null;

                function start() {
                    attachHls(video, source).then(function () {
                        if (frame) {
                            frame.classList.add("playing");
                        }
                        var playPromise = video.play();
                        if (playPromise && typeof playPromise.catch === "function") {
                            playPromise.catch(function () {
                                if (cover) {
                                    cover.style.opacity = "0.94";
                                }
                            });
                        }
                    });
                }

                if (startButton) {
                    startButton.addEventListener("click", start);
                }

                if (cover) {
                    cover.addEventListener("click", start);
                }

                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
            });
        }
    };

    ready(function () {
        toggleMenu();
        setupHero();
        setupFilters();
    });
})();
