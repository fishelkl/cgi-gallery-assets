window.cgiSelectMode = false;
window.cgiSelected = new Set();
window.cgiVisibleCount = 12;
window.cgiSortDirection = 'newest';
window.cgiAlbumOrder = [];

function cgiIsAlbumPage() {
  return !!document.querySelector('.photonic-standard-layout:not(.photonic-level-2-container)');
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
  if (weekSel && weeks.length) { while(weekSel.options.length>1) weekSel.remove(1); weeks.forEach(function(w){ var o=document.createElement('option'); o.value=w; o.textContent=w; weekSel.appendChild(o); }); }
  var yearSel = document.getElementById('filter-year');
  if (yearSel && years.length) { while(yearSel.options.length>1) yearSel.remove(1); years.forEach(function(y){ var o=document.createElement('option'); o.value=y; o.textContent=y; yearSel.appendChild(o); }); }
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
        var linkSrc = linkImg.getAttribute('src') || linkImg.getAttribute('data-src') || '';
        var ym = linkSrc.match(/\/(\d{4})\//);
        var year = ym ? ym[1] : null;
        var division = linkSrc.indexOf('Main-Camp') > -1 ? 'main-camp' : linkSrc.indexOf('Temimim') > -1 ? 'temimim' : null;
        var titleText = linkTitleEl.textContent.trim();
        var slug = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (year && division && slug) {
          link.href = 'https://cgiflorida.com/boys/' + year + '/' + division + '/' + slug + '/';
        }
      }
    }
    if (thumb.querySelector('.custom-desc')) return;
    var fig = thumb.querySelector('figcaption.photonic-title-info');
    var titleEl = thumb.querySelector('.photonic-title');
    var img = thumb.querySelector('img');
    if (fig) fig.style.cssText = 'position:absolute!important;bottom:' + (isMobile?'28px':'38px') + '!important;left:' + (isMobile?'10px':'18px') + '!important;right:' + (isMobile?'10px':'18px') + '!important;width:auto!important;height:auto!important;background:none!important;padding:0!important;z-index:2!important;overflow:visible!important;display:block!important;';
    if (titleEl) titleEl.style.cssText = 'display:block!important;width:100%!important;color:#fff!important;text-transform:uppercase!important;letter-spacing:1px!important;line-height:1.1!important;margin:0!important;padding:0!important;font-size:' + (isMobile?'16px':'26px') + '!important;font-family:Teko,sans-serif!important;text-align:left!important;';
    if (img) {
      var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      var division = src.indexOf('Main-Camp') > -1 ? 'Main Camp' : src.indexOf('Temimim') > -1 ? 'Temimim' : '';
      var wm = src.match(/Week-(\d+)/i);
      var week = wm ? 'Week ' + wm[1] : '';
      var subtitle = division && week ? division + ' \xB7 ' + week : division || week || '';
      if (subtitle) {
        var desc = document.createElement('div');
        desc.className = 'custom-desc';
        desc.style.cssText = 'position:absolute!important;bottom:' + (isMobile?'8px':'18px') + '!important;left:' + (isMobile?'10px':'18px') + '!important;right:' + (isMobile?'10px':'18px') + '!important;width:auto!important;color:rgba(255,255,255,0.75)!important;font-size:' + (isMobile?'9px':'12px') + '!important;letter-spacing:1.5px!important;text-transform:uppercase!important;font-family:Teko,sans-serif!important;z-index:3!important;display:block!important;text-align:left!important;';
        desc.textContent = subtitle;
        thumb.appendChild(desc);
      }
    }
  });
  window.cgiPopulateFilters();
};

function cgiLoadMoreAlbums(container, btn) {
  var query = container.getAttribute('data-photonic-query');
  var provider = container.getAttribute('data-photonic-platform');
  if (!query || !provider) { btn.style.display = 'none'; return; }
  btn.textContent = 'Loading...';
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
    btn.textContent = 'Load More';
  }).catch(function() {
    btn.textContent = 'Load More';
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
  var attempts = 0;
  var poll = setInterval(function() {
    attempts++;
    var f = cgiInsertFilters();
    var m = cgiInsertLoadMoreButton();
    if ((f && m) || attempts > 40) clearInterval(poll);
  }, 250);
})();

