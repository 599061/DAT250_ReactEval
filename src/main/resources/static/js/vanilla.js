// --------- State + history ----------
const state = {
    values: [0, 5, 10],
    past: [],
    future: [],
};

const push = (nextValues) => {
    state.past.push([...state.values]);
    state.values = nextValues;
    state.future = [];
};

// --------- DOM refs ----------
const cards = Array.from(document.querySelectorAll('.card[data-counter]'));
const valueEls = cards.map(c => c.querySelector('.value'));

// Stats bar (append one extra card)
const grid = document.querySelector('.grid');
const stats = document.createElement('div');
stats.className = 'card';
stats.style.gridColumn = '1 / span 12';
stats.innerHTML = `
      <div class="top">
        <div class="title">Stats</div>
        <div class="value" aria-live="polite"><span class="sum">0</span> <span style="font-size:16px;opacity:.7">(sum) • avg <span class="avg">0.0</span></span></div>
      </div>
      <div class="btns">
        <button class="primary" data-bulk="inc1">+1 all</button>
        <button data-bulk="inc10">+10 all</button>
        <button data-bulk="reset">Reset all</button>
        <button data-undo>Undo</button>
        <button data-redo>Redo</button>
      </div>
    `;
grid.appendChild(stats);
const sumEl = stats.querySelector('.sum');
const avgEl = stats.querySelector('.avg');
const undoBtn = stats.querySelector('[data-undo]');
const redoBtn = stats.querySelector('[data-redo]');

// --------- Renderers ----------
function renderCard(i) {
    valueEls[i].textContent = state.values[i];
}
function renderStats() {
    const sum = state.values.reduce((a, b) => a + b, 0);
    const avg = state.values.length ? sum / state.values.length : 0;
    sumEl.textContent = String(sum);
    avgEl.textContent = avg.toFixed(1);
    undoBtn.disabled = state.past.length === 0;
    redoBtn.disabled = state.future.length === 0;
}
function renderAll() {
    for (let i = 0; i < valueEls.length; i++) renderCard(i);
    renderStats();
}

// --------- Event handling ----------
// Per-card buttons (only update the clicked card + stats)
cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        let next = [...state.values];
        if (action === 'inc') next[i] += 1;
        else if (action === 'dec') next[i] -= 1;
        else if (action === 'inc10') next[i] += 10;
        else if (action === 'reset') next[i] = 0;
        push(next);
        renderCard(i);   // update only changed card
        renderStats();   // but we still must refresh derived stats
    });
});

// Bulk ops + undo/redo
stats.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;

    if (t.hasAttribute('data-undo')) {
        if (!state.past.length) return;
        state.future.unshift([...state.values]);
        state.values = state.past.pop();
        renderAll();
        return;
    }
    if (t.hasAttribute('data-redo')) {
        if (!state.future.length) return;
        state.past.push([...state.values]);
        state.values = state.future.shift();
        renderAll();
        return;
    }

    const bulk = t.getAttribute('data-bulk');
    if (bulk === 'inc1') push(state.values.map(v => v + 1));
    else if (bulk === 'inc10') push(state.values.map(v => v + 10));
    else if (bulk === 'reset') push([0, 0, 0]);
    renderAll(); // bulk touches all cards + stats
});

// Init
renderAll();