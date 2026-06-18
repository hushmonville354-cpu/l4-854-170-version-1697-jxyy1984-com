(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileNav && header) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      header.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5600);
    }
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
      img.removeAttribute('src');
    }, { once: true });
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var year = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    function value(node) {
      return node ? String(node.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var q = value(input);
      var r = value(region);
      var t = value(type);
      var y = value(year);

      cards.forEach(function (card) {
        var search = String(card.getAttribute('data-search') || '').toLowerCase();
        var ok = true;
        if (q && search.indexOf(q) === -1) {
          ok = false;
        }
        if (r && String(card.getAttribute('data-region') || '').toLowerCase() !== r) {
          ok = false;
        }
        if (t && String(card.getAttribute('data-type') || '').toLowerCase() !== t) {
          ok = false;
        }
        if (y && String(card.getAttribute('data-year') || '').toLowerCase() !== y) {
          ok = false;
        }
        card.classList.toggle('hidden', !ok);
      });
    }

    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
      apply();
    }
  });
})();