window.cgiMasonryLayout = function() {
  if (!cgiIsAlbumPage()) return;
  var container = document.querySelector('.photonic-standard-layout');
  if (!container || !container.offsetWidth) return;
  var figures = Array.from(container.querySelectorAll('figure'));
  if (!figures.length) return;

  function doLayout() {
    if (!container.offsetWidth) return;
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

  if (container.dataset.masonryInit) { doLayout(); return; }
  container.dataset.masonryInit = '1';

  var pending = false;
  function scheduleLayout() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function() { pending = false; doLayout(); });
  }

  container.querySelectorAll('img').forEach(function(img) {
    if (img.complete && img.naturalWidth) {
      scheduleLayout();
    } else {
      img.addEventListener('load', scheduleLayout);
      img.addEventListener('error', scheduleLayout);
    }
  });
  scheduleLayout();
};

function cgiSizedUrl(src, code) {
  return src.replace(/\/[A-Z0-9]+\/([^\/]+)-[A-Z0-9]+\.jpg$/i, '/' + code + '/$1-' + code + '.jpg');
}

function cgiProxyUrl(url, filename) {
  var u = 'https://cgi-photo-proxy.fishelkleinman.workers.dev/?url=' + encodeURIComponent(url);
  if (filename) u += '&name=' + encodeURIComponent(filename);
  return u;
}

document.head.appendChild(Object.assign(document.createElement('link'), {rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&display=swap'}));

function cgiForceBannerSize(width, height) {
  var holder = document.querySelector('.edgtf-title-holder');
  if (!holder) return;
  holder.style.setProperty('height', 'auto', 'important');
  holder.style.setProperty('min-height', '0', 'important');
  holder.style.setProperty('max-height', 'none', 'important');
  if (width && height) {
    holder.style.setProperty('aspect-ratio', width + ' / ' + height, 'important');
  }
  var parent = holder.closest('.edgtf-title');
  if (parent) {
    parent.style.setProperty('height', 'auto', 'important');
    parent.style.setProperty('min-height', '0', 'important');
    parent.style.setProperty('max-height', 'none', 'important');
    parent.style.setProperty('background-color', 'transparent', 'important');
    parent.style.setProperty('overflow', 'visible', 'important');
    parent.setAttribute('data-height', 'auto');
  }
}

function cgiApplyBannerImage() {
  var parts = window.location.pathname.split('/').filter(Boolean);
  var slug = parts[parts.length - 1];
  if (!slug) return;
  fetch('https://cgiflorida.com/boys/wp-json/wp/v2/pages?slug=' + encodeURIComponent(slug) + '&_embed=wp:featuredmedia')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.length) return;
      var page = data[0];
      var media = page._embedded && page._embedded['wp:featuredmedia'] && page._embedded['wp:featuredmedia'][0];
      if (!media || !media.source_url) return;
      var url = media.source_url;
      var width = media.media_details && media.media_details.width;
      var height = media.media_details && media.media_details.height;
      var holder = document.querySelector('.edgtf-title-holder');
      if (!holder) return;
      holder.classList.add('cgi-banner-has-image');
      holder.style.backgroundImage = 'url(' + url + ')';
      holder.style.backgroundSize = 'cover';
      holder.style.backgroundPosition = 'center center';
      holder.style.backgroundRepeat = 'no-repeat';
      cgiForceBannerSize(width, height);
      setTimeout(function() { cgiForceBannerSize(width, height); }, 800);
      setTimeout(function() { cgiForceBannerSize(width, height); }, 1800);
      setTimeout(function() { cgiForceBannerSize(width, height); }, 3000);
    })
    .catch(function() {});
}
setTimeout(cgiApplyBannerImage, 500);

function cgiApplyBannerSubtitle() {
  if (!cgiIsAlbumPage()) return;
  var holder = document.querySelector('.edgtf-title-holder');
  if (!holder || holder.querySelector('.cgi-banner-subtitle')) return;
  var img = document.querySelector('.photonic-standard-layout img');
  if (!img) return;
  var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
  var division = src.indexOf('Main-Camp') > -1 ? 'Main Camp' : src.indexOf('Temimim') > -1 ? 'Temimim' : '';
  var wm = src.match(/Week-(\d+)/i);
  var week = wm ? 'Week ' + wm[1] : '';
  var subtitle = division && week ? division + ' \xB7 ' + week : division || week || '';
  if (!subtitle) return;
  var sub = document.createElement('div');
  sub.className = 'cgi-banner-subtitle';
  sub.textContent = subtitle;
  holder.appendChild(sub);
}
setTimeout(cgiApplyBannerSubtitle, 1200);
setTimeout(cgiApplyBannerSubtitle, 2500);
setTimeout(cgiApplyBannerSubtitle, 4000);

