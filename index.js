var events = require('events')
var inherits = require('inherits')

module.exports = RandomAccessMemory

function RandomAccessMemory () {
  if (!(this instanceof RandomAccessMemory)) return new RandomAccessMemory()
  events.EventEmitter.call(this)
  this.buffer = Buffer(0)
  this.opened = true
  this.length = 0
}

inherits(RandomAccessMemory, events.EventEmitter)

RandomAccessMemory.prototype.open = function (cb) {
  cb()
}

RandomAccessMemory.prototype.write = function (offset, data, cb) {
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

RandomAccessMemory.prototype.read = function (offset, length, cb) {
  if (!this.buffer) return cb(new Error('Instance is closed'))
  if (offset + length > this.buffer.length) return cb(new Error('Could not satisfy length'))
  cb(null, this.buffer.slice(offset, offset + length))
}

RandomAccessMemory.prototype.close = function (cb) {
  this.emit('close')
  cb(null)
}
