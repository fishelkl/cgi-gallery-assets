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

function cgiMarkImgLoaded(img) {
  img.classList.add('cgi-img-loaded');
  var thumb = img.closest('.photonic-level-2.photonic-thumb');
  if (thumb) thumb.classList.add('cgi-thumb-ready');
}

function cgiGetLoadIndicator() {
  var el = document.getElementById('cgi-load-indicator');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'cgi-load-indicator';
  el.innerHTML = '<span class="cgi-dot"></span><span class="cgi-dot"></span><span class="cgi-dot"></span><span>Loading more</span>';
  document.body.appendChild(el);
  return el;
}
function cgiShowLoadIndicator() { cgiGetLoadIndicator().classList.add('cgi-visible'); }
function cgiHideLoadIndicator() {
  var el = document.getElementById('cgi-load-indicator');
  if (el) el.classList.remove('cgi-visible');
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
  ['All Divisions','Main Camp','Temimim'].forEach(function(opt) {
    var o = document.createElement('option');
    o.value = opt === 'All Divisions' ? 'all' : opt;
    o.textContent = opt;
    divSelect.appendChild(o);
  });

  var weekSelect = document.createElement('select');
  weekSelect.id = 'filter-week';
  var allWeeksOpt = document.createElement('option');
  allWeeksOpt.value = 'all';
  allWeeksOpt.textContent = 'All Weeks';
  weekSelect.appendChild(allWeeksOpt);

  var sortSelect = document.createElement('select');
  sortSelect.id = 'gallery-sort-select';
  [['newest','Newest First'],['oldest','Oldest First']].forEach(function(pair) {
    var o = document.createElement('option');
    o.value = pair[0];
    o.textContent = pair[1];
    sortSelect.appendChild(o);
  });

  yearSelect.addEventListener('change', function() { window.cgiVisibleCount = 12; window.cgiFilterGallery(); });
  divSelect.addEventListener('change', function() { window.cgiVisibleCount = 12; window.cgiFilterGallery(); });
  weekSelect.addEventListener('change', function() { window.cgiVisibleCount = 12; window.cgiFilterGallery(); });
  sortSelect.addEventListener('change', function() {
    window.cgiSortDirection = sortSelect.value;
    var container = document.querySelector('.photonic-level-2-container');
    if (!container) return;
    cgiEnsureAlbumOrderInit(container);
    cgiRenderAlbumOrder(container);
    cgiUpdateVisibility();
  });

  filterDiv.appendChild(mkField('Year', yearSelect));
  filterDiv.appendChild(mkField('Division', divSelect));
  filterDiv.appendChild(mkField('Week', weekSelect));
  filterDiv.appendChild(mkField('Sort', sortSelect));

  stream.parentNode.insertBefore(filterDiv, stream);
  return true;
}

window.cgiFilterGallery = function() {
  cgiUpdateVisibility();
};

