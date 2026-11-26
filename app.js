(function () {
  'use strict';

  var ALL = window.QUESTIONS || [];
  var LECTURES = window.LECTURES || {};
  var PER_BANK = 50;
  var LETTERS = ['A', 'B', 'C', 'D'];

  var state = { bank: 0, lecture: 'all', search: '' };

  var elBanks = document.getElementById('banks');
  var elList = document.getElementById('qlist');
  var elEmpty = document.getElementById('empty');
  var elStatus = document.getElementById('status');
  var elSearch = document.getElementById('search');
  var elLecture = document.getElementById('lecture-filter');

  document.getElementById('total-count').textContent = ALL.length;

  // populate lecture filter
  Object.keys(LECTURES).forEach(function (k) {
    var o = document.createElement('option');
    o.value = k;
    o.textContent = LECTURES[k];
    elLecture.appendChild(o);
  });

  function filtered() {
    var term = state.search.trim().toLowerCase();
    return ALL.filter(function (q) {
      if (state.lecture !== 'all' && String(q.l) !== state.lecture) return false;
      if (!term) return true;
      if (q.q.toLowerCase().indexOf(term) !== -1) return true;
      if (q.e.toLowerCase().indexOf(term) !== -1) return true;
      for (var i = 0; i < q.o.length; i++) {
        if (q.o[i].toLowerCase().indexOf(term) !== -1) return true;
      }
      return false;
    });
  }

  function renderBanks(list) {
    var pages = Math.max(1, Math.ceil(list.length / PER_BANK));
    if (state.bank >= pages) state.bank = 0;
    elBanks.innerHTML = '';
    for (var p = 0; p < pages; p++) {
      var from = p * PER_BANK + 1;
      var to = Math.min((p + 1) * PER_BANK, list.length);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'bank-btn';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', p === state.bank ? 'true' : 'false');
      b.textContent = list.length ? from + '–' + to : '0';
      b.dataset.page = p;
      elBanks.appendChild(b);
    }
  }

  function card(q, pos) {
    var li = document.createElement('li');
    li.className = 'card';

    var head = document.createElement('div');
    head.className = 'card-head';
    var num = document.createElement('span');
    num.className = 'qnum';
    num.textContent = pos + '.';
    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = LECTURES[q.l] || ('Lecture ' + q.l);
    head.appendChild(num);
    head.appendChild(tag);

    var p = document.createElement('p');
    p.className = 'qtext';
    p.textContent = q.q;

    var ul = document.createElement('ul');
    ul.className = 'opts';
    q.o.forEach(function (text, i) {
      var o = document.createElement('li');
      o.className = 'opt' + (i === q.a ? ' correct' : '');
      var l = document.createElement('span');
      l.className = 'letter';
      l.textContent = LETTERS[i] + '.';
      var t = document.createElement('span');
      t.className = 'otext';
      t.textContent = text;
      o.appendChild(l);
      o.appendChild(t);
      ul.appendChild(o);
    });

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'reveal';
    btn.textContent = 'Show answer';

    var ans = document.createElement('div');
    ans.className = 'answer';
    ans.hidden = true;
    var strong = document.createElement('strong');
    strong.textContent = 'Answer: ' + LETTERS[q.a] + '. ' + q.o[q.a];
    var why = document.createElement('span');
    why.className = 'why';
    why.textContent = q.e;
    ans.appendChild(strong);
    ans.appendChild(why);

    btn.addEventListener('click', function () {
      var open = !ans.hidden;
      ans.hidden = open;
      li.classList.toggle('shown', !open);
      btn.textContent = open ? 'Show answer' : 'Hide answer';
    });

    li.appendChild(head);
    li.appendChild(p);
    li.appendChild(ul);
    li.appendChild(btn);
    li.appendChild(ans);
    return li;
  }

  function render() {
    var list = filtered();
    renderBanks(list);

    var start = state.bank * PER_BANK;
    var page = list.slice(start, start + PER_BANK);

    elList.innerHTML = '';
    page.forEach(function (q, i) {
      elList.appendChild(card(q, start + i + 1));
    });

    elEmpty.hidden = list.length !== 0;

    var bits = [];
    bits.push(list.length + ' question' + (list.length === 1 ? '' : 's'));
    if (state.lecture !== 'all') bits.push('in ' + LECTURES[state.lecture]);
    if (state.search.trim()) bits.push('matching “' + state.search.trim() + '”');
    if (list.length > PER_BANK) {
      bits.push('— showing ' + (start + 1) + '–' + Math.min(start + PER_BANK, list.length));
    }
    elStatus.textContent = bits.join(' ');
  }

  function setAll(show) {
    var cards = elList.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var a = c.querySelector('.answer');
      var b = c.querySelector('.reveal');
      a.hidden = !show;
      c.classList.toggle('shown', show);
      b.textContent = show ? 'Hide answer' : 'Show answer';
    }
  }

  elBanks.addEventListener('click', function (e) {
    var b = e.target.closest('.bank-btn');
    if (!b) return;
    state.bank = parseInt(b.dataset.page, 10);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  elLecture.addEventListener('change', function () {
    state.lecture = this.value;
    state.bank = 0;
    render();
  });

  var timer = null;
  elSearch.addEventListener('input', function () {
    var v = this.value;
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.search = v;
      state.bank = 0;
      render();
    }, 160);
  });

  document.getElementById('reveal-all').addEventListener('click', function () { setAll(true); });
  document.getElementById('hide-all').addEventListener('click', function () { setAll(false); });

  render();
})();
