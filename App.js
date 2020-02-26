const React = require('react')
const { render } = require('react-dom')
const { getBoard, propagate, search, fromString } = require('./')

const App = () => {
  const [board, setBoard] = React.useState(getBoard())
  const [puzzleInput, setPuzzle] = React.useState(
    '003020600900305001001806400008102900700000008006708200002609500800203009005010300'
  )
  return (
    <div>
      <table>
        <tbody>
          {board.map((row, y) => (
            <tr key={y}>
              {row.map((cell, x) => (
                <td key={x}>
                  {Array.from(cell).map(num => (
                    <span
                      onClick={() => {
                        setBoard(propagate(new Set([num]), { x, y }, board))
                      }}
                    >
                      {num}
                    </span>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          let solution = search(board)
          if (solution) {
            setBoard(solution)
          }
        }}
      >
        search
      </button>

      <form
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
      </form>
    </div>
  )
}

render(<App />, document.getElementById('main'))