window.cgiPopulateFilters = function() {
  var weeks = [], years = [];
  document.querySelectorAll('.photonic-level-2.photonic-thumb').forEach(function(thumb) {
    var desc = thumb.querySelector('.custom-desc');
    var img = thumb.querySelector('img');
    var src = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
    if (desc && desc.textContent) {
      var wm = desc.textContent.match(/Week \d+/i);
      if (wm && weeks.indexOf(wm[0]) === -1) weeks.push(wm[0]);
    }
    if (src) {
      var ym = src.match(/\/(\d{4})\//);
      if (ym && years.indexOf(ym[1]) === -1) years.push(ym[1]);
    }
  });
  weeks.sort(function(a,b){ return parseInt(a.replace('Week ','')) - parseInt(b.replace('Week ','')); });
  years.sort(function(a,b){ return b - a; });
  var weekSel = document.getElementById('filter-week');
  if (weekSel && weeks.length) {
    var weekKey = weeks.join(',');
    if (weekSel.dataset.cgiOptionsKey !== weekKey) {
      weekSel.dataset.cgiOptionsKey = weekKey;
      while(weekSel.options.length>1) weekSel.remove(1);
      weeks.forEach(function(w){ var o=document.createElement('option'); o.value=w; o.textContent=w; weekSel.appendChild(o); });
    }
  }
  var yearSel = document.getElementById('filter-year');
  if (yearSel && years.length) {
    var yearKey = years.join(',');
    if (yearSel.dataset.cgiOptionsKey !== yearKey) {
      yearSel.dataset.cgiOptionsKey = yearKey;
      while(yearSel.options.length>1) yearSel.remove(1);
      years.forEach(function(y){ var o=document.createElement('option'); o.value=y; o.textContent=y; yearSel.appendChild(o); });
    }
  }
};

window.cgiFixGallery = function() {
  if (cgiIsAlbumPage()) return;
  var isMobile = window.innerWidth < 768;
  var container = document.querySelector('.photonic-level-2-container');
  if (container) container.style.cssText = 'display:grid!important;grid-template-columns:' + (isMobile ? '1fr 1fr' : '1fr 1fr 1fr') + ';gap:' + (isMobile ? '8px' : '10px') + ';columns:unset;column-count:unset;width:100%;box-sizing:border-box;';
  document.querySelectorAll('.photonic-level-2.photonic-thumb').forEach(function(thumb) {
    if (!thumb.dataset.cgiLinkFixed) {
      thumb.dataset.cgiLinkFixed = '1';
      var link = thumb.querySelector('a');
      var linkImg = thumb.querySelector('img');
      var linkTitleEl = thumb.querySelector('.photonic-title');
      if (link && linkImg && linkTitleEl) {
        var origHref = link.getAttribute('href') || '';
        try {
          var hu = new URL(origHref, window.location.origin);
          var b64 = hu.searchParams.get('photonic_gallery');
          if (b64) {
            var decoded = atob(b64);
            var am = decoded.match(/album="([^"]+)"/);
            if (am) thumb.setAttribute('data-cgi-album-id', am[1]);
          }
        } catch (e) {}
        var linkSrc = linkImg.getAttribute('src') || linkImg.getAttribute('data-src') || '';
        var ym = linkSrc.match(/\/(\d{4})\//);
        var year = ym ? ym[1] : null;
        var division = linkSrc.indexOf('Main-Camp') > -1 ? 'main-camp' : linkSrc.indexOf('Temimim') > -1 ? 'temimim' : null;
        var wm = linkSrc.match(/Week-(\d+)/i);
        var week = wm ? wm[1] : '';
        var titleText = linkTitleEl.textContent.trim();
        var slug = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (year && division && slug) {
          link.href = 'https://cgiflorida.com/boys/' + year + '/' + division + '/' + slug + '/';
        }
        thumb.setAttribute('data-cgi-title', titleText);
        if (week) thumb.setAttribute('data-cgi-week', week);
      }
    }
    var fig = thumb.querySelector('figcaption.photonic-title-info');
    var titleEl = thumb.querySelector('.photonic-title');
    var img = thumb.querySelector('img');
    if (fig) fig.style.cssText = 'position:absolute!important;bottom:' + (isMobile?'28px':'38px') + '!important;left:' + (isMobile?'18px':'18px') + '!important;right:' + (isMobile?'18px':'18px') + '!important;width:auto!important;height:auto!important;background:none!important;padding:0!important;z-index:2!important;overflow:visible!important;display:block!important;';
    if (titleEl) titleEl.style.cssText = 'display:block!important;width:100%!important;color:#fff!important;text-transform:uppercase!important;letter-spacing:1px!important;line-height:1.02!important;margin:0!important;padding:0!important;font-size:' + (isMobile?'25px':'26px') + '!important;font-family:Teko,sans-serif!important;text-align:left!important;overflow-wrap:break-word!important;word-break:break-word!important;white-space:normal!important;box-sizing:border-box!important;';
    if (img && img.complete && img.naturalWidth) {
      cgiMarkImgLoaded(img);
    } else if (img && !img.dataset.cgiLoadBound) {
      img.dataset.cgiLoadBound = '1';
      img.addEventListener('load', function() { cgiMarkImgLoaded(img); });
      img.addEventListener('error', function() { cgiMarkImgLoaded(img); });
    }
    if (thumb.querySelector('.custom-desc')) return;
    if (img) {
      var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      var division = src.indexOf('Main-Camp') > -1 ? 'Main Camp' : src.indexOf('Temimim') > -1 ? 'Temimim' : '';
      var wm = src.match(/Week-(\d+)/i);
      var week = wm ? 'Week ' + wm[1] : '';
      var subtitle = division && week ? division + ' \xB7 ' + week : division || week || '';
      if (subtitle) {
        var desc = document.createElement('div');
        desc.className = 'custom-desc';
        desc.style.cssText = 'position:absolute!important;bottom:' + (isMobile?'8px':'18px') + '!important;left:18px!important;right:18px!important;width:auto!important;color:rgba(255,255,255,0.75)!important;font-size:' + (isMobile?'9px':'12px') + '!important;letter-spacing:1.5px!important;text-transform:uppercase!important;font-family:Teko,sans-serif!important;z-index:3!important;display:block!important;text-align:left!important;overflow-wrap:break-word!important;box-sizing:border-box!important;';
        desc.textContent = subtitle;
        thumb.appendChild(desc);
      }
    }
  });
  window.cgiPopulateFilters();
};

function cgiSlugKey(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cgiDecodeHtml(str) {
  var el = document.createElement('textarea');
  el.innerHTML = str || '';
  return el.value;
}

window.cgiPagesPromise = null;
function cgiFetchAllPages() {
  if (window.cgiPagesPromise) return window.cgiPagesPromise;
  window.cgiPagesPromise = (async function() {
    var all = [];
    var page = 1;
    while (page <= 20) {
      var resp;
      try {
        resp = await fetch('https://cgiflorida.com/boys/wp-json/wp/v2/pages?per_page=100&page=' + page + '&_fields=id,slug,parent,link,title');
      } catch (e) { break; }
      if (!resp.ok) break;
      var batch = await resp.json();
      if (!Array.isArray(batch) || !batch.length) break;
      all = all.concat(batch);
      if (batch.length < 100) break;
      page++;
    }
    return all;
  })();
  return window.cgiPagesPromise;
}

window.cgiAlbumLinksPromise = null;
function cgiFetchAlbumLinks() {
  if (window.cgiAlbumLinksPromise) return window.cgiAlbumLinksPromise;
  window.cgiAlbumLinksPromise = fetch('https://cgi-photo-proxy.fishelkleinman.workers.dev/album-links')
    .then(function(r) { return r.ok ? r.json() : []; })
    .catch(function() { return []; });
  return window.cgiAlbumLinksPromise;
}
if (cgiIsAlbumPage()) cgiFetchAlbumLinks();

function cgiResolveByPagesTitle(thumb, pages) {
  var byId = {};
  pages.forEach(function(p) { byId[p.id] = p; });
  var titleKey = cgiSlugKey(thumb.getAttribute('data-cgi-title'));
  var week = thumb.getAttribute('data-cgi-week') || '';
  if (!titleKey) return null;
  var matches = pages.filter(function(p) {
    return cgiSlugKey(cgiDecodeHtml(p.title && p.title.rendered)) === titleKey;
  });
  if (!matches.length) return null;
  var chosen = matches[0];
  if (matches.length > 1 && week) {
    var weekMatch = matches.find(function(p) {
      var parent = byId[p.parent];
      return parent && parent.slug === 'week-' + week;
    });
    if (weekMatch) chosen = weekMatch;
  }
  return (chosen && chosen.link) ? chosen.link : null;
}

function cgiFixThumbnailLinksAsync() {
  var thumbs = Array.from(document.querySelectorAll('.photonic-level-2.photonic-thumb[data-cgi-title]:not([data-cgi-link-resolved])'));
  if (!thumbs.length) return;
  cgiFetchAlbumLinks().then(function(albumLinks) {
    var linkByAlbumId = {};
    albumLinks.forEach(function(a) { linkByAlbumId[a.albumId] = a.link; });

    var unresolved = [];
    thumbs.forEach(function(thumb) {
      var albumId = thumb.getAttribute('data-cgi-album-id');
      var link = thumb.querySelector('a');
      if (albumId && linkByAlbumId[albumId] && link) {
        thumb.setAttribute('data-cgi-link-resolved', '1');
        link.href = linkByAlbumId[albumId];
      } else {
        unresolved.push(thumb);
      }
    });

    if (!unresolved.length) return;

    cgiFetchAllPages().then(function(pages) {
      unresolved.forEach(function(thumb) {
        thumb.setAttribute('data-cgi-link-resolved', '1');
        var link = thumb.querySelector('a');
        if (!link || !pages.length) return;
        var resolved = cgiResolveByPagesTitle(thumb, pages);
        if (resolved) link.href = resolved;
      });
    }).catch(function() {});
  }).catch(function() {});
}

function cgiResolveThumbLink(thumb, fallbackHref) {
  var albumId = thumb.getAttribute('data-cgi-album-id');
  if (!albumId) {
    var link = thumb.querySelector('a');
    var href = link ? (link.getAttribute('href') || '') : '';
    try {
      var hu = new URL(href, window.location.origin);
      var b64 = hu.searchParams.get('photonic_gallery');
      if (b64) {
        var decoded = atob(b64);
        var am = decoded.match(/album="([^"]+)"/);
        if (am) albumId = am[1];
      }
    } catch (err) {}
  }
  return cgiFetchAlbumLinks().then(function(albumLinks) {
    if (albumId) {
      var byAlbum = albumLinks.find(function(a) { return a.albumId === albumId; });
      if (byAlbum) return byAlbum.link;
    }
    return cgiFetchAllPages().then(function(pages) {
      var resolved = pages.length ? cgiResolveByPagesTitle(thumb, pages) : null;
      return resolved || fallbackHref;
    });
  }).catch(function() { return fallbackHref; });
}

document.addEventListener('click', function(e) {
  var link = e.target.closest('.photonic-level-2.photonic-thumb a');
  if (!link) return;
  var thumb = link.closest('.photonic-level-2.photonic-thumb');
  if (!thumb) return;
  var href = link.getAttribute('href') || '';
  e.preventDefault();
  cgiResolveThumbLink(thumb, href).then(function(finalUrl) {
    window.location.href = finalUrl;
  });
}, true);

function cgiLoadMoreAlbums(container, btn) {
  var query = container.getAttribute('data-photonic-query');
  var provider = container.getAttribute('data-photonic-platform');
  if (!query || !provider) { btn.style.display = 'none'; return; }
  btn.textContent = 'Loading...';
  cgiShowLoadIndicator();
  fetch('https://cgiflorida.com/boys/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'action=photonic_load_more&provider=' + encodeURIComponent(provider) + '&query=' + encodeURIComponent(query)
  }).then(function(r) { return r.text(); }).then(function(html) {
    var scratch = document.createElement('div');
    scratch.innerHTML = html;
    var newThumbs = Array.from(scratch.querySelectorAll('.photonic-level-2.photonic-thumb'));
    newThumbs.forEach(function(t) {
      container.appendChild(t);
      window.cgiAlbumOrder.push(t);
    });
    var newContainer = scratch.querySelector('.photonic-level-2-container, .photonic-level-1-container');
    var nq = newContainer ? newContainer.getAttribute('data-photonic-query') : null;
    if (newThumbs.length && nq) {
      container.setAttribute('data-photonic-query', nq);
    } else {
      container.removeAttribute('data-photonic-query');
    }
    cgiRenderAlbumOrder(container);
    window.cgiFixGallery();
    cgiUpdateVisibility();
    cgiFixThumbnailLinksAsync();
    btn.textContent = 'Load More';
    cgiHideLoadIndicator();
  }).catch(function() {
    btn.textContent = 'Load More';
    cgiHideLoadIndicator();
  });
}

