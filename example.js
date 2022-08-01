const RAM = require('.')

const mem = new RAM()

mem.write(0, Buffer.from('hello world'), function () {
  mem.read(0, 11, (_, data) => console.log(data.toString()))
})
