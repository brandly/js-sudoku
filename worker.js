import { search } from './index.js'

// boards are arrays of Sets, which structured clone handles natively
onmessage = (e) => {
  postMessage(search(e.data))
}
