(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var links = qs('[data-nav-links]');
    var search = qs('.nav-search');

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
      if (search) {
        search.classList.toggle('is-open');
      }
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var items = [];

    try {
      items = JSON.parse(hero.getAttribute('data-hero-items') || '[]');
    } catch (error) {
      items = [];
    }

    if (!items.length) {
      return;
    }

    var title = qs('[data-hero-title]', hero);
    var line = qs('[data-hero-line]', hero);
    var meta = qs('[data-hero-meta]', hero);
    var image = qs('[data-hero-image]', hero);
    var link = qs('[data-hero-link]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;

    function render(index) {
      var item = items[index];

      if (!item) {
        return;
      }

      current = index;

      if (title) {
        title.textContent = item.title;
      }

      if (line) {
        line.textContent = item.line;
      }

      if (meta) {
        meta.textContent = item.meta;
      }

      if (image) {
        image.style.opacity = '0.12';
        window.setTimeout(function () {
          image.src = item.cover;
          image.alt = item.title;
          image.style.opacity = '0.34';
        }, 180);
      }

      if (link) {
        link.href = item.href;
      }

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        render(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      render((current + 1) % items.length);
    }, 5200);

    render(0);
  }

  function setupLocalFilter() {
    var input = qs('[data-local-filter]');
    var list = qs('[data-filter-list]');
    var count = qs('[data-filter-count]');

    if (!input || !list) {
      return;
    }

    var cards = qsa('[data-card]', list);

    function filter() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    input.addEventListener('input', filter);
    filter();
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="./' + escapeHtml(item.file) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-glow"></span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.type) + '</span>',
      '    </div>',
      '    <h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.line) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var input = qs('#searchInput');
    var results = qs('#searchResults');
    var summary = qs('#searchSummary');

    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var keyword = normalize(input.value);
      var data = window.MOVIE_SEARCH_DATA || [];
      var matches = keyword ? data.filter(function (item) {
        return normalize([
          item.title,
          item.line,
          item.summary,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(' ')
        ].join(' ')).indexOf(keyword) !== -1;
      }) : data.slice(0, 36);

      var limited = matches.slice(0, 120);
      results.innerHTML = limited.map(movieCard).join('');

      if (summary) {
        if (!keyword) {
          summary.textContent = '默认展示 36 部影片，输入关键词可搜索全部影片。';
        } else {
          summary.textContent = '找到 ' + matches.length + ' 部相关影片，当前展示前 ' + limited.length + ' 部。';
        }
      }
    }

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
}());
