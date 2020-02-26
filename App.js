const React = require('react')
const { render } = require('react-dom')
const { getBoard, propagate, search, fromString } = require('./')

const App = () => {
  const [board, setBoard] = React.useState(getBoard())
  const [puzzleInput, setPuzzle] = React.useState(
    '003020600900305001001806400008102900700000008006708200002609500800203009005010300'
  )
  return (
    <div className="container">
      <h1>Sudoku</h1>
      <form
        className="row"
        onSubmit={e => {
          e.preventDefault()
          setBoard(fromString(puzzleInput))
        }}
      >
        <input
          type="text"
          value={puzzleInput}
          onChange={e => {
            setPuzzle(e.target.value)
          }}
        />
        <input type="submit" value="View Puzzle" />
      </form>
      <table>
        <tbody>
          {board.map((row, y) => (
            <tr key={y}>
              {row.map((cell, x) => (
                <td key={x} className={`c${x + 1} r${y + 1}`}>
                  {cell.size > 1 ? (
                    <div className="remaining">
                      {Array.from(cell).map(num => (
                        <span
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
        <button
          onClick={() => {
            let solution = search(board)
            if (solution) {
              setBoard(solution)
            }
          }}
        >
          Find Solution
        </button>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('main'))
