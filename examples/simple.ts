import Struffer from '../src/index';

const MyStruffer = Struffer('MyStruffer', [
  /*
   * wide variety of ways to define a type.
   * (even modifiers like `unsigned`, `signed`, `short`, and `long`)
   * case doesn't matter, btw
   */
  ['unsigned int', 'foo'],
  ['short int', 'bar'],
  ['byte', 'foobar'],
  ['uint', 'quux'],
  ['int_16', 'some'],
  ['u8', 'thing'],
  ['uint32 BE', 'something'],
  ['i16be', 'coolness'],
]);

const myBuffer = Buffer.alloc(MyStruffer.byteLength);
const struff = new MyStruffer(myBuffer);

/*
 * you can access your struffer like a regular JS
 * object (including `in` and `delete`) via `structure`
 * (just some good ol' Proxy goodness!)
 */
struff.structure.foo = 123456;
if ('coolness' in struff.structure) {
  console.log('alrighty, we have some coolness!');
}
const myFooValue = struff.structure.foo;
console.log(`my foo's value: ${myFooValue}`);

/*
 * or you can use it like a Map
 * (in fact, all struffers have `implements Map<string, number>`)
 */
struff.set('bar', -1234);
if (struff.has('quux')) {
  console.log('what\'s a quux?');
}
const myBarValue = struff.get('bar');
console.log(`my bar's value: ${myBarValue}`);

/*
 * there's also some batch methods provided
 * for convenience
 */
struff.setMany({
  some: -12346,
  thing: 255,
  something: 2091,
});
if (struff.hasMany(['foo', 'quux', 'bar', 'foobar'])) {
  console.log('cool, we have a bunch of stuff.');
}
const manyValues = struff.getMany(['something', 'coolness', 'foobar', 'bar']);
console.log(`look, a ton of stuff: ${JSON.stringify(manyValues, null, 2)}`);

/*
 * struffers also come with some nifty automatic string
 * representation abilities
 */
console.log('supports toString():', struff.toString());
console.log('and node\'s util.format/util.inspect:', struff);
console.log(`*and* interpolation: ${struff}`);
