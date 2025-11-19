// vanilla.js – 100x100 counters

const GRID_SIZE = 150;
const TOTAL = GRID_SIZE * GRID_SIZE;

const state = {
    values: new Array(TOTAL).fill(0),
};

const grid = document.querySelector(".grid");
grid.innerHTML = "";

// ---------- Stats bar ----------
const stats = document.createElement("div");
stats.className = "card";
stats.style.gridColumn = "1 / -1";
stats.innerHTML = `
  <div class="top">
    <div class="title">Stats</div>
    <div class="value" aria-live="polite">
      <span class="sum">0</span>
      <span style="font-size:16px;opacity:.7">
        (sum) • avg <span class="avg">0.0</span>
      </span>
    </div>
  </div>
  <div class="btns">
    <button class="primary" data-bulk="inc1">+1 all</button>
    <button data-bulk="inc10">+10 all</button>
    <button data-bulk="reset">Reset all</button>
  </div>
`;
grid.appendChild(stats);

const sumEl = stats.querySelector(".sum");
const avgEl = stats.querySelector(".avg");

// ---------- Build 10,000 counter cards ----------
const valueEls = new Array(TOTAL);

for (let i = 0; i < TOTAL; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = String(i);
    card.innerHTML = `
    <div class="top">
      <div class="title">#${i}</div>
      <div class="value" aria-live="polite">0</div>
    </div>
    <div class="btns">
      <button class="primary" data-action="inc">+1</button>
      <button data-action="dec">-1</button>
      <button data-action="inc10">+10</button>
      <button data-action="reset">Reset</button>
    </div>
  `;
    valueEls[i] = card.querySelector(".value");
    grid.appendChild(card);
}

// ---------- Rendering ----------
function renderCell(index) {
    valueEls[index].textContent = state.values[index];
}

function renderStats() {
    const sum = state.values.reduce((a, b) => a + b, 0);
    const avg = state.values.length ? sum / state.values.length : 0;
    sumEl.textContent = String(sum);
    avgEl.textContent = avg.toFixed(1);
}

function renderAll() {
    for (let i = 0; i < TOTAL; i++) {
        renderCell(i);
    }
    renderStats();
}

// ---------- Event handling (delegated) ----------
grid.addEventListener("click", (e) => {
    const bulkBtn = e.target.closest("button[data-bulk]");
    if (bulkBtn) {
        const kind = bulkBtn.dataset.bulk;
        if (kind === "inc1") {
            for (let i = 0; i < TOTAL; i++) state.values[i] += 1;
        } else if (kind === "inc10") {
            for (let i = 0; i < TOTAL; i++) state.values[i] += 10;
        } else if (kind === "reset") {
            state.values.fill(0);
        }
        renderAll();
        return;
    }

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const card = btn.closest(".card");
    if (!card || !card.dataset.index) return;

    const index = Number(card.dataset.index);
    const action = btn.dataset.action;

    if (action === "inc") state.values[index] += 1;
    else if (action === "dec") state.values[index] -= 1;
    else if (action === "inc10") state.values[index] += 10;
    else if (action === "reset") state.values[index] = 0;

    renderCell(index);
    renderStats();
});

// initial paint
renderAll();
