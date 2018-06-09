import { Test, TestCase, TestFixture, Expect } from 'alsatian';
import {
  splitIntoBits,
  unsignedSplit,
  BinaryValue,
  totalBits,
  joinBits,
  joinSignedBits,
  MemberSignature,
  MemberEndianness,
  parseType,
} from '../src/common';

@TestFixture('totalBits tests')
export class TotalBitsTests {
  @TestCase(2, 2)
  @TestCase(-1, 2)
  @TestCase(32, 6)
  @TestCase(255, 8)
  @TestCase(-127, 8)
  @Test('Default')
  default(num: number, bitCount: number) {
    Expect(totalBits(num)).toBe(bitCount);
  }
}

@TestFixture('splitIntoBits tests')
export class SplitIntoBitsTests {
  @TestCase(1, [1])
  @TestCase(32, [1, 0, 0, 0, 0, 0])
  @TestCase(-1, [1])
  @TestCase(-23, [0, 1, 0, 0, 1])
  @Test('Unsigned integer split')
  unsignedSplit(num: number, bits: BinaryValue[]) {
    Expect(splitIntoBits(num)).toEqual(bits);
    Expect(splitIntoBits(num, false)).toEqual(bits);
  }

  @TestCase(1, [0, 1])
  @TestCase(32, [0, 1, 0, 0, 0, 0, 0])
  @TestCase(-1, [1, 1])
  @TestCase(-23, [1, 0, 1, 0, 0, 1])
  @Test('Signed integer split')
  signedSplit(num: number, bits: BinaryValue[]) {
    Expect(splitIntoBits(num, true)).toEqual(bits);
  }
}

@TestFixture('unsignedSplit tests')
export class UnsignedSplitTests {
  @TestCase(3, [1, 1])
  @TestCase(6, [0, 0, 1, 1, 0], 5)
  @Test('Default')
  default(num: number, bits: BinaryValue[], bitCount?: number) {
    Expect(unsignedSplit(num, (bitCount !== undefined) ? bitCount : undefined)).toEqual(bits);
  }
}

@TestFixture('joinBits tests')
export class JoinBitsTests {
  @TestCase([1, 1], 3)
  @TestCase([1, 0, 1, 0], 10)
  @Test('Default')
  default(bits: BinaryValue[], num: number) {
    Expect(joinBits(bits)).toBe(num);
  }
}

@TestFixture('joinSignedBits tests')
export class JoinSignedBitsTests {
  @TestCase([0, 1, 1], 3)
  @TestCase([0, 1, 0, 1, 0], 10)
  @TestCase([1, 0, 1], -3)
  @TestCase([1, 0, 1, 1, 0], -10)
  @Test('Default')
  default(bits: BinaryValue[], num: number) {
    Expect(joinSignedBits(bits)).toBe(num);
  }
}

const type = {
  LittleEndian: MemberEndianness.LittleEndian,
  BigEndian: MemberEndianness.BigEndian,
  Signed: MemberSignature.Signed,
  Unsigned: MemberSignature.Unsigned,
};
@TestFixture('parseType tests')
export class ParseTypeTests {
  @TestCase('byte', 8, type.Signed, type.LittleEndian)
  @TestCase('unsigned byte', 8, type.Unsigned, type.LittleEndian)
  @TestCase('signed unsigned signed unsigned byte', 8, type.Signed, type.LittleEndian)
  @TestCase('long short short short long int', 16, type.Signed, type.LittleEndian)
  @TestCase('int_23be', 23, type.Signed, type.BigEndian)
  @TestCase('uint2', 2, type.Unsigned, type.LittleEndian)
  @TestCase('u8 BE', 8, type.Unsigned, type.BigEndian)
  @TestCase('i3', 3, type.Signed, type.LittleEndian)
  @TestCase('long char_be', 16, type.Signed, type.BigEndian)
  @Test('Default')
  default(type: string, bitSize: number, signature: MemberSignature, endianness: MemberEndianness) {
    const info = parseType(type);
    Expect(info.bitSize).toBe(bitSize);
    Expect(info.signature).toBe(signature);
    Expect(info.endianness).toBe(endianness);
  }
}