function cgiHandleLoadMoreClick(container, btn) {
  window.cgiVisibleCount += 12;
  cgiUpdateVisibility();
  var total = container.querySelectorAll(':scope > .photonic-level-2.photonic-thumb').length;
  if (total < window.cgiVisibleCount && container.getAttribute('data-photonic-query')) {
    cgiLoadMoreAlbums(container, btn);
  }
}

function cgiInsertLoadMoreButton() {
  if (cgiIsAlbumPage()) return true;
  if (document.getElementById('cgi-load-more')) return true;
  var container = document.querySelector('.photonic-level-2-container');
  if (!container) return false;
  cgiEnsureAlbumOrderInit(container);
  var btn = document.createElement('a');
  btn.id = 'cgi-load-more';
  btn.href = '#';
  btn.className = 'photonic-more-button photonic-more-dynamic';
  btn.textContent = 'Load More';
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    cgiHandleLoadMoreClick(container, btn);
  });
  container.parentNode.appendChild(btn);
  cgiUpdateVisibility();
  return true;
}

(function() {
  var loading = false;
  function cgiCheckInfiniteScroll() {
    var btn = document.getElementById('cgi-load-more');
    if (!btn || btn.style.display === 'none' || loading) return;
    var rect = btn.getBoundingClientRect();
    if (rect.top < window.innerHeight + 800) {
      loading = true;
      btn.click();
      setTimeout(function() { loading = false; }, 600);
    }
  }
  window.addEventListener('scroll', cgiCheckInfiniteScroll);
  setInterval(cgiCheckInfiniteScroll, 500);
})();

