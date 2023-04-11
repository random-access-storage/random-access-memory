# random-access-memory

Exposes the same interface as [random-access-file](https://github.com/mafintosh/random-access-file) but instead of writing/reading data to a file it maintains it in memory. This is useful when running tests where you don't want to write files to disk.

```
npm install random-access-memory
```

## Usage

``` js
const RAM = require('random-access-memory')
const file = new RAM()

file.write(0, Buffer.from('hello'), function () {
  file.write(5, Buffer.from(' world'), function () {
    file.read(0, 11, console.log) // returns Buffer(hello world)
  })
})
```

You can also initialize a `RAM` instance with a `Buffer`:

```js
const file = new RAM(Buffer.from('hello world'))
```

If you want to mimick a folder on disk, you can use `const createRAM = RAM.resuable()`.

This stores the created ram instances, ie `ram = createRAM(name)` in a map so they can be reopened
with the same state, similar to working with files, but still backed by ram.

## License

MIT
