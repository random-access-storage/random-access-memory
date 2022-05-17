const RandomAccessStorage = require('random-access-storage')
const b4a = require('b4a')

const DEFAULT_PAGE_SIZE = 1024 * 1024

module.exports = class RandomAccessMemory extends RandomAccessStorage {
  constructor (opts = {}) {
    super()

    if (typeof opts === 'number') {
      opts = { length: opts }
    }

    if (b4a.isBuffer(opts)) {
      opts = { length: opts.byteLength, buffer: opts }
    }

    this.length = opts.length || 0
    this.pageSize = opts.length || opts.pageSize || DEFAULT_PAGE_SIZE
    this.buffers = []

    if (opts.buffer) this.buffers.push(opts.buffer)
  }

  _stat (req) {
    req.callback(null, { size: this.length })
  }

  _write (req) {
    let i = Math.floor(req.offset / this.pageSize)
    let rel = req.offset - i * this.pageSize
    let start = 0

    const len = req.offset + req.size
    if (len > this.length) this.length = len

    while (start < req.size) {
      const page = this._page(i++, true)
      const free = this.pageSize - rel
      const end = free < (req.size - start)
        ? start + free
        : req.size

      b4a.copy(req.data, page, rel, start, end)
      start = end
      rel = 0
    }

    req.callback(null, null)
  }

  _read (req) {
    let i = Math.floor(req.offset / this.pageSize)
    let rel = req.offset - i * this.pageSize
    let start = 0

    if (req.offset + req.size > this.length) {
      return req.callback(new Error('Could not satisfy length'), null)
    }

    const data = b4a.alloc(req.size)

    while (start < req.size) {
      const page = this._page(i++, false)
      const avail = this.pageSize - rel
      const wanted = req.size - start
      const len = avail < wanted ? avail : wanted

      if (page) b4a.copy(page, data, start, rel, rel + len)
      start += len
      rel = 0
    }

    req.callback(null, data)
  }

  _del (req) {
    let i = Math.floor(req.offset / this.pageSize)
    let rel = req.offset - i * this.pageSize
    let start = 0

    if (rel && req.offset + req.size >= this.length) {
      const buf = this.buffers[i]
      if (buf) buf.fill(0, rel)
    }

    if (req.offset + req.size > this.length) {
      req.size = Math.max(0, this.length - req.offset)
    }

    while (start < req.size) {
      if (rel === 0 && req.size - start >= this.pageSize) {
        this.buffers[i] = undefined
      }

      rel = 0
      i += 1
      start += this.pageSize - rel
    }

    if (req.offset + req.size >= this.length) {
      this.length = req.offset
    }

    req.callback(null, null)
  }

  _destroy (req) {
    this._buffers = []
    this.length = 0
    req.callback(null, null)
  }

  _page (i, upsert) {
    let page = this.buffers[i]
    if (page || !upsert) return page
    page = this.buffers[i] = b4a.alloc(this.pageSize)
    return page
  }

  toBuffer () {
    const buf = b4a.alloc(this.length)

    for (let i = 0; i < this.buffers.length; i++) {
      if (this.buffers[i]) b4a.copy(this.buffers[i], buf, i * this.pageSize)
    }

    return buf
  }

  clone () {
    const ram = new RandomAccessMemory()
    ram.length = this.length
    ram.pageSize = this.pageSize
    ram.buffers = this.buffers.map((buffer) => b4a.from(buffer))
    return ram
  }
}
