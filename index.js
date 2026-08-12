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

const getBoard = () => range(1, 9).map(() => range(1, 9).map(() => bottom))
const mapBoard = (fn, board) =>
  board.map((row, y) => row.map((cell, x) => fn(cell, { x, y })))
const sameCoords = (a, b) => a.x === b.x && a.y === b.y

const isPeer = (a, b) =>
  !sameCoords(a, b) && (a.x === b.x || a.y === b.y || sameSquare(a, b))
const sameSquare = (a, b) =>
  Math.floor(a.x / 3) === Math.floor(b.x / 3) &&
  Math.floor(a.y / 3) === Math.floor(b.y / 3)

const encode = ({ x, y }) => `${x},${y}`
const decode = (str) => {
  const [x, y] = str.split(',').map((v) => parseInt(v))
  return { x, y }
}
const buildDepMap = () => {
  const coords = range(0, 8).flatMap((y) => range(0, 8).map((x) => ({ x, y })))
  return coords.reduce((out, c) => {
    out[encode(c)] = coords.filter((other) => isPeer(c, other))
    return out
  }, {})
}
// the peer graph is pure geometry, so build it once
const depMap = buildDepMap()

const propagate = (update, coords, originalBoard) => {
  const newVal = join(originalBoard[coords.y][coords.x], update)
  const board = mapBoard(
    (cell, cellCoords) =>
      sameCoords(coords, cellCoords) ? newVal : cell,
    originalBoard
  )

  const depsForCoords = (coords) => depMap[encode(coords)]
  const setOfDeps = (list) => new Set(list.map((c) => encode(c)))
  const queues = {}
  const enqueue = (key, fn) => {
    queues[key] = queues[key] || []
    queues[key].push(fn)
  }

  let affected = new Set()
  // a cell only constrains its peers once it's pinned to a single value
  if (newVal.size === 1) {
    affected = setOfDeps(depsForCoords(coords))
    affected.forEach((key) => {
      enqueue(key, (c) => join(c, complement(newVal)))
    })
  }

  while (affected.size) {
    const incoming = affected
    affected = new Set()
    incoming.forEach((key) => {
      const { x, y } = decode(key)
      const og = board[y][x]
      const newVal = (queues[key] || []).reduce((val, fn) => fn(val), og)
      queues[key] = []

      board[y][x] = newVal

      if (og.size > 1 && newVal.size === 1) {
        const newlyAffected = setOfDeps(depsForCoords({ x, y }))
        newlyAffected.forEach((key) => {
          enqueue(key, (c) => join(c, complement(newVal)))
        })
        affected = affected.union(newlyAffected)
      }
    })
  }

  return board
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

  const { cell, coords } = mapBoard((cell, coords) => ({ cell, coords }), board)
    .flatMap((row) => row)
    .filter(({ cell }) => cell.size > 1)
    .reduce((min, c) => (c.cell.size < min.cell.size ? c : min))
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
  for (let i = 0; i < Math.min(input.length, 81); i++) {
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

export {
  getBoard,
  propagate,
  search,
  easy,
  fromString,
  complement,
  sameSquare,
  range
}
