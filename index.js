const assert = require('assert')

const range = (a, b) => {
  let o = []
  for (let i = a; i <= b; i++) {
    o.push(i)
  }
  return o
}
const intersection = (a, b) => new Set([...a].filter(x => b.has(x)))
const all = list => {
  for (let i = 0; i < list.length; i++) {
    if (!list[i]) return false
  }
  return true
}
const sum = list => list.reduce((a, b) => a + b, 0)

const bottom = new Set(range(1, 9))
const join = intersection
const complement = set => new Set([...bottom].filter(v => !set.has(v)))
assert.deepEqual(Array.from(complement(new Set([1]))), range(2, 9))

const getBoard = () => range(1, 9).map(() => range(1, 9).map(() => bottom))
const mapBoard = (fn, board) =>
  board.map((row, y) => row.map((cell, x) => fn(cell, { x, y })))
const sameCoords = (a, b) => a.x === b.x && a.y === b.y

const isPeer = (a, b) => a.x === b.x || a.y === b.y || sameSquare(a, b)
const sameSquare = (a, b) => {
  for (let x = 0; x <= 6; x += 3) {
    for (let y = 0; y <= 6; y += 3) {
      const inWindow = c => c.x >= x && c.x <= x + 2 && c.y >= y && c.y <= y + 2
      if (inWindow(a) && inWindow(b)) {
        return true
      }
    }
  }
  return false
}

assert.equal(sameSquare({ x: 0, y: 2 }, { x: 2, y: 2 }), true)
assert.equal(sameSquare({ x: 0, y: 2 }, { x: 2, y: 3 }), false)

const propagate = (semi, coords, board) =>
  mapBoard(
    (cell, cellCoords) =>
      sameCoords(coords, cellCoords)
        ? join(cell, semi)
        : isPeer(coords, cellCoords)
        ? join(cell, complement(semi))
        : cell,
    board
  )

const smallestCell = (a, b) => {
  if (a.cell.size < b.cell.size) {
    return -1
  }
  if (a.cell.size > b.cell.size) {
    return 1
  }
  return 0
}

const isValid = board => all(board.flatMap(v => v).map(cell => cell.size > 0))
const isDone = board => all(board.flatMap(v => v).map(cell => cell.size === 1))

const search = board => {
  if (isDone(board)) {
    return board
  }
  if (!isValid(board)) {
    return null
  }

  const cells = mapBoard((cell, coords) => ({ cell, coords }), board)
    .flatMap(row => row)
    .filter(({ cell }) => cell.size > 1)
    .sort(smallestCell)

  const { cell, coords } = cells[0]
  const vals = Array.from(cell)

  let update = new Set([vals[0]])
  let solution = search(propagate(update, coords, board))
  if (solution) {
    return solution
  }

  return search(propagate(join(cell, complement(update)), coords, board))
}
const fromString = input => {
  let b = getBoard()
  for (let i = 0; i < input.length; i++) {
    let x = i % 9
    let y = Math.floor(i / 9)
    let num = parseInt(input[i])
    if (bottom.has(num)) {
      b = propagate(new Set([num]), { x, y }, b)
    }
  }
  return b
}

module.exports = {
  getBoard,
  propagate,
  search,
  fromString
}