(function() {
  var loadingAlbumMore = false;
  var countAtLastClick = -1;
  function cgiCheckAlbumInfiniteScroll() {
    if (!cgiIsAlbumPage()) return;
    var btn = document.querySelector('.photonic-smug-stream > a.photonic-more-button.photonic-more-dynamic, .photonic-stream > a.photonic-more-button.photonic-more-dynamic');
    if (!btn || btn.offsetParent === null) { loadingAlbumMore = false; cgiHideLoadIndicator(); return; }
    var container = document.querySelector('.photonic-standard-layout');
    var currentCount = container ? container.querySelectorAll('figure').length : 0;
    if (loadingAlbumMore) {
      if (currentCount !== countAtLastClick) { loadingAlbumMore = false; cgiHideLoadIndicator(); }
      else return;
    }
    var rect = btn.getBoundingClientRect();
    if (rect.top < window.innerHeight + 800) {
      loadingAlbumMore = true;
      countAtLastClick = currentCount;
      cgiShowLoadIndicator();
      btn.click();
    }
  }
  window.addEventListener('scroll', cgiCheckAlbumInfiniteScroll);
  setInterval(cgiCheckAlbumInfiniteScroll, 500);
})();

window.cgiMasonryLayout = function() {
  if (!cgiIsAlbumPage()) return;
  var container = document.querySelector('.photonic-standard-layout');
  if (!container || !container.offsetWidth) return;

  function doLayout() {
    if (!container.offsetWidth) return;
    var figures = Array.from(container.querySelectorAll('figure'));
    if (!figures.length) return;
    var cols = window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4;
    var gap = 8;
    var colWidth = (container.offsetWidth - (gap * (cols - 1))) / cols;
    var colHeights = Array(cols).fill(0);
    container.style.position = 'relative';
    figures.forEach(function(fig) {
      var img = fig.querySelector('img');
      var h = (img && img.naturalWidth) ? colWidth * (img.naturalHeight / img.naturalWidth) : colWidth * 0.75;
      fig.style.position = 'absolute';
      fig.style.width = colWidth + 'px';
      fig.style.margin = '0';
      var minCol = colHeights.indexOf(Math.min.apply(null, colHeights));
      fig.style.left = (minCol * (colWidth + gap)) + 'px';
      fig.style.top = colHeights[minCol] + 'px';
      colHeights[minCol] += h + gap;
    });
    container.style.height = Math.max.apply(null, colHeights) + 'px';
    container.classList.add('cgi-masonry-ready');
  }

  var pending = false;
  function scheduleLayout() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function() { pending = false; doLayout(); });
  }

  container.querySelectorAll('img:not([data-cgi-masonry-bound])').forEach(function(img) {
    img.setAttribute('data-cgi-masonry-bound', '1');
    if (img.complete && img.naturalWidth) {
      cgiMarkImgLoaded(img);
      scheduleLayout();
    } else {
      img.addEventListener('load', function() { cgiMarkImgLoaded(img); scheduleLayout(); });
      img.addEventListener('error', function() { cgiMarkImgLoaded(img); scheduleLayout(); });
    }
  });
  scheduleLayout();
};

function cgiSizedUrl(src, code) {
  return src.replace(/\/[A-Z0-9]+\/([^\/]+)-[A-Z0-9]+\.jpg$/i, '/' + code + '/$1-' + code + '.jpg');
}

function cgiOriginalFilename(src) {
  var m = src.match(/\/([^\/]+)-[A-Z0-9]+\.jpg$/i);
  return m ? m[1] + '.jpg' : 'photo.jpg';
}

function cgiProxyUrl(url, filename) {
  var u = 'https://cgi-photo-proxy.fishelkleinman.workers.dev/?url=' + encodeURIComponent(url);
  if (filename) u += '&name=' + encodeURIComponent(filename);
  return u;
}

var CGI_ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
  select: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="13" height="13" rx="2"></rect><path d="M8 12l2 2 4-4"></path></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="M7 10l5 5 5-5"></path><path d="M5 21h14"></path></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="10.6" x2="15.4" y2="6.4"></line><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"></line></svg>'
};

function cgiMakeIconBtn(name, label) {
  var btn = document.createElement('a');
  btn.href = '#';
  btn.className = 'cgi-icon-btn';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = CGI_ICONS[name] || '';
  return btn;
}

function cgiWireDownloadMenu(btn, menu) {
  var open = false;
  function onDocClick(e) {
    if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close();
  }
  function close() {
    open = false;
    menu.style.display = 'none';
    document.removeEventListener('click', onDocClick);
  }
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    open = !open;
    menu.style.display = open ? 'flex' : 'none';
    if (open) setTimeout(function() { document.addEventListener('click', onDocClick); }, 0);
    else document.removeEventListener('click', onDocClick);
  });
}

