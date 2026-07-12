window.cgiSelectMode = false;
window.cgiSelected = new Set();
window.cgiVisibleCount = 12;
window.cgiSortDirection = 'newest';
window.cgiAlbumOrder = [];

function cgiIsAlbumPage() {
  return !!document.querySelector('.photonic-standard-layout:not(.photonic-level-2-container)');
}

if (document.querySelector('.photonic-smug-stream, .photonic-level-2-container, .photonic-standard-layout')) {
  document.body.classList.add('cgi-gallery-page');
}

function cgiEnsureAlbumOrderInit(container) {
  if (!window.cgiAlbumOrder.length) {
    window.cgiAlbumOrder = Array.from(container.querySelectorAll(':scope > .photonic-level-2.photonic-thumb'));
  }
}

function cgiRenderAlbumOrder(container) {
  var order = window.cgiAlbumOrder;
  var display = window.cgiSortDirection === 'oldest' ? order.slice().reverse() : order;
  display.forEach(function(t) { container.appendChild(t); });
}

function cgiUpdateVisibility() {
  var year = document.getElementById('filter-year') ? document.getElementById('filter-year').value : 'all';
  var division = document.getElementById('filter-division') ? document.getElementById('filter-division').value : 'all';
  var week = document.getElementById('filter-week') ? document.getElementById('filter-week').value : 'all';
  var shown = 0;
  document.querySelectorAll('.photonic-level-2.photonic-thumb').forEach(function(thumb) {
    var desc = thumb.querySelector('.custom-desc');
    var text = desc ? desc.textContent : '';
    var img = thumb.querySelector('img');
    var src = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
    var yearMatch = year === 'all' || src.indexOf('/' + year + '/') > -1;
    var divMatch = division === 'all' || text.indexOf(division) > -1;
    var weekMatch = week === 'all' || text.indexOf(week) > -1;
    var filterMatch = yearMatch && divMatch && weekMatch;
    if (filterMatch && shown < window.cgiVisibleCount) {
      thumb.style.display = 'block';
      shown++;
    } else {
      thumb.style.display = 'none';
    }
  });
  var container = document.querySelector('.photonic-level-2-container');
  var btn = document.getElementById('cgi-load-more');
  if (btn && container) {
    var total = container.querySelectorAll(':scope > .photonic-level-2.photonic-thumb').length;
    var moreAvailable = total > window.cgiVisibleCount || !!container.getAttribute('data-photonic-query');
    btn.style.display = moreAvailable ? '' : 'none';
  }
}

function cgiInsertFilters() {
  if (cgiIsAlbumPage()) return true;
  if (document.getElementById('gallery-filters')) return true;
  var stream = document.querySelector('.photonic-smug-stream');
  if (!stream) return false;

  function mkField(labelText, el) {
    var field = document.createElement('div');
    field.className = 'gallery-filter-field';
    var label = document.createElement('label');
    label.className = 'gallery-filter-label';
    label.textContent = labelText;
    field.appendChild(label);
    field.appendChild(el);
    return field;
  }

  var filterDiv = document.createElement('div');
  filterDiv.id = 'gallery-filters';

  var yearSelect = document.createElement('select');
  yearSelect.id = 'filter-year';
  var allYearsOpt = document.createElement('option');
  allYearsOpt.value = 'all';
  allYearsOpt.textContent = 'All Years';
  yearSelect.appendChild(allYearsOpt);

  var divSelect = document.createElement('select');
  divSelect.id = 'filter-division';
  ['All Divisions','Main Camp','Temim
