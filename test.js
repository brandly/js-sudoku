import assert from 'node:assert'
import {
  getBoard,
  propagate,
  search,
  easy,
  fromString,
  complement,
  sameSquare,
  range
} from './index.js'

assert.deepEqual(Array.from(complement(new Set([1]))), range(2, 9))

assert.equal(sameSquare({ x: 0, y: 2 }, { x: 2, y: 2 }), true)
assert.equal(sameSquare({ x: 0, y: 2 }, { x: 2, y: 3 }), false)

// a solved board has 81 singleton cells and no value repeated in any unit
const assertSolved = (board) => {
  assert.ok(board, 'expected a solution, got null')
  const val = (x, y) => {
    assert.equal(board[y][x].size, 1)
    return Array.from(board[y][x])[0]
  }
  for (let i = 0; i < 9; i++) {
    assert.equal(new Set(range(0, 8).map((j) => val(j, i))).size, 9)
    assert.equal(new Set(range(0, 8).map((j) => val(i, j))).size, 9)
  }
  for (let x = 0; x < 9; x += 3) {
    for (let y = 0; y < 9; y += 3) {
      const square = range(0, 2).flatMap((dx) =>
        range(0, 2).map((dy) => val(x + dx, y + dy))
      )
      assert.equal(new Set(square).size, 9)
    }
  }
}

// pinning a cell to a value removes that value from its peers
const pinned = propagate(new Set([5]), { x: 0, y: 0 }, getBoard())
assert.equal(pinned[0][1].has(5), false)
assert.equal(pinned[1][0].has(5), false)
assert.equal(pinned[1][1].has(5), false)

// a non-singleton update must NOT constrain peers (regression)
const guessed = propagate(new Set([2, 3, 4]), { x: 0, y: 0 }, getBoard())
assert.equal(guessed[0][0].size, 3)
assert.equal(guessed[0][1].size, 9)
assert.equal(guessed[1][0].size, 9)

assertSolved(search(fromString(easy)))
assertSolved(search(getBoard()))

// sparse puzzles that force branching on cells with 3+ candidates (regression:
// these used to come back null)
assertSolved(
  search(
    fromString(
      '000000012003600000000007000410020000000500300700000600280000040000300500000000000'
    )
  )
)
assertSolved(
  search(
    fromString(
      '000000012008030000000000040120500000000004700060000000507000300000620000000100000'
    )
  )
)

// contradictory puzzle (two 1s in the top row) has no solution
assert.equal(
  search(fromString('11' + '0'.repeat(79))),
  null
)

// input longer than 81 chars is truncated instead of crashing
assert.doesNotThrow(() => fromString(easy + '5'))

console.log('all tests passed')
