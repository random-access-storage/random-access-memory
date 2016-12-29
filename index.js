var inherits = require('inherits')
var AbstractRandomAccess = require('abstract-random-access')

module.exports = RandomAccessMemory

var pool = {}

function RandomAccessMemory (buf) {
  if (!(this instanceof RandomAccessMemory)) {
    if (typeof buf === 'string' && buf in pool) return pool[buf]
    return new RandomAccessMemory(buf)
  }
  AbstractRandomAccess.call(this)
  this.buffer = (buf && Buffer.isBuffer(buf)) ? buf : new Buffer(0)
  this.length = this.buffer.length
  if (typeof buf === 'string') pool[buf] = this
}

inherits(RandomAccessMemory, AbstractRandomAccess)

RandomAccessMemory.prototype._write = function (offset, data, cb) {
  if (offset + data.length > this.buffer.length) {
    var newBuf = Buffer(offset + data.length)
    newBuf.fill(0)
    this.buffer.copy(newBuf)
    this.buffer = newBuf
    this.length = this.buffer.length
  }

  data.copy(this.buffer, offset)
  cb(null)
}

RandomAccessMemory.prototype._read = function (offset, length, cb) {
  if (offset + length > this.buffer.length) return cb(new Error('Could not satisfy length'))
  cb(null, this.buffer.slice(offset, offset + length))
}

RandomAccessMemory.prototype.unlink = function (cb) {
  this.buffer = new Buffer(0)
  this.length = 0
  if (cb) cb(null)
}