function cgiSharePhotoUrl(url) {
  if (navigator.share) {
    navigator.share({ url: url }).catch(function() {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).catch(function() {});
  }
}

function cgiShareInternalPhotoUrl(src) {
  var name = cgiOriginalFilename(src).replace(/\.[^.]+$/, '');
  var u = new URL(window.location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('photo', name);
  return u.toString();
}

window.cgiSharedPhotoOpened = false;
function cgiOpenSharedPhoto() {
  if (!cgiIsAlbumPage() || window.cgiSharedPhotoOpened) return;
  var params = new URLSearchParams(window.location.search);
  var target = params.get('photo');
  if (!target) return;
  var figures = document.querySelectorAll('.photonic-standard-layout figure');
  for (var i = 0; i < figures.length; i++) {
    var img = figures[i].querySelector('img');
    if (!img) continue;
    var src = img.getAttribute('src') || img.getAttribute('data-src');
    if (!src) continue;
    if (cgiOriginalFilename(src).replace(/\.[^.]+$/, '') === target) {
      var link = figures[i].querySelector('a');
      if (link) {
        window.cgiSharedPhotoOpened = true;
        link.click();
      }
      break;
    }
  }
}

document.head.appendChild(Object.assign(document.createElement('link'), {rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&display=swap'}));

function cgiForceBannerSize() {
  if (!cgiIsAlbumPage()) return;
  var holder = document.querySelector('.edgtf-title-holder');
  if (!holder) return;
  var h = Math.round(Math.max(450, Math.min(window.innerHeight * 0.7, 750)));
  holder.style.removeProperty('aspect-ratio');
  holder.style.setProperty('height', h + 'px', 'important');
  holder.style.setProperty('min-height', '0', 'important');
  holder.style.setProperty('max-height', 'none', 'important');
  var parent = holder.closest('.edgtf-title');
  if (parent) {
    parent.style.setProperty('height', h + 'px', 'important');
    parent.style.setProperty('min-height', '0', 'important');
    parent.style.setProperty('max-height', 'none', 'important');
    parent.style.setProperty('background-color', 'transparent', 'important');
    parent.style.setProperty('overflow', 'visible', 'important');
    parent.setAttribute('data-height', String(h));
  }
}

function cgiFetchFeaturedMediaUrl(slug) {
  var pagesReq = fetch('https://cgiflorida.com/boys/wp-json/wp/v2/pages?slug=' + encodeURIComponent(slug) + '&_embed=wp:featuredmedia')
    .then(function(r) { return r.json(); }).catch(function() { return []; });
  var galleryReq = fetch('https://cgiflorida.com/boys/wp-json/wp/v2/camp_gallery?slug=' + encodeURIComponent(slug) + '&_embed=wp:featuredmedia')
    .then(function(r) { return r.json(); }).catch(function() { return []; });
  return Promise.all([pagesReq, galleryReq]).then(function(results) {
    var combined = (Array.isArray(results[0]) ? results[0] : []).concat(Array.isArray(results[1]) ? results[1] : []);
    if (!combined.length) return null;
    var page = combined[0];
    var media = page._embedded && page._embedded['wp:featuredmedia'] && page._embedded['wp:featuredmedia'][0];
    var url = null;
    if (media) {
      var sizes = media.media_details && media.media_details.sizes;
      if (sizes && sizes.large) url = sizes.large.source_url;
      else if (sizes && sizes.medium_large) url = sizes.medium_large.source_url;
      else if (sizes && sizes.medium) url = sizes.medium.source_url;
      else url = media.source_url || null;
    }
    return { url: url, date: page.date || null };
  });
}

function cgiFormatBannerDate(dateStr) {
  if (!dateStr) return null;
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  var months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  var day = d.getDate();
  var suffix = 'TH';
  if (day % 10 === 1 && day !== 11) suffix = 'ST';
  else if (day % 10 === 2 && day !== 12) suffix = 'ND';
  else if (day % 10 === 3 && day !== 13) suffix = 'RD';
  return months[d.getMonth()] + ' ' + day + suffix + ', ' + d.getFullYear();
}

function cgiSmoothScrollTo(target) {
  var startY = window.pageYOffset;
  var endY = target.getBoundingClientRect().top + startY;
  var duration = 800;
  var startTime = null;
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, startY + (endY - startY) * easeInOutQuad(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function cgiApplyBannerStatic() {
  var holder = document.querySelector('.edgtf-title-holder');
  if (!holder || holder.querySelector('.cgi-banner-bottom')) return;

  var bottomWrap = document.createElement('div');
  bottomWrap.className = 'cgi-banner-bottom';

  var viewBtn = document.createElement('a');
  viewBtn.href = '#';
  viewBtn.className = 'cgi-banner-view-btn';
  viewBtn.textContent = 'View Gallery';
  viewBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var grid = document.querySelector('.photonic-standard-layout');
    if (grid) cgiSmoothScrollTo(grid);
  });
  bottomWrap.appendChild(viewBtn);

  var logoLink = document.createElement('a');
  logoLink.href = 'https://cgiflorida.com/boys/gallery/';
  logoLink.className = 'cgi-banner-logo-link';
  var logoImg = document.createElement('img');
  logoImg.src = 'https://cgiflorida.com/boys/wp-content/uploads/sites/2/2026/06/cropped-Untitled-design-23-192x192.png';
  logoImg.alt = 'CGI Florida';
  logoImg.className = 'cgi-banner-logo-img';
  var logoText = document.createElement('span');
  logoText.className = 'cgi-banner-logo-text';
  logoText.textContent = "DOVI'S CGI FLORIDA";
  logoLink.appendChild(logoImg);
  logoLink.appendChild(logoText);
  bottomWrap.appendChild(logoLink);

  holder.appendChild(bottomWrap);
}

window.cgiBannerDateSet = false;
function cgiApplyBannerDate(dateStr) {
  if (window.cgiBannerDateSet) return;
  var holder = document.querySelector('.edgtf-title-holder');
  if (!holder || holder.querySelector('.cgi-banner-subtitle')) return;
  var formattedDate = cgiFormatBannerDate(dateStr);
  if (!formattedDate) return;
  window.cgiBannerDateSet = true;
  var sub = document.createElement('div');
  sub.className = 'cgi-banner-subtitle';
  sub.textContent = formattedDate;
  holder.appendChild(sub);
}

function cgiApplyBannerDateFallback() {
  var parts = window.location.pathname.split('/').filter(Boolean);
  var slug = parts[parts.length - 1];
  if (!slug) return;
  cgiFetchFeaturedMediaUrl(slug)
    .then(function(result) {
      if (result && result.date) cgiApplyBannerDate(result.date);
    })
    .catch(function() {});
}

function cgiApplyBannerImage() {
  if (!cgiIsAlbumPage()) return;
  var holder = document.querySelector('.edgtf-title-holder');
  if (holder) {
    holder.classList.add('cgi-banner-has-image');
    cgiForceBannerSize();
    window.addEventListener('resize', cgiForceBannerSize);
  }
  cgiApplyBannerStatic();

  var albumId = cgiGetCurrentAlbumId();
  if (!albumId) { cgiApplyBannerDateFallback(); return; }

  cgiFetchAlbumLinks().then(function(albumLinks) {
    if (window.cgiBannerDateSet) return;
    var entry = albumLinks.find(function(a) { return a.albumId === albumId; });
    if (entry && entry.date) {
      cgiApplyBannerDate(entry.date);
    } else {
      cgiApplyBannerDateFallback();
    }
  }).catch(function() {
    cgiApplyBannerDateFallback();
  });
}
cgiApplyBannerImage();

function cgiExtractAlbumPathPrefix(src) {
  var m = src.match(/^(https:\/\/photos\.smugmug\.com\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+)\//);
  return m ? m[1] : null;
}

window.cgiListingPagePromise = null;
function cgiFetchListingPage() {
  if (window.cgiListingPagePromise) return window.cgiListingPagePromise;
  window.cgiListingPagePromise = fetch('https://cgiflorida.com/boys/gallery/?cgi_nocache=' + Date.now())
    .then(function(r) { return r.text(); })
    .catch(function() { return null; });
  return window.cgiListingPagePromise;
}
if (cgiIsAlbumPage()) cgiFetchListingPage();

function cgiGetCurrentAlbumId() {
  var container = document.querySelector('.photonic-standard-layout');
  var query = container ? container.getAttribute('data-photonic-query') : null;
  if (!query) return null;
  var m = query.match(/(?:^|&)album=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function cgiApplyAlbumCoverBannerFallback(holder, applyBg) {
  var img = document.querySelector('.photonic-standard-layout figure img');
  if (!img) return;
  var src = img.getAttribute('src') || img.getAttribute('data-src');
  if (!src) return;
  window.cgiBannerImageSet = true;
  applyBg(src);

  var prefix = cgiExtractAlbumPathPrefix(src);
  if (!prefix) return;

  cgiFetchListingPage()
    .then(function(html) {
      if (!html) return;
      var scratch = document.createElement('div');
      scratch.innerHTML = html;
      var listingImgs = scratch.querySelectorAll('.photonic-level-2.photonic-thumb img');
      var match = null;
      for (var i = 0; i < listingImgs.length; i++) {
        var lsrc = listingImgs[i].getAttribute('src') || listingImgs[i].getAttribute('data-src') || '';
        if (lsrc.indexOf(prefix) === 0) { match = lsrc; break; }
      }
      if (match && match !== src) applyBg(match);
    })
    .catch(function() {});
}

window.cgiBannerImageSet = false;
function cgiApplyAlbumCoverBanner() {
  if (window.cgiBannerImageSet || !cgiIsAlbumPage()) return;
  var holder = document.querySelector('.edgtf-title-holder');
  if (!holder) return;

  function applyBg(finalSrc) {
    holder.style.backgroundImage = 'url(' + cgiSizedUrl(finalSrc, 'X2') + ')';
    holder.style.backgroundSize = 'cover';
    holder.style.backgroundPosition = 'center center';
    holder.style.backgroundRepeat = 'no-repeat';
    cgiForceBannerSize();
    setTimeout(cgiForceBannerSize, 800);
    setTimeout(cgiForceBannerSize, 1800);
  }

  var albumId = cgiGetCurrentAlbumId();
  if (!albumId) { cgiApplyAlbumCoverBannerFallback(holder, applyBg); return; }

  cgiFetchAlbumLinks().then(function(albumLinks) {
    if (window.cgiBannerImageSet) return;
    var entry = albumLinks.find(function(a) { return a.albumId === albumId; });
    if (entry && entry.cover) {
      window.cgiBannerImageSet = true;
      applyBg(entry.cover);
    } else {
      cgiApplyAlbumCoverBannerFallback(holder, applyBg);
    }
  }).catch(function() {
    if (!window.cgiBannerImageSet) cgiApplyAlbumCoverBannerFallback(holder, applyBg);
  });
}

function cgiGetOrCreateButtonRow(container) {
  var row = document.getElementById('cgi-button-row');
  if (row) return row;
  row = document.createElement('div');
  row.id = 'cgi-button-row';
  var outer = container.closest('.photonic-smug-stream, .photonic-stream') || container;
  outer.parentNode.insertBefore(row, outer);
  return row;
}

function cgiApplyStickyButtonRow() {
  var row = document.getElementById('cgi-button-row');
  if (!row) return;
  row.style.position = 'fixed';
  row.style.left = 'auto';
  row.style.right = '20px';
  row.style.top = 'auto';
  row.style.bottom = '20px';
  row.style.zIndex = '200';
  row.style.background = 'transparent';
  row.style.boxShadow = 'none';
  row.style.margin = '0';
  row.style.padding = '0';
  row.style.width = 'auto';
  row.style.boxSizing = 'border-box';
  document.body.style.paddingBottom = '0';
}
window.addEventListener('resize', cgiApplyStickyButtonRow);

function cgiBuildTopBar() {
  if (!cgiIsAlbumPage()) return;
  var c = document.querySelector('.photonic-standard-layout');
  if (!c) return;
  var row = cgiGetOrCreateButtonRow(c);
  if (row.dataset.cgiBuilt) return;
  row.dataset.cgiBuilt = '1';

  var backBtn = cgiMakeIconBtn('back', 'Back to galleries');
  backBtn.href = 'https://cgiflorida.com/boys/gallery/';
  row.appendChild(backBtn);

  var selectBtn = cgiMakeIconBtn('select', 'Select photos');
  selectBtn.id = 'cgi-select-toggle';
  selectBtn.addEventListener('click', function(e) {
    e.preventDefault();
    cgiSetSelectMode(!window.cgiSelectMode);
  });
  row.appendChild(selectBtn);

  var dlWrap = document.createElement('div');
  dlWrap.id = 'cgi-topbar-dl';
  dlWrap.className = 'cgi-topbar-dl';

  var dlBtn = cgiMakeIconBtn('download', 'Download selected photos');
  var dlCount = document.createElement('span');
  dlCount.className = 'cgi-dl-count';
  dlBtn.appendChild(dlCount);

  var dlMenu = document.createElement('div');
  dlMenu.className = 'cgi-dl-menu';
  function mkMenuItem(label, code) {
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = label;
    a.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      cgiBatchDownload(code, label.indexOf('Full') > -1 ? 'Full' : 'Web');
    });
    return a;
  }
  dlMenu.appendChild(mkMenuItem('Web Size', 'L'));
  dlMenu.appendChild(mkMenuItem('Full Size', '5K'));
  cgiWireDownloadMenu(dlBtn, dlMenu);

  dlWrap.appendChild(dlBtn);
  dlWrap.appendChild(dlMenu);
  row.appendChild(dlWrap);

  cgiApplyStickyButtonRow();
}

function removeDownloadBar(){var b=document.getElementById('cgi-dl');if(b)b.remove();}

function showDownloadBar(){
  if(!cgiIsAlbumPage())return;
  var con=document.querySelector('#bp_container');
  if(!con||parseFloat(window.getComputedStyle(con).opacity)<0.5)return;
  var img=con.querySelector('img');
  if(!img||!img.src)return;
  var existing=document.getElementById('cgi-dl');
  if(existing && existing.dataset.src===img.src) return;
  removeDownloadBar();
  var src=img.src,
      wS=cgiSizedUrl(src,'L'),
      fS=cgiSizedUrl(src,'5K'),
      bar=document.createElement('div');
  bar.id='cgi-dl';
  bar.dataset.src=src;

  var dlBtn = cgiMakeIconBtn('download', 'Download photo');
  var dlMenu = document.createElement('div');
  dlMenu.className = 'cgi-dl-menu';
  function mkB(l,u){
    var a=document.createElement('a');
    var fname=cgiOriginalFilename(src);
    a.textContent=l;
    a.href=cgiProxyUrl(u,fname);
    a.download=fname;
    a.addEventListener('click',function(e){e.stopPropagation();});
    return a;
  }
  dlMenu.appendChild(mkB('Web Size',wS));
  dlMenu.appendChild(mkB('Full Size',fS));
  cgiWireDownloadMenu(dlBtn, dlMenu);

  var shBtn = cgiMakeIconBtn('share', 'Share photo');
  shBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    cgiSharePhotoUrl(cgiShareInternalPhotoUrl(src));
  });

  bar.appendChild(dlBtn);
  bar.appendChild(dlMenu);
  bar.appendChild(shBtn);
  document.body.appendChild(bar);
}

setInterval(function(){
  if(!cgiIsAlbumPage())return;
  var con=document.querySelector('#bp_container');
  if(!con){removeDownloadBar();return;}
  var opacity=parseFloat(window.getComputedStyle(con).opacity);
  if(opacity<0.5){removeDownloadBar();return;}
  var img=con.querySelector('img');
  if(!img||!img.src||!img.complete)return;
  showDownloadBar();
},250);

document.addEventListener('keydown',function(e){if(e.key==='Escape')removeDownloadBar();});

function cgiSetSelectMode(active) {
  window.cgiSelectMode = active;
  document.body.classList.toggle('cgi-select-active', active);
  var btn = document.getElementById('cgi-select-toggle');
  if (btn) btn.classList.toggle('cgi-active', active);
  if (!active) cgiClearSelection();
}

function cgiSetupThumbSelection() {
  if (!cgiIsAlbumPage()) return;
  document.querySelectorAll('.photonic-standard-layout figure').forEach(function(fig) {
    if (fig.dataset.cgiSelectBound) return;
    fig.dataset.cgiSelectBound = '1';
    var box = document.createElement('div');
    box.className = 'cgi-select-box';
    fig.appendChild(box);
    fig.addEventListener('click', function(e) {
      if (fig.dataset.cgiSuppressClick) {
        delete fig.dataset.cgiSuppressClick;
        return;
      }
      if (!window.cgiSelectMode) return;
      e.preventDefault();
      e.stopPropagation();
      cgiToggleSelect(fig);
    }, true);

    var longPressTimer = null;
    var longPressTriggered = false;
    var startX = 0, startY = 0;
    fig.addEventListener('touchstart', function(e) {
      if (window.cgiSelectMode || !e.touches || !e.touches.length) return;
      longPressTriggered = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      longPressTimer = setTimeout(function() {
        longPressTimer = null;
        longPressTriggered = true;
        cgiSetSelectMode(true);
        cgiToggleSelect(fig);
        if (navigator.vibrate) navigator.vibrate(15);
      }, 500);
    }, { passive: true });
    fig.addEventListener('touchmove', function(e) {
      if (!longPressTimer || !e.touches || !e.touches.length) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });
    fig.addEventListener('touchend', function(e) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (longPressTriggered) {
        longPressTriggered = false;
        fig.dataset.cgiSuppressClick = '1';
        e.preventDefault();
      }
    });
    fig.addEventListener('touchcancel', function() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      longPressTriggered = false;
    });
    fig.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  });
}

function cgiSetupThumbIcons() {
  if (!cgiIsAlbumPage()) return;
  document.querySelectorAll('.photonic-standard-layout figure').forEach(function(fig) {
    if (fig.dataset.cgiIconsBound) return;
    fig.dataset.cgiIconsBound = '1';

    var wrap = document.createElement('div');
    wrap.className = 'cgi-thumb-icons';

    var dlBtn = cgiMakeIconBtn('download', 'Download photo');
    dlBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var img = fig.querySelector('img');
      var src = img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
      if (!src) return;
      var url = cgiSizedUrl(src, 'L');
      var fname = 'CGI-' + cgiOriginalFilename(src);
      var a = document.createElement('a');
      a.href = cgiProxyUrl(url, fname);
      a.download = fname;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() { if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
    });

    var shBtn = cgiMakeIconBtn('share', 'Share photo');
    shBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var img = fig.querySelector('img');
      var src = img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
      if (!src) return;
      cgiSharePhotoUrl(cgiShareInternalPhotoUrl(src));
    });

    wrap.appendChild(dlBtn);
    wrap.appendChild(shBtn);
    fig.appendChild(wrap);

    wrap.addEventListener('click', function(e) { e.stopPropagation(); }, true);
  });
}

