const assert = require('assert')

const range = (a, b) => {
  const o = []
  for (let i = a; i <= b; i++) {
    o.push(i)
  }
  return o
}
const intersection = (a, b) => a.intersection(b)
const all = (list) => {
  for (let i = 0; i < list.length; i++) {
    if (!list[i]) return false
  }
  return true
}

const bottom = new Set(range(1, 9))
const join = intersection
const complement = (set) => new Set([...bottom].filter((v) => !set.has(v)))
assert.deepEqual(Array.from(complement(new Set([1]))), range(2, 9))

const getBoard = () => range(1, 9).map(() => range(1, 9).map(() => bottom))
const mapBoard = (fn, board) =>
  board.map((row, y) => row.map((cell, x) => fn(cell, { x, y })))
const sameCoords = (a, b) => a.x === b.x && a.y === b.y

const isPeer = (a, b) =>
  !sameCoords(a, b) && (a.x === b.x || a.y === b.y || sameSquare(a, b))
const sameSquare = (a, b) => {
  for (let x = 0; x <= 6; x += 3) {
    for (let y = 0; y <= 6; y += 3) {
      const inWindow = (c) =>
        c.x >= x && c.x <= x + 2 && c.y >= y && c.y <= y + 2
      if (inWindow(a) && inWindow(b)) {
        return true
      }
    }
  }
  return false
}

assert.equal(sameSquare({ x: 0, y: 2 }, { x: 2, y: 2 }), true)
assert.equal(sameSquare({ x: 0, y: 2 }, { x: 2, y: 3 }), false)

const encode = ({ x, y }) => `${x},${y}`
const decode = (str) => {
  const [x, y] = str.split(',').map((v) => parseInt(v))
  return { x, y }
}
const buildDepMap = (board) => {
  const cells = mapBoard((cell, coords) => ({ cell, coords }), board).flatMap(
    (row) => row
  )
  return cells.reduce((out, { coords }) => {
    out[encode(coords)] = {
      deps: cells
        .filter((c) => isPeer(coords, c.coords))
        .map(({ coords }) => coords),
      queue: []
    }
    return out
  }, {})
}

const propagate = (update, coords, originalBoard) => {
  const map = buildDepMap(originalBoard)
  const board = mapBoard(
    (cell, cellCoords) =>
      sameCoords(coords, cellCoords) ? join(cell, update) : cell,
    originalBoard
  )

  const depsForCoords = (coords) => map[encode(coords)].deps
  const setOfDeps = (list) => new Set(list.map((c) => encode(c)))

  let affected = setOfDeps(depsForCoords(coords))
  affected.forEach((key) => {
    map[key].queue.push((c) => join(c, complement(update)))
  })

  while (affected.size) {
    const incoming = affected
    affected = new Set()
    incoming.forEach((key) => {
      const { x, y } = decode(key)
      const og = board[y][x]
      const newVal = map[key].queue.reduce((val, fn) => fn(val), og)

      board[y][x] = newVal

      if (og.size > 1 && newVal.size === 1) {
        const newlyAffected = setOfDeps(depsForCoords({ x, y }))
        newlyAffected.forEach((key) => {
          map[key].queue.push((c) => join(c, complement(newVal)))
        })
        affected = affected.union(newlyAffected)
      }
    })
  }

  return board
}

const smallestCell = (a, b) => {
  if (a.cell.size < b.cell.size) {
    return -1
  }
  if (a.cell.size > b.cell.size) {
    return 1
  }
  return 0
}

const isValid = (board) =>
  all(board.flatMap((v) => v).map((cell) => cell.size > 0))
const isDone = (board) =>
  all(board.flatMap((v) => v).map((cell) => cell.size === 1))

const search = (board) => {
  if (isDone(board)) {
    return board
  }
  if (!isValid(board)) {
    return null
  }

  const cells = mapBoard((cell, coords) => ({ cell, coords }), board)
    .flatMap((row) => row)
    .filter(({ cell }) => cell.size > 1)
    .sort(smallestCell)

  const { cell, coords } = cells[0]
  const vals = Array.from(cell)

  const update = new Set([vals[0]])
  const solution = search(propagate(update, coords, board))
  if (solution) {
    return solution
  }

  return search(propagate(join(cell, complement(update)), coords, board))
}
const fromString = (input) => {
  let b = getBoard()
  for (let i = 0; i < input.length; i++) {
    const x = i % 9
    const y = Math.floor(i / 9)
    const num = parseInt(input[i])
    if (bottom.has(num)) {
      b = propagate(new Set([num]), { x, y }, b)
    }
  }
  return b
}

const easy =
  '003020600900305001001806400008102900700000008006708200002609500800203009005010300'

module.exports = {
  getBoard,
  propagate,
  search,
  easy,
  fromString
}
