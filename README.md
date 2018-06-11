# Struffer
[![Travis CI Build Status](https://img.shields.io/travis/facekapow/struffer.svg?style=for-the-badge)](https://travis-ci.org/facekapow/struffer)
[![Coveralls.io Test Coverage Status](https://img.shields.io/coveralls/github/facekapow/struffer.svg?style=for-the-badge)](https://coveralls.io/github/facekapow/struffer)
[![Package version](https://img.shields.io/github/package-json/v/facekapow/struffer.svg?style=for-the-badge)](https://www.npmjs.com/package/struffer)

Struct + Buffer = Struffer
Also works with Uint8Arrays

Why? Because Buffers (and Uint8Arrays) are great, but manipulating data with them is highly 
unconfortable. Struffers overlay a structure definition (that you provide) to easily
interact with data in Buffers.

## Install
As simple as 1, 2, 3:

```bash
npm install --save struffer
```

## API
Struffers come in two flavors: normal and advanced. Both share the same exact API and are
almost identical. The only difference is normal struffers require members to be sized
in multiples of eight (8, 16, 32, etc.) while advanced struffers allow members to be
arbitrary bit sizes (3, 17, 22, etc.). Advanced struffers are recommended if you're looking
to cut down on size and know the exact limit of the values you'll be using. Normal struffers 
are recommended for pretty much everything else (since they enforce standard bit sizes).

:warning: Wait! :warning: If you're like me and learn best by reading through some code, head
on over to the [examples](examples/README.md). Otherwise, keep reading and enjoy.

All API examples here are done using normal struffers, but for advanced struffers, just replace
the `Struffer` factory with `AdvancedStruffer`.

By the way, the examples here are all based on previous ones. So if you're lost as to where a piece of
an example came from, look at examples before it.

```ts
// pick your poison
import Struffer, { AdvancedStruffer } from 'struffer';
```

### Template Creation
Defining a struffer layout is extremely simple and as similar as possible to defining a struct in C.
As mentioned before, normal struffers can only use sizes that are multiples of eight. Since examples
are done with normal struffers, we'll be following this limitation. Keep in mind, though, that advanced
struffers can use any bit size in place of sizes in these examples.

Templates (i.e. your custom struffer classes) can be created by calling the factory for your desired
struffer flavor (`Struffer` or `AdvancedStruffer`) with 2 arguments: the name for your template and
the layout definition.

The layout definition is an array of `[string, string]`. Each tuple represents one member. The first
string in each tuple is the member's type (more on that in a bit). The second string in
each tuple is the member's name.

Types are nearly identical to C types, but with a few improvements. First off, they can be upper- or
lowercase, it doesn't matter. They can be simple words like `int`, `uint`, `byte`, and `char`, or
they can be abbreviations like `i` and `u`. `uint` and `u` are special in that (if not overridden by
a `signed` modifier) they are `unsigned`. Types can also have a size manually specified by putting it
after the type name (e.g. `int_16`, `u64`, `char 80`, etc.).

Types can include modifiers at the before the type name like `signed`, `unsigned`, `short`, and `long`.
`signed` and `unsigned` modify the signature of the type (i.e. exactly what they do in C). But unlike
their C counterparts, `short` and `long` don't strictly set a type size. Instead, `short` divides the
type size by 2, and `long` multiplies it by 2. The number of times you specify them also matters. For
example, `int`s are 32 bits. Doing `long int` makes it 64 bits. Doing `long long int` makes it 128 bits.
The same applies to `short`s.

The last 2 modifiers available are endianness specifiers, and they go *after* the type name (and type
size, if included). They're `le` for little-endian and `be` for big-endian. Types are by default
little-endian.

Modifiers, type names, and type sizes can all be separated by any non-alphanumeric character. Thus,
`unsigned int 32` is the same as `unsigned_int_32`. Each separator can also be different from other
separators, so `unsigned int_32` works. However, note the careful wording: they *can* be separated by
such characters, but they don't *have* to. `unsignedint32`, while hardly readable, is perfectly valid.

Got all that? Yes? No? How about an example to help explain? Here you go:

```ts
const MyStruffer = Struffer('MyStruffer', [
  ['int', 'foo'],
  ['unsigned int', 'bar'],
  ['short uint be', 'foobar'], // same as `u16be`
  ['long long unsigned i16', 'some'], // same as `long uint` or `uint_64`
  ['byte_32', 'thing'], // same as `int`
  ['short long short int', 'something'], // same as `short int`
  ['int le', 'cool'], // same as `int`
  ['SIGNED U32 BE', 'WHY_AM_I_YELLING'], // same as `int be`
  // you probably get the gist by now
]);
```

Alright, well, that was lot, wasn't it? Don't worry, that was the hardest part. It's all downhill from
here.

### Static Template Properties
Templates have 2 useful static properties:
  * `byteLength` - The total length in bytes of your template. Will always be rounded up if your template
    contains a partial byte (only possible in advanced struffers)
  * `bitLength` - The total length in bits of your template
  
```ts
MyStruffer.byteLength === 256;
MyStruffer.bitLength === 2048;
```

### Template Instantiation
You can instantiate your template over a given `Buffer` or `Uint8Array` quite easily. Just pass in a
a `Buffer` or `Uint8Array` as your first argument, and if you need to, the offset where the structure
data should start. That's it.

```ts
const someBuffer = Buffer.alloc(MyStruffer.byteLength);
const struff = new MyStruffer(someBuffer);

// or you can offset it (say, for example, 8 bytes):
const someOtherBuffer = Buffer.alloc(MyStruffer.byteLength + 8);
const strufferWithAnOffset = new MyStruffer(someOtherBuffer, 8);
```

### Data Interaction
Once you have your template instance created, you can use in 3 different ways:
  * The Object API
  * The Map API
  * The Batch API

There is one thing to note, however, and it's common across all 3 APIs: "deleting" only clears the value
of the member(s) it's targeting (i.e. it sets it/them to 0).

#### Object API
Interact with your data as if it were located in a regular old JS object via the `structure` property on
struffers. There's pretty much nothing to explain here. Just pretend that your member names are property
names on the `structure` and interact with them as you would any other JS object. Here's an example:

```ts
// getting a member's value:
struff.structure.foobar;

// setting a member's value:
struff.structure.foobar = 1234;

// checking for a member's presence/existence:
'foobar' in struff.structure;

// "deleting" a member:
delete struff.structure.foobar;

// enumerating members:
Object.keys(struff.structure);

// works with computed keys, too
```

By the way, all this trickery is enabled by ES6 Proxies. (standards ftw!)

#### Map API
Allows you to interact with your data through Map methods like `get`, `set`, `has`, and more. In fact,
each and every struffer `implements Map<string, number>`. Thus, you can use the full Map API with struffers.

```ts
// getting a member's value:
struff.get('foobar');

// setting a member's value:
struff.set('foobar', 1234);

// checking for member's presence/existence:
struff.has('foobar');

// "deleting" a member:
struff.delete('foobar');

// enumerating members:
struff.keys();

// you can also use all other Map methods and properties:
struff.size; // number of members in the struffer
struff.clear(); // "deletes" all members (i.e. sets all members to 0)
struff.entries(); // Iterator that yields tuples of `[name: string, value: number]` for each member
struff.forEach((value: number, key: string, map: MyStruffer) => undefined, optionalThisArgHere);
struff.values(); // Iterator that yields the numerical value of each member
struff[Symbol.iterator](); // same as `struff.entries()`; automatically called when doing the following:
for (const [name, value] of struff) { /* ... */ }
```

#### Batch API
Allows you to interact with multiple members at once. This API is mainly provided for user convenience,
since it's actually just a simple layer over the Map API.

```ts
// get member values:
const { foo, bar, foobar } = struff.getMany(['foo', 'bar', 'foobar']);

// set member values:
struff.setMany({
  foo: -123456,
  bar: 123456,
  foobar: 1234,
});

// check for the presence/existence of multiple members:
const { foo: fooPresent, bar: barPresent, foobar: foobarPresent } = struff.hasMany(['foo', 'bar', 'foobar']);

// "delete" members:
struff.deleteMany(['foo', 'bar', 'foobar']);
```

### String representations
Struffers come with some useful default string representations, through `toString()`, `[Symbol.toPrimitive]()`,
and `[util.inspect.custom]()`.

```ts
struff.toString(); // manual `toString()` call
`my struff: ${struff}`; // calls `[Symbol.toPrimitive]('default')`
struff + 'foobar'; // calls `[Symbol.toPrimitive]('string')`
console.log(struff); // calls `[util.inspect.custom]()` in Node.js
```

The repesentation looks a little something like this (though your values may vary):

```
Struffer<MyStruffer> {
  foo: i32 = 0;
  bar: u32 = 0;
  foobar: u16be = 0;
  some: u64 = 0;
  thing: i32 = 0;
  something: i16 = 0;
  cool: i32 = 0;
  WHY_AM_I_YELLING: i32be = 0;
}
```

### Miscellaneous methods
Some documentation for random methods that didn't really fit in any other section.

#### `getBits(name: string): BinaryValue[]`
Gets the individual bits of the given member. NOTE: while this may (and probably will and should) change
in a future version, the order of the returned bits is platform dependent and should be handled accordingly.

```ts
struff.structure.foobar = 123456;
const bits = struff.getBits('foobar');
/**
 * `bits` should be [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]
 * on little-endian systems (reverse this for big-endian systems)
 */
```

#### `setBits(name: string, bits: BinaryValue[])`
Sets the individual bits of the given member. NOTE: see `getBits` above.

```ts
// reverse this array for big-endian systems
struff.setBits('foobar', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
// struff.structure.foobar should now be 123456
```

#### `bits()`
Like `values()`, but yields bit arrays instead of numerical values. If you want bits along with member
names see `bitEntries()`.

```ts
for (const bitArray of struff.bits()) {
  // ...
}
```

#### `bitEntries()`
Like `entries()`, but yields bit arrays instead of numerical values.

```ts
for (const [name, bits] of struff.bitEntries()) {
  // ...
}
```
