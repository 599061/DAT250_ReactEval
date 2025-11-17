const { useReducer, useMemo, memo } = React;

// ---------------- Reducer & State ----------------
const initial = { values: [0, 5, 10], past: [], future: [] };

function reducer(state, action) {
    const push = (nextValues) => ({
        values: nextValues,
        past: [...state.past, state.values],
        future: [],
    });

    switch (action.type) {
        case 'INC': {
            const { index, by = 1 } = action;
            const next = state.values.map((v, i) => (i === index ? v + by : v));
            return push(next);
        }
        case 'DEC': {
            const { index, by = 1 } = action;
            const next = state.values.map((v, i) => (i === index ? v - by : v));
            return push(next);
        }
        case 'RESET_ONE': {
            const { index } = action;
            const next = state.values.map((v, i) => (i === index ? 0 : v));
            return push(next);
        }
        case 'INC_ALL': {
            const { by = 1 } = action;
            return push(state.values.map(v => v + by));
        }
        case 'RESET_ALL': {
            return push([0, 0, 0]);
        }
        case 'UNDO': {
            if (!state.past.length) return state;
            const prev = state.past[state.past.length - 1];
            return {
                values: prev,
                past: state.past.slice(0, -1),
                future: [state.values, ...state.future],
            };
        }
        case 'REDO': {
            if (!state.future.length) return state;
            const next = state.future[0];
            return {
                values: next,
                past: [...state.past, state.values],
                future: state.future.slice(1),
            };
        }
        default:
            return state;
    }
}

// ---------------- Components ----------------
const CounterCard = memo(function CounterCard({ label, className = "", value, onInc, onDec, onInc10, onReset }) {
    return (
        <div className={"card " + className}>
            <div className="top">
                <div className="title">{label}</div>
                <div className="value" aria-live="polite">{value}</div>
            </div>
            <div className="btns">
                <button className="primary" onClick={onInc}>+1</button>
                <button onClick={onDec}>-1</button>
                <button onClick={onInc10}>+10</button>
                <button onClick={onReset}>Reset</button>
            </div>
        </div>
    );
});

function StatsBar({ values, onIncAll, onResetAll, onUndo, onRedo, canUndo, canRedo }) {
    const sum = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
    const avg = useMemo(() => (values.length ? (sum / values.length) : 0), [sum, values.length]);

    return (
        <div className="card" style={{gridColumn: "1 / span 12"}}>
            <div className="top">
                <div className="title">Stats</div>
                <div className="value" aria-live="polite">{sum} <span style={{fontSize:16, opacity:.7}}>(sum) • avg {avg.toFixed(1)}</span></div>
            </div>
            <div className="btns">
                <button className="primary" onClick={() => onIncAll(1)}>+1 all</button>
                <button onClick={() => onIncAll(10)}>+10 all</button>
                <button onClick={onResetAll}>Reset all</button>
                <button onClick={onUndo} disabled={!canUndo}>Undo</button>
                <button onClick={onRedo} disabled={!canRedo}>Redo</button>
            </div>
        </div>
    );
}

function App() {
    const [state, dispatch] = useReducer(reducer, initial);
    const { values, past, future } = state;

    const card = (i, label, className) => (
        <CounterCard
            key={i}
            label={label}
            className={className}
            value={values[i]}
            onInc={() => dispatch({ type: 'INC', index: i })}
            onDec={() => dispatch({ type: 'DEC', index: i })}
            onInc10={() => dispatch({ type: 'INC', index: i, by: 10 })}
            onReset={() => dispatch({ type: 'RESET_ONE', index: i })}
        />
    );

    return (
        <div className="grid">
            {card(0, "Counter A", "layout-1")}
            {card(1, "Counter B", "layout-2")}
            {card(2, "Counter C", "layout-3")}
            <StatsBar
                values={values}
                onIncAll={(by) => dispatch({ type: 'INC_ALL', by })}
                onResetAll={() => dispatch({ type: 'RESET_ALL' })}
                onUndo={() => dispatch({ type: 'UNDO' })}
                onRedo={() => dispatch({ type: 'REDO' })}
                canUndo={past.length > 0}
                canRedo={future.length > 0}
            />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);