function cgiToggleSelect(fig) {
  var img = fig.querySelector('img');
  if (!img) return;
  var src = img.getAttribute('src') || img.getAttribute('data-src');
  if (!src) return;
  if (window.cgiSelected.has(src)) {
    window.cgiSelected.delete(src);
    fig.classList.remove('cgi-selected');
  } else {
    window.cgiSelected.add(src);
    fig.classList.add('cgi-selected');
  }
  cgiUpdateBatchBar();
}

function cgiClearSelection() {
  window.cgiSelected.clear();
  document.querySelectorAll('.photonic-standard-layout figure.cgi-selected').forEach(function(f) {
    f.classList.remove('cgi-selected');
  });
  cgiUpdateBatchBar();
}

function cgiUpdateBatchBar() {
  var n = window.cgiSelected.size;
  var wrap = document.getElementById('cgi-topbar-dl');
  if (!wrap) return;
  wrap.classList.toggle('cgi-visible', n > 0);
  var countEl = wrap.querySelector('.cgi-dl-count');
  if (countEl) countEl.textContent = n > 0 ? n : '';
  if (!n) {
    var menu = wrap.querySelector('.cgi-dl-menu');
    if (menu) menu.style.display = 'none';
  }
}

function cgiBatchDownload(code, label) {
  var items = Array.from(window.cgiSelected);
  if (!items.length) return;
  var usedNames = {};
  var payloadItems = items.map(function(src) {
    var fname = cgiOriginalFilename(src);
    if (usedNames[fname]) {
      usedNames[fname]++;
      fname = fname.replace(/(\.[^.]+)$/, ' (' + usedNames[fname] + ')$1');
    } else {
      usedNames[fname] = 1;
    }
    return { url: cgiSizedUrl(src, code), name: fname };
  });
  var form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://cgi-photo-proxy.fishelkleinman.workers.dev/zip-download';
  form.style.display = 'none';
  var input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'payload';
  input.value = JSON.stringify({ items: payloadItems, zipName: 'CGI-' + label + '-Photos.zip' });
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  setTimeout(function() { if (form.parentNode) form.parentNode.removeChild(form); }, 2000);
}

window.addEventListener('resize', window.cgiMasonryLayout);

function cgiRunAllFixes() {
  if (cgiIsAlbumPage()) {
    window.cgiMasonryLayout();
    cgiSetupThumbSelection();
    cgiSetupThumbIcons();
    cgiBuildTopBar();
    if (!window.cgiBannerImageSet) cgiApplyAlbumCoverBanner();
    cgiOpenSharedPhoto();
  } else {
    window.cgiFixGallery();
    cgiFixThumbnailLinksAsync();
    cgiInsertFilters();
    cgiInsertLoadMoreButton();
    cgiUpdateVisibility();
  }
}

(function() {
  var scheduled = false;
  function scheduleRun() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function() {
      scheduled = false;
      cgiRunAllFixes();
    });
  }
  var observer = new MutationObserver(scheduleRun);
  var target = document.body || document.documentElement;
  observer.observe(target, { childList: true, subtree: true });
  scheduleRun();
})();
