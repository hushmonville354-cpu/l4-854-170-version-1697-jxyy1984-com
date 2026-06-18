(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (navToggle && nav) {
            navToggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-filter-input]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var emptyTip = document.querySelector("[data-empty-tip]");

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var keyword = normalize(searchInput ? searchInput.value : "");
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + card.getAttribute("data-genre") + card.getAttribute("data-tags") + card.getAttribute("data-region"));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute("data-year") === year;
                var matchType = !type || card.getAttribute("data-type") === type;
                var show = matchKeyword && matchYear && matchType;

                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (emptyTip) {
                emptyTip.style.display = visible ? "none" : "block";
            }
        }

        if (searchInput || yearSelect || typeSelect) {
            var params = new URLSearchParams(window.location.search);
            if (searchInput && params.get("q")) {
                searchInput.value = params.get("q");
            }
            [searchInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });
})();
