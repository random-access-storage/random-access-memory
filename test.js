var tape = require('tape')
var ram = require('./')

tape('write and read', function (t) {
  var file = ram()

  file.write(0, Buffer('hello'), function (err) {
    t.error(err, 'no error')
    file.read(0, 5, function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, Buffer('hello'))
      t.end()
    })
  })
})

tape('read empty', function (t) {
  var file = ram()

  file.read(0, 0, function (err, buf) {
    t.error(err, 'no error')
    t.same(buf, Buffer(0), 'empty buffer')
    t.end()
  })
})

tape('read range > file', function (t) {
  var file = ram()

  file.read(0, 5, function (err, buf) {
    t.ok(err, 'not satisfiable')
    t.end()
  })
})

tape('random access write and read', function (t) {
  var file = ram()

  file.write(10, Buffer('hi'), function (err) {
    t.error(err, 'no error')
    file.write(0, Buffer('hello'), function (err) {
      t.error(err, 'no error')
      file.read(10, 2, function (err, buf) {
        t.error(err, 'no error')
        t.same(buf, Buffer('hi'))
        file.read(0, 5, function (err, buf) {
          t.error(err, 'no error')
          t.same(buf, Buffer('hello'))
          file.read(5, 5, function (err, buf) {
            t.error(err, 'no error')
            t.same(buf, Buffer([0, 0, 0, 0, 0]))
            t.end()
          })
        })
      })
    })
  })
})

tape('buffer constructor', function (t) {
  var file = ram(Buffer('contents'))
  file.read(0, 7, function (err, buf) {
    t.error(err)
    t.deepEqual(buf, Buffer('content'))
    t.end()
  })
})
