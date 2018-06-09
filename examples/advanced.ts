import { AdvancedStruffer } from '../src/index';

const MyAdvancedStruffer = AdvancedStruffer('MyAdvancedStruffer', [
  /*
   * advanced struffers allow for unrestricted member
   * sizes, from as small as a single bit to as big as
   * your computer's memory can handle. for sizes bigger
   * than 53, though, you might want to stick to `getBits`
   * and `setBits` (due to JS number precision limits).
   *
   * other than that, they're identical to plain ol' struffers
   */
  ['unsigned int3', 'foo'],
  ['int2', 'bar'],
  ['uint37 be', 'foobar'],
  ['i6be', 'something'],
  // you can also use regular multiples-of-eight sizes
  ['u16', 'myRegularUnsignedShort'],
  ['byte', 'myRegularSignedByte'],
]);

const myBuffer = Buffer.alloc(MyAdvancedStruffer.byteLength);
const struff = new MyAdvancedStruffer(myBuffer);

/*
 * refer to `simple.ts` for an example of usage
 * (both kinds of struffers implement that same API)
 */
