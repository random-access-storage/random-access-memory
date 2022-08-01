const test = require('brittle')
const RAM = require('.')

test('write and read', function (t) {
  t.plan(3)

  const file = new RAM()

  file.write(0, Buffer.from('hello'), function (err) {
    t.absent(err, 'no error')
    file.read(0, 5, function (err, buf) {
      t.absent(err, 'no error')
      t.alike(buf, Buffer.from('hello'))
    })
  })
})

test('read empty', function (t) {
  t.plan(2)

  const file = new RAM()

  file.read(0, 0, function (err, buf) {
    t.absent(err, 'no error')
    t.alike(buf, Buffer.alloc(0), 'empty buffer')
  })
})

test('read range > file', function (t) {
  t.plan(1)

  const file = new RAM()

  file.read(0, 5, function (err, buf) {
    t.ok(err, 'not satisfiable')
  })
})

test('random access write and read', function (t) {
  t.plan(8)

  const file = new RAM()

  file.write(10, Buffer.from('hi'), function (err) {
    t.absent(err, 'no error')
    file.write(0, Buffer.from('hello'), function (err) {
      t.absent(err, 'no error')
      file.read(10, 2, function (err, buf) {
        t.absent(err, 'no error')
        t.alike(buf, Buffer.from('hi'))
        file.read(0, 5, function (err, buf) {
          t.absent(err, 'no error')
          t.alike(buf, Buffer.from('hello'))
          file.read(5, 5, function (err, buf) {
            t.absent(err, 'no error')
            t.alike(buf, Buffer.from([0, 0, 0, 0, 0]))
          })
        })
      })
    })
  })
})

test('buffer constructor', function (t) {
  t.plan(2)

  const file = new RAM(Buffer.from('contents'))

  file.read(0, 7, function (err, buf) {
    t.absent(err)
    t.alike(buf, Buffer.from('content'))
  })
})

test('not sync', function (t) {
  t.plan(3)

  const file = new RAM()
  let sync = true

  file.write(10, Buffer.from('hi'), function () {
    t.absent(sync)
    sync = true
    file.write(0, Buffer.from('hello'), function () {
      t.absent(sync)
      sync = true
      file.read(10, 2, function () {
        t.absent(sync)
      })
      sync = false
    })
    sync = false
  })
  sync = false
})

test('delete', function (t) {
  t.plan(6)

  const pageSize = 1024
  const file = new RAM({ pageSize })

  // identify bug in deletion when file.length > 2 * page size
  const orig = Buffer.alloc(pageSize * 3, 0xff)
  const expected = Buffer.alloc(10, 0xff)

  file.write(0, orig, function (err) {
    t.absent(err, 'no error')
    file.read(0, file.length, function (err, buf) {
      t.absent(err, 'no error')
      t.alike(buf, orig)
      file.del(10, Infinity, function (err) {
        t.absent(err, 'no error')
        file.read(0, file.length, function (err, buf) {
          t.absent(err, 'no error')
          t.alike(buf, expected)
        })
      })
    })
  })
})

test('clone', function (t) {
  t.plan(4)

  const file = new RAM()

  file.write(0, Buffer.from('hello'), function (err) {
    t.absent(err, 'no error')
    const file2 = file.clone()
    file.write(0, Buffer.from('world'), function (err) {
      t.absent(err, 'no error')
      file2.read(0, 5, function (err, buf) {
        t.absent(err, 'no error')
        t.alike(buf, Buffer.from('hello'))
      })
    })
  })
})
