import React from 'react'
import { createRoot } from 'react-dom/client'
import { getBoard, propagate, fromString, easy } from './index.js'

const App = () => {
  const [board, setBoard] = React.useState(getBoard())
  const [puzzleInput, setPuzzle] = React.useState(easy)
  const [solving, setSolving] = React.useState(false)
  const workerRef = React.useRef(null)

  const findSolution = () => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      })
    }
    const worker = workerRef.current
    setSolving(true)
    worker.onmessage = (e) => {
      setSolving(false)
      if (e.data) {
        setBoard(e.data)
      }
    }
    worker.postMessage(board)
  }

  return (
    <div className="container">
      <h1>Sudoku</h1>

      <table className="row">
        <tbody>
          {board.map((row, y) => (
            <tr key={y}>
              {row.map((cell, x) => (
                <td
                  key={x}
                  className={`c${x + 1} r${y + 1} ${
                    cell.size === 0 ? 'conflict' : ''
                  }`}
                >
                  {cell.size > 1 ? (
                    <div className="remaining">
                      {Array.from(cell).map((num) => (
                        <span
                          key={num}
                          onClick={() => {
                            setBoard(propagate(new Set([num]), { x, y }, board))
                          }}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="answer">
                    {cell.size === 1 ? Array.from(cell)[0] : '\u00a0'}
                  </p>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row">
        <button onClick={findSolution} disabled={solving}>
          {solving ? 'Solving…' : 'Find Solution'}
        </button>
      </div>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          setBoard(fromString(puzzleInput))
        }}
      >
        <input
          type="text"
          value={puzzleInput}
          onChange={(e) => {
            setPuzzle(e.target.value)
          }}
        />
        <input type="submit" value="View Puzzle" />
      </form>
    </div>
  )
}

createRoot(document.getElementById('main')).render(<App />)
