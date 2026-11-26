(function () {
  'use strict';

  var ALL = window.QUESTIONS || [];
  var LECTURES = window.LECTURES || {};
  var PER_BANK = 50;
  var LETTERS = ['A', 'B', 'C', 'D'];

  var state = { bank: 0, lecture: 'all', type: 'all', search: '' };
  var picks = {};   // question number -> chosen option index

  var elBanks = document.getElementById('banks');
  var elStrip = document.querySelector('.bankstrip');
  var elList = document.getElementById('qlist');
  var elEmpty = document.getElementById('empty');
  var elStatus = document.getElementById('status');
  var elScore = document.getElementById('score');
  var elSearch = document.getElementById('search');
  var elLecture = document.getElementById('lecture-filter');
  var elType = document.getElementById('type-filter');
  var elTools = document.getElementById('tools');

  document.getElementById('total-count').textContent = ALL.length;

  Object.keys(LECTURES).forEach(function (k) {
    var o = document.createElement('option');
    o.value = k;
    o.textContent = LECTURES[k];
    elLecture.appendChild(o);
  });

  // filters panel: open on wide screens, collapsed on phones
  if (window.matchMedia && window.matchMedia('(min-width: 761px)').matches) {
    elTools.open = true;
  }

  function filtered() {
    var term = state.search.trim().toLowerCase();
    return ALL.filter(function (q) {
      if (state.lecture !== 'all' && String(q.l) !== state.lecture) return false;
      if (state.type !== 'all' && q.t !== state.type) return false;
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
      b.dataset.page = String(p);
      elBanks.appendChild(b);
    }
    var active = elBanks.querySelector('[aria-selected="true"]');
    if (active && elStrip) {
      elStrip.scrollLeft = Math.max(0, active.offsetLeft - 60);
    }
  }

  function updateScore(pageQs) {
    var done = 0, right = 0;
    pageQs.forEach(function (q) {
      if (typeof picks[q.n] === 'number') {
        done++;
        if (picks[q.n] === q.a) right++;
      }
    });
    if (!done) {
      elScore.textContent = '';
      elScore.classList.add('empty-score');
    } else {
      elScore.classList.remove('empty-score');
      elScore.textContent = 'Score on this bank: ' + right + '/' + done +
        ' (' + Math.round((right / done) * 100) + '%)';
    }
  }

  function card(q, pos, pageQs) {
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
    if (q.t === 'a') {
      var at = document.createElement('span');
      at.className = 'tag applied';
      at.textContent = 'Applied';
      head.appendChild(at);
    }

    var p = document.createElement('p');
    p.className = 'qtext';
    p.textContent = q.q;

    var ul = document.createElement('ul');
    ul.className = 'opts';
    var buttons = [];

    q.o.forEach(function (text, i) {
      var liOpt = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt';
      var l = document.createElement('span');
      l.className = 'letter';
      l.textContent = LETTERS[i] + '.';
      var t = document.createElement('span');
      t.className = 'otext';
      t.textContent = text;
      var mark = document.createElement('span');
      mark.className = 'mark';
      btn.appendChild(l);
      btn.appendChild(t);
      btn.appendChild(mark);
      btn.addEventListener('click', function () { choose(i); });
      liOpt.appendChild(btn);
      ul.appendChild(liOpt);
      buttons.push(btn);
    });

    var foot = document.createElement('div');
    foot.className = 'cardfoot';

    var reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'reveal';
    reveal.textContent = 'Show answer';

    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'retry';
    retry.textContent = 'Try again';
    retry.hidden = true;

    var verdict = document.createElement('span');
    verdict.className = 'verdict';

    foot.appendChild(reveal);
    foot.appendChild(retry);
    foot.appendChild(verdict);

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

    function showAnswer(on) {
      ans.hidden = !on;
      reveal.textContent = on ? 'Hide answer' : 'Show answer';
      if (on) buttons[q.a].classList.add('right');
      else if (typeof picks[q.n] !== 'number') buttons[q.a].classList.remove('right');
    }

    function paint() {
      var pick = picks[q.n];
      var answered = typeof pick === 'number';
      buttons.forEach(function (b, i) {
        b.classList.remove('right', 'wrong', 'dim');
        b.querySelector('.mark').textContent = '';
        b.disabled = answered;
      });
      li.classList.remove('answered-right', 'answered-wrong');
      retry.hidden = !answered;
      verdict.textContent = '';
      verdict.className = 'verdict';

      if (!answered) { showAnswer(!ans.hidden); return; }

      buttons[q.a].classList.add('right');
      buttons[q.a].querySelector('.mark').textContent = '✓';
      if (pick === q.a) {
        li.classList.add('answered-right');
        verdict.textContent = 'Correct';
        verdict.className = 'verdict ok';
      } else {
        buttons[pick].classList.add('wrong');
        buttons[pick].querySelector('.mark').textContent = '✗';
        li.classList.add('answered-wrong');
        verdict.textContent = 'Not correct — the key is ' + LETTERS[q.a];
        verdict.className = 'verdict no';
      }
      buttons.forEach(function (b, i) {
        if (i !== q.a && i !== pick) b.classList.add('dim');
      });
      showAnswer(true);
    }

    function choose(i) {
      if (typeof picks[q.n] === 'number') return;
      picks[q.n] = i;
      paint();
      updateScore(pageQs);
    }

    reveal.addEventListener('click', function () { showAnswer(ans.hidden); });
    retry.addEventListener('click', function () {
      delete picks[q.n];
      ans.hidden = true;
      paint();
      updateScore(pageQs);
    });

    li.appendChild(head);
    li.appendChild(p);
    li.appendChild(ul);
    li.appendChild(foot);
    li.appendChild(ans);

    li._paint = paint;
    li._showAnswer = showAnswer;
    paint();
    return li;
  }

  var pageQs = [];

  function render() {
    var list = filtered();
    renderBanks(list);

    var start = state.bank * PER_BANK;
    pageQs = list.slice(start, start + PER_BANK);

    elList.innerHTML = '';
    pageQs.forEach(function (q, i) {
      elList.appendChild(card(q, start + i + 1, pageQs));
    });

    elEmpty.hidden = list.length !== 0;

    var bits = [list.length + ' question' + (list.length === 1 ? '' : 's')];
    if (state.lecture !== 'all') bits.push('in ' + LECTURES[state.lecture]);
    if (state.type !== 'all') bits.push(state.type === 'a' ? '(applied only)' : '(recall only)');
    if (state.search.trim()) bits.push('matching “' + state.search.trim() + '”');
    if (list.length > PER_BANK) {
      bits.push('— showing ' + (start + 1) + '–' + Math.min(start + PER_BANK, list.length));
    }
    elStatus.textContent = bits.join(' ');
    updateScore(pageQs);
  }

  function setAll(show) {
    var cards = elList.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      if (cards[i]._showAnswer) cards[i]._showAnswer(show);
    }
  }

  elBanks.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.bank-btn') : null;
    if (!b) return;
    state.bank = parseInt(b.dataset.page, 10);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  elLecture.addEventListener('change', function () {
    state.lecture = this.value; state.bank = 0; render();
  });
  elType.addEventListener('change', function () {
    state.type = this.value; state.bank = 0; render();
  });

  var timer = null;
  elSearch.addEventListener('input', function () {
    var v = this.value;
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.search = v; state.bank = 0; render();
    }, 160);
  });

  document.getElementById('reveal-all').addEventListener('click', function () { setAll(true); });
  document.getElementById('hide-all').addEventListener('click', function () { setAll(false); });
  document.getElementById('reset-bank').addEventListener('click', function () {
    pageQs.forEach(function (q) { delete picks[q.n]; });
    render();
  });

  render();
})();
