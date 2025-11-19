// react.jsx – 100x100 counters
const { useReducer, useMemo, useCallback, memo } = React;

const GRID_SIZE = 150;
const TOTAL = GRID_SIZE * GRID_SIZE;

// ---------------- State + reducer ----------------

const initial = {
    values: Array(TOTAL).fill(0),
};

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_ONE": {
            const { index, delta = 0, reset = false } = action;
            const next = state.values.slice();
            next[index] = reset ? 0 : next[index] + delta;
            return { values: next };
        }
        case "INC_ALL": {
            const { by = 1 } = action;
            return { values: state.values.map((v) => v + by) };
        }
        case "RESET_ALL": {
            return { values: Array(TOTAL).fill(0) };
        }
        default:
            return state;
    }
}

// ---------------- Components ----------------

// One counter cell (memoized so only changed cells re-render)
const CounterCard = memo(function CounterCard({ index, value, onAction }) {
    return (
        <div className="card">
            <div className="top">
                <div className="title">#{index}</div>
                <div className="value" aria-live="polite">
                    {value}
                </div>
            </div>
            <div className="btns">
                <button
                    className="primary"
                    onClick={() => onAction("UPDATE_ONE", index, 1)}
                >
                    +1
                </button>
                <button onClick={() => onAction("UPDATE_ONE", index, -1)}>-1</button>
                <button onClick={() => onAction("UPDATE_ONE", index, 10)}>+10</button>
                <button onClick={() => onAction("UPDATE_ONE", index, 0, true)}>
                    Reset
                </button>
            </div>
        </div>
    );
});

function StatsBar({ values, onIncAll, onResetAll }) {
    const sum = useMemo(
        () => values.reduce((a, b) => a + b, 0),
        [values]
    );
    const avg = useMemo(
        () => (values.length ? sum / values.length : 0),
        [sum, values.length]
    );

    return (
        <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="top">
                <div className="title">Stats</div>
                <div className="value" aria-live="polite">
                    {sum}{" "}
                    <span style={{ fontSize: 16, opacity: 0.7 }}>
            (sum) • avg {avg.toFixed(1)}
          </span>
                </div>
            </div>
            <div className="btns">
                <button className="primary" onClick={() => onIncAll(1)}>
                    +1 all
                </button>
                <button onClick={() => onIncAll(10)}>+10 all</button>
                <button onClick={onResetAll}>Reset all</button>
            </div>
        </div>
    );
}

function App() {
    const [state, dispatch] = useReducer(reducer, initial);
    const { values } = state;

    // Single stable callback shared by all cells
    const handleAction = useCallback(
        (type, index, by = 0, reset = false) => {
            if (type === "UPDATE_ONE") {
                dispatch({ type, index, delta: by, reset });
            }
        },
        []
    );

    const handleIncAll = useCallback(
        (by) => dispatch({ type: "INC_ALL", by }),
        []
    );
    const handleResetAll = useCallback(
        () => dispatch({ type: "RESET_ALL" }),
        []
    );

    return (
        <div className="grid">
            <StatsBar
                values={values}
                onIncAll={handleIncAll}
                onResetAll={handleResetAll}
            />
            {values.map((value, i) => (
                <CounterCard
                    key={i}
                    index={i}
                    value={value}
                    onAction={handleAction}
                />
            ))}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
