const { useReducer, useMemo, useCallback, memo } = React;

const GRID_SIZE = 150;

// ---- state as 2D array: values[row][col] ----
const initial = {
    values: Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
    ),
};

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_ONE": {
            const { index, delta = 0, reset = false } = action;
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;

            // copy outer array and the changed row
            const valuesCopy = state.values.slice();
            const rowCopy = valuesCopy[row].slice();

            rowCopy[col] = reset ? 0 : rowCopy[col] + delta;
            valuesCopy[row] = rowCopy;

            return { values: valuesCopy };
        }
        case "INC_ALL": {
            const { by = 1 } = action;
            return {
                values: state.values.map((row) => row.map((v) => v + by)),
            };
        }
        case "RESET_ALL": {
            return {
                values: Array.from({ length: GRID_SIZE }, () =>
                    Array(GRID_SIZE).fill(0)
                ),
            };
        }
        default:
            return state;
    }
}

// ---- Components ----

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

// One row of counters (memoized, so only the row with a changed value re-renders)
const GridRow = memo(function GridRow({ rowIndex, rowValues, onAction }) {
    return (
        <>
            {rowValues.map((value, colIndex) => {
                const index = rowIndex * GRID_SIZE + colIndex;
                return (
                    <CounterCard
                        key={index}
                        index={index}
                        value={value}
                        onAction={onAction}
                    />
                );
            })}
        </>
    );
});

function StatsBar({ values, onIncAll, onResetAll }) {
    const sum = useMemo(() => {
        return values.reduce(
            (outerAcc, row) => outerAcc + row.reduce((a, b) => a + b, 0),
            0
        );
    }, [values]);

    const totalCount = GRID_SIZE * GRID_SIZE;
    const avg = useMemo(
        () => (totalCount ? sum / totalCount : 0),
        [sum, totalCount]
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
            {values.map((rowValues, rowIndex) => (
                <GridRow
                    key={rowIndex}
                    rowIndex={rowIndex}
                    rowValues={rowValues}
                    onAction={handleAction}
                />
            ))}
        </div>
    );

}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
