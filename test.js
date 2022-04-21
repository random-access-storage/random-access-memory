const tape = require('tape')
const ram = require('./')

tape('write and read', function (t) {
  const file = ram()

  file.write(0, Buffer.from('hello'), function (err) {
    t.error(err, 'no error')
    file.read(0, 5, function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, Buffer.from('hello'))
      t.end()
    })
  })
})

tape('read empty', function (t) {
  const file = ram()

  file.read(0, 0, function (err, buf) {
    t.error(err, 'no error')
    t.same(buf, Buffer.alloc(0), 'empty buffer')
    t.end()
  })
})

tape('read range > file', function (t) {
  const file = ram()

  file.read(0, 5, function (err, buf) {
    t.ok(err, 'not satisfiable')
    t.end()
  })
})

tape('random access write and read', function (t) {
  const file = ram()

  file.write(10, Buffer.from('hi'), function (err) {
    t.error(err, 'no error')
    file.write(0, Buffer.from('hello'), function (err) {
      t.error(err, 'no error')
      file.read(10, 2, function (err, buf) {
        t.error(err, 'no error')
        t.same(buf, Buffer.from('hi'))
        file.read(0, 5, function (err, buf) {
          t.error(err, 'no error')
          t.same(buf, Buffer.from('hello'))
          file.read(5, 5, function (err, buf) {
            t.error(err, 'no error')
            t.same(buf, Buffer.from([0, 0, 0, 0, 0]))
            t.end()
          })
        })
      })
    })
  })
})

tape('buffer constructor', function (t) {
  const file = ram(Buffer.from('contents'))

  file.read(0, 7, function (err, buf) {
    t.error(err)
    t.deepEqual(buf, Buffer.from('content'))
    t.end()
  })
})

tape('not sync', function (t) {
  const file = ram()
  let sync = true
  file.write(10, Buffer.from('hi'), function () {
    t.notOk(sync)
    sync = true
    file.write(0, Buffer.from('hello'), function () {
      t.notOk(sync)
      sync = true
      file.read(10, 2, function () {
        t.notOk(sync)
        t.end()
      })
      sync = false
    })
    sync = false
  })
  sync = false
})

tape('delete', function (t) {
  const pageSize = 1024
  const file = ram({ pageSize })

  // identify bug in deletion when file.length > 2 * page size
  const orig = Buffer.alloc(pageSize * 3, 0xff)
  const expected = Buffer.alloc(10, 0xff)

  file.write(0, orig, function (err) {
    t.error(err, 'no error')
    file.read(0, file.length, function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, orig)
      file.del(10, Infinity, function (err) {
        t.error(err, 'no error')
        file.read(0, file.length, function (err, buf) {
          t.error(err, 'no error')
          t.same(buf, expected)
          t.end()
        })
      })
    })
  })
})

tape('clone', function (t) {
  const file = ram()

  file.write(0, Buffer.from('hello'), function (err) {
    t.error(err, 'no error')
    const file2 = file.clone()
    file.write(0, Buffer.from('world'), function (err) {
      t.error(err, 'no error')
      file2.read(0, 5, function (err, buf) {
        t.error(err, 'no error')
        t.same(buf, Buffer.from('hello'))
        t.end()
      })
    })
  })
})
