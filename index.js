var inherits = require('inherits')
var AbstractRandomAccess = require('abstract-random-access')

module.exports = RandomAccessMemory

function RandomAccessMemory (buf) {
  if (!(this instanceof RandomAccessMemory)) return new RandomAccessMemory(buf)
  AbstractRandomAccess.call(this)
  this.buffer = buf || Buffer(0)
  this.length = this.buffer.length
}

inherits(RandomAccessMemory, AbstractRandomAccess)

RandomAccessMemory.prototype._write = function (offset, data, cb) {
  if (!this.buffer) return cb(new Error('Instance is closed'))

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
  if (!this.buffer) return cb(new Error('Instance is closed'))
  if (offset + length > this.buffer.length) return cb(new Error('Could not satisfy length'))
  cb(null, this.buffer.slice(offset, offset + length))
}
