(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
    var activeCategory = "all";

    function searchableItems() {
      return Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    }

    function currentQuery() {
      for (var i = 0; i < searchInputs.length; i += 1) {
        if (searchInputs[i].value.trim()) {
          return searchInputs[i].value.trim().toLowerCase();
        }
      }
      return "";
    }

    function applyFilters() {
      var query = currentQuery();
      searchableItems().forEach(function (item) {
        var text = (item.getAttribute("data-search") || "").toLowerCase();
        var category = item.getAttribute("data-category") || "";
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesCategory = activeCategory === "all" || category === activeCategory;
        item.classList.toggle("is-hidden", !(matchesText && matchesCategory));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applyFilters);
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-category-filter") || "all";
        categoryButtons.forEach(function (btn) {
          btn.classList.toggle("active", btn === button);
        });
        applyFilters();
      });
    });
  });
}());