setTimeout(function(){
  if(!cgiIsAlbumPage())return;
  var c=document.querySelector('.photonic-standard-layout');
  if(!c)return;
  var wrap=document.createElement('div');
  wrap.style.cssText='display:flex;gap:12px;align-items:center;margin:0 0 20px 0;flex-wrap:wrap;';
  var btnStyle='display:inline-block;background:#a8c8e8;color:#2d5986;font-family:Teko,sans-serif;font-size:18px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:12px 40px;border-radius:8px;text-decoration:none;transition:all 0.3s ease;cursor:pointer;';
  var btn=document.createElement('a');
  btn.href='https://cgiflorida.com/boys/gallery/';
  btn.textContent='\u2190 Back';
  btn.style.cssText=btnStyle;
  btn.addEventListener('mouseover',function(){btn.style.background='#2d5986';btn.style.color='#fff';});
  btn.addEventListener('mouseout',function(){btn.style.background='#a8c8e8';btn.style.color='#2d5986';});
  wrap.appendChild(btn);

  var shareBtn=document.createElement('a');
  shareBtn.href='#';
  shareBtn.textContent='Share';
  shareBtn.style.cssText=btnStyle;
  shareBtn.addEventListener('mouseover',function(){shareBtn.style.background='#2d5986';shareBtn.style.color='#fff';});
  shareBtn.addEventListener('mouseout',function(){shareBtn.style.background='#a8c8e8';shareBtn.style.color='#2d5986';});
  shareBtn.addEventListener('click',function(e){
    e.preventDefault();
    var shareUrl=window.location.href;
    if(navigator.share){
      navigator.share({title:document.title,url:shareUrl}).catch(function(){});
    } else {
      navigator.clipboard.writeText(shareUrl).then(function(){
        shareBtn.textContent='Copied!';
        setTimeout(function(){shareBtn.textContent='Share';},1500);
      });
    }
  });
  wrap.appendChild(shareBtn);

  c.parentNode.insertBefore(wrap,c);
},500);

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
      wS=cgiSizedUrl(src,'M'),
      fS=cgiSizedUrl(src,'5K'),
      bar=document.createElement('div');
  bar.id='cgi-dl';
  bar.dataset.src=src;
  bar.style.cssText='position:fixed;bottom:30px;right:30px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:6px;';
  var menu=document.createElement('div');
  menu.style.cssText='display:none;flex-direction:column;gap:6px;margin-bottom:6px;';
  function mkB(l,u){var a=document.createElement('a');var fname='CGI-'+l.replace(' ','-')+'.jpg';a.textContent=l;a.href=cgiProxyUrl(u,fname);a.download=fname;a.style.cssText='display:block;background:#a8c8e8;color:#2d5986;font-family:Teko,sans-serif;font-size:15px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:8px 24px;border-radius:8px;text-decoration:none;text-align:center;white-space:nowrap;';a.addEventListener('mouseover',function(){a.style.background='#2d5986';a.style.color='#fff';});a.addEventListener('mouseout',function(){a.style.background='#a8c8e8';a.style.color='#2d5986';});a.addEventListener('click',function(e){e.stopPropagation();});return a;}
  menu.appendChild(mkB('Web Size',wS));
  menu.appendChild(mkB('Full Size',fS));
  var mb=document.createElement('div');
  mb.style.cssText='background:#a8c8e8;color:#2d5986;font-family:Teko,sans-serif;font-size:18px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:12px 20px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;user-select:none;';
  mb.textContent='\u2913 Download';
  var mo=false;
  function oM(){mo=true;menu.style.display='flex';mb.style.background='#2d5986';mb.style.color='#fff';}
  function cM(){mo=false;menu.style.display='none';mb.style.background='#a8c8e8';mb.style.color='#2d5986';}
  mb.addEventListener('mouseenter',oM);
  bar.addEventListener('mouseleave',cM);
  mb.addEventListener('click',function(e){e.stopPropagation();mo?cM():oM();});
  bar.appendChild(menu);
  bar.appendChild(mb);
  document.body.appendChild(bar);
}

