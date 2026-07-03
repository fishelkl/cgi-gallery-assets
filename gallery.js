window.cgiSelectMode = false;
window.cgiSelected = new Set();

window.addEventListener('load', function() {
  try {
    var isAlbumView = window.location.href.indexOf('album-view') > -1;
    if (isAlbumView) return;
    var stream = document.querySelector('.photonic-smug-stream');
    if (!stream) return;
    var filterDiv = document.createElement('div');
    filterDiv.id = 'gallery-filters';
    filterDiv.style.cssText = 'display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;';
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
    yearSelect.addEventListener('change', window.filterGallery);
    divSelect.addEventListener('change', window.filterGallery);
    weekSelect.addEventListener('change', window.filterGallery);
    filterDiv.appendChild(yearSelect);
    filterDiv.appendChild(divSelect);
    filterDiv.appendChild(weekSelect);
    stream.parentNode.insertBefore(filterDiv, stream);
  } catch(e) {}
});

window.filterGallery = function() {
  var year = document.getElementById('filter-year') ? document.getElementById('filter-year').value : 'all';
  var division = document.getElementById('filter-division') ? document.getElementById('filter-division').value : 'all';
  var week = document.getElementById('filter-week') ? document.getElementById('filter-week').value : 'all';
  document.querySelectorAll('.photonic-level-2.photonic-thumb').forEach(function(thumb) {
    var desc = thumb.querySelector('.custom-desc');
    var text = desc ? desc.textContent : '';
    var img = thumb.querySelector('img');
    var src = img ? (img.getAttribute('src') || img.getAttribute('data-src') || '') : '';
    var yearMatch = year === 'all' || src.indexOf('/' + year + '/') > -1;
    var divMatch = division === 'all' || text.indexOf(division) > -1;
    var weekMatch = week === 'all' || text.indexOf(week) > -1;
    thumb.style.display = (yearMatch && divMatch && weekMatch) ? 'block' : 'none';
  });
};

window.populateFilters = function() {
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

window.fixGallery = function() {
  if (window.location.href.indexOf('album-view') > -1) return;
  var isMobile = window.innerWidth < 768;
  var container = document.querySelector('.photonic-level-2-container');
  if (container) container.style.cssText = 'display:grid!important;grid-template-columns:' + (isMobile ? '1fr 1fr' : '1fr 1fr 1fr') + ';gap:' + (isMobile ? '8px' : '10px') + ';columns:unset;column-count:unset;width:100%;box-sizing:border-box;';
  document.querySelectorAll('.photonic-level-2.photonic-thumb').forEach(function(thumb) {
    thumb.style.display = 'block';
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
  window.populateFilters();
};

window.masonryLayout = function() {
  if (window.location.href.indexOf('album-view') === -1) return;
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

document.head.appendChild(Object.assign(document.createElement('link'), {rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&display=swap'}));

setTimeout(function(){
  if(window.location.href.indexOf('album-view')===-1)return;
  var c=document.querySelector('.photonic-standard-layout');
  if(!c)return;
  var btn=document.createElement('a');
  btn.href='https://cgiflorida.com/boys/gallery/';
  btn.textContent='\u2190 Back';
  btn.style.cssText='display:inline-block;background:#a8c8e8;color:#2d5986;font-family:Teko,sans-serif;font-size:18px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:12px 40px;border-radius:8px;text-decoration:none;margin:0 0 20px 0;transition:all 0.3s ease;cursor:pointer;';
  btn.addEventListener('mouseover',function(){btn.style.background='#2d5986';btn.style.color='#fff';});
  btn.addEventListener('mouseout',function(){btn.style.background='#a8c8e8';btn.style.color='#2d5986';});
  c.parentNode.insertBefore(btn,c);
},500);

function removeDownloadBar(){var b=document.getElementById('cgi-dl');if(b)b.remove();}

function showDownloadBar(){
  if(window.location.href.indexOf('album-view')===-1)return;
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
  function doDL(u,l){fetch(u).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(b){var x=URL.createObjectURL(b),a=document.createElement('a');a.href=x;a.download='CGI-'+l+'.jpg';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(x);}).catch(function(){var a=document.createElement('a');a.href=u;a.download='CGI-'+l+'.jpg';a.target='_blank';document.body.appendChild(a);a.click();document.body.removeChild(a);});}
  function mkB(l,u){var a=document.createElement('a');a.textContent=l;a.href='#';a.style.cssText='display:block;background:#a8c8e8;color:#2d5986;font-family:Teko,sans-serif;font-size:15px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:8px 24px;border-radius:8px;text-decoration:none;text-align:center;white-space:nowrap;';a.addEventListener('mouseover',function(){a.style.background='#2d5986';a.style.color='#fff';});a.addEventListener('mouseout',function(){a.style.background='#a8c8e8';a.style.color='#2d5986';});a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();doDL(u,l.replace(' ','-'));});return a;}
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

setInterval(function(){if(window.location.href.indexOf('album-view')===-1)return;var c=document.querySelector('#bp_container');if(!c||parseFloat(window.getComputedStyle(c).opacity)<0.5)removeDownloadBar();},200);

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
  if (window.location.href.indexOf('album-view') === -1) return;
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
  if (window.location.href.indexOf('album-view') === -1) return;
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

function cgiLoadJSZip(cb) {
  if (window.JSZip) { cb(true); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  s.onload = function() { cb(true); };
  s.onerror = function() { cb(false); };
  document.head.appendChild(s);
}

function cgiBatchDownload(code, label) {
  var items = Array.from(window.cgiSelected);
  if (!items.length) return;
  cgiLoadJSZip(function(ok) {
    if (!ok || !window.JSZip) {
      items.forEach(function(src, i) {
        setTimeout(function() {
          var a = document.createElement('a');
          a.href = cgiSizedUrl(src, code);
          a.download = 'CGI-' + label + '-' + (i + 1) + '.jpg';
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, i * 400);
      });
      return;
    }
    var zip = new JSZip();
    var done = 0;
    items.forEach(function(src, i) {
      fetch(cgiSizedUrl(src, code)).then(function(r) { return r.blob(); })
        .then(function(blob) { zip.file('CGI-' + label + '-' + (i + 1) + '.jpg', blob); })
        .catch(function() {})
        .finally(function() {
          done++;
          if (done === items.length) {
            zip.generateAsync({ type: 'blob' }).then(function(content) {
              var a = document.createElement('a');
              var u = URL.createObjectURL(content);
              a.href = u;
              a.download = 'CGI-Photos-' + label + '.zip';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(u);
            });
          }
        });
    });
  });
}

setTimeout(window.fixGallery,500);setTimeout(window.fixGallery,1500);setTimeout(window.fixGallery,3000);
setTimeout(window.masonryLayout,300);
window.addEventListener('resize',window.masonryLayout);
setTimeout(cgiInsertSelectToggle, 500);
setTimeout(cgiSetupThumbSelection, 600);
setTimeout(cgiSetupThumbSelection, 1600);
setTimeout(cgiSetupThumbSelection, 3200);