setInterval(function(){if(!cgiIsAlbumPage())return;var c=document.querySelector('#bp_container');if(!c||parseFloat(window.getComputedStyle(c).opacity)<0.5)removeDownloadBar();},200);

document.addEventListener('click',function(e){
  if(e.target.closest&&e.target.closest('#cgi-dl'))return;
  var attempts=0;
  var poll=setInterval(function(){
    attempts++;
    var con=document.querySelector('#bp_container');
    var img=con?con.querySelector('img'):null;
    var ready=con&&img&&img.complete&&img.src&&parseFloat(window.getComputedStyle(con).opacity)>=0.5;
    if(ready){showDownloadBar();clearInterval(poll);}
    else if(attempts>25){clearInterval(poll);}
  },150);
});

document.addEventListener('keydown',function(e){if(e.key==='Escape')removeDownloadBar();});

function cgiInsertSelectToggle() {
  if (!cgiIsAlbumPage()) return;
  if (document.getElementById('cgi-select-toggle')) return;
  var c = document.querySelector('.photonic-standard-layout');
  if (!c) return;
  var btn = document.createElement('a');
  btn.id = 'cgi-select-toggle';
  btn.href = '#';
  btn.textContent = 'Select Photos';
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.cgiSelectMode = !window.cgiSelectMode;
    document.body.classList.toggle('cgi-select-active', window.cgiSelectMode);
    btn.classList.toggle('cgi-active', window.cgiSelectMode);
    btn.textContent = window.cgiSelectMode ? 'Cancel Selecting' : 'Select Photos';
    if (!window.cgiSelectMode) cgiClearSelection();
  });
  c.parentNode.insertBefore(btn, c);
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
      if (!window.cgiSelectMode) return;
      e.preventDefault();
      e.stopPropagation();
      cgiToggleSelect(fig);
    }, true);
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
  var bar = document.getElementById('cgi-batch-dl');
  if (!n) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'cgi-batch-dl';
    document.body.appendChild(bar);
  }
  bar.innerHTML = '';
  var count = document.createElement('div');
  count.className = 'cgi-batch-count';
  count.textContent = n + ' Selected';
  var webBtn = document.createElement('a');
  webBtn.href = '#'; webBtn.textContent = 'Download Web Size'; webBtn.className = 'cgi-batch-btn';
  webBtn.addEventListener('click', function(e) { e.preventDefault(); cgiBatchDownload('M', 'Web'); });
  var fullBtn = document.createElement('a');
  fullBtn.href = '#'; fullBtn.textContent = 'Download Full Size'; fullBtn.className = 'cgi-batch-btn';
  fullBtn.addEventListener('click', function(e) { e.preventDefault(); cgiBatchDownload('5K', 'Full'); });
  var clearBtn = document.createElement('a');
  clearBtn.href = '#'; clearBtn.textContent = 'Clear'; clearBtn.className = 'cgi-batch-clear';
  clearBtn.addEventListener('click', function(e) { e.preventDefault(); cgiClearSelection(); });
  bar.appendChild(count);
  bar.appendChild(webBtn);
  bar.appendChild(fullBtn);
  bar.appendChild(clearBtn);
}

function cgiBatchDownload(code, label) {
  var items = Array.from(window.cgiSelected);
  if (!items.length) return;
  items.forEach(function(src, i) {
    setTimeout(function() {
      var fname = 'CGI-' + label + '-' + (i + 1) + '.jpg';
      var a = document.createElement('a');
      a.href = cgiProxyUrl(cgiSizedUrl(src, code), fname);
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, i * 500);
  });
}

setTimeout(window.cgiFixGallery,500);setTimeout(window.cgiFixGallery,1500);setTimeout(window.cgiFixGallery,3000);
setTimeout(cgiUpdateVisibility,600);setTimeout(cgiUpdateVisibility,1600);setTimeout(cgiUpdateVisibility,3200);
setTimeout(window.cgiMasonryLayout,300);
window.addEventListener('resize',window.cgiMasonryLayout);
setTimeout(cgiInsertSelectToggle, 500);
setTimeout(cgiSetupThumbSelection, 600);
setTimeout(cgiSetupThumbSelection, 1600);
setTimeout(cgiSetupThumbSelection, 3200);
