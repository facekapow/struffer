import { endianness } from 'os';

export type BinaryValue = 0 | 1;
export type ByteBit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export enum MemberEndianness {
  LittleEndian,
  BigEndian,
}
export enum MemberSignature {
  Signed,
  Unsigned,
}

export interface MemberDictionary {
  [x: string]: number | undefined;
}
export interface MemberPresenceTable {
  [x: string]: boolean;
}
export interface MemberInfo {
  /**
   * The byte where the member starts.
   * Relative to the buffer.
   */
  startByteOffset: number;
  /**
   * The bit where the member starts.
   * Relative to the starting byte.
   */
  startBitOffset: ByteBit;
  /**
   * The byte where the member ends.
   * Relative to the buffer.
   * Inclusive.
   */
  endByteOffset: number;
  /**
   * The bit where the member ends.
   * Relative to the ending byte.
   * Inclusive.
   */
  endBitOffset: ByteBit;
  /**
   * The endianness of the member (i.e. whether it's big or little endian)
   */
  endianness: MemberEndianness;
  /**
   * The signature of the member (i.e. whether it's signed or unsigned)
   */
  signature: MemberSignature;
  /**
   * The size of the member in bits
   */
  bitSize: number;
}
export interface TypeInfo {
  endianness: MemberEndianness;
  signature: MemberSignature;
  bitSize: number;
}

export function totalBits(num: number): number {
  return num.toString(2).length;
}

export function splitIntoBits(num: number, includeSign = false): BinaryValue[] {
  const bitCount = totalBits(num);
  let res: BinaryValue[] = [];
  if (num < 0) {
    /*
     * two's complement is how to represent negatives
     * in binary. the following is true:
     *     -x = tc(x)
     *     x = tc(-x)
     * normally two's complement is:
     *     tc(x) = ~x + 1
     * but two's complement also works oppositely.
     * i.e. the following yields the same results:
     *     tc(x) = ~(x - 1)
     * so we'll use the second method since it's easier
     * for us here. first, invert the number (e.g. -5 -> 5).
     * then, subtract 1 (e.g. 5 -> 4). next, split it
     * into bits (e.g. 4 -> [1, 0, 0]). finally, invert the
     * bits (e.g. [1, 0, 0] -> [0, 1, 1]).
     */
    res = splitIntoBits((num * -1) - 1, false).map(i => (i === 0) ? 1 : 0);
    if (includeSign) {
      res.unshift(1);
    }
  } else {
    for (let i = 0; i < bitCount; i++) {
      res.unshift((num & (1 << i)) ? 1 : 0);
    }
    if (includeSign) {
      res.unshift(0);
    }
  }
  return res;
}

export function unsignedSplit(n: number, bitCount = totalBits(n)): BinaryValue[] {
  const bits: BinaryValue[] = [];
  for (let i = 0; i < bitCount; i++) {
    bits.unshift((n & (1 << i)) ? 1 : 0);
  }
  return bits;
}

export function joinBits(bits: BinaryValue[]): number {
  let res = 0;

  let j = bits.length - 1;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) res |= 1 << j;
    j--;
  }

  return res;
}

export function joinSignedBits(_bits: BinaryValue[]): number {
  let bits = _bits;
  /*
   * sign bit is always MSB (most significant bit)
   * thus, first bit on LE, last bit on BE
   */
  // we tell istanbul to ignore the tenary because endianness is hardware dependent
  /* istanbul ignore next */
  const negative = !!((endianness() === 'LE') ? bits.shift() : bits.pop());
  let res = 0;

  if (negative) {
    bits = bits.map(i => (i === 0) ? 1 : 0);
  }

  let j = bits.length - 1;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) res |= 1 << j;
    j--;
  }

  if (negative) {
    res = (res + 1) * -1;
  }

  return res;
}

export function parseType(_type: string): TypeInfo {
  let type = _type.toLowerCase();
  const { BigEndian, LittleEndian } = MemberEndianness;
  const { Signed, Unsigned } = MemberSignature;
  const info: TypeInfo = {
    endianness: LittleEndian,
    signature: Signed,
    bitSize: 0,
  };
  const unwantedCharacter = /[^A-Za-z0-9]/;
  const numberCharacter = /[0-9]/;

  let signModifierFound = false;
  let lookingForModifiers = true;

  let shortsFound = 0;
  let longsFound = 0;

  const removeUnwantedCharacters = () => {
    while (unwantedCharacter.test(type[0])) type = type.slice(1);
  };
  const remove = (len: number): void => { type = type.slice(len); };
  const is = (str: string) => type.startsWith(str);

  while (lookingForModifiers) {
    removeUnwantedCharacters();
    if (is('unsigned')) {
      if (!signModifierFound) {
        signModifierFound = true;
        info.signature = Unsigned;
      }
      remove(8);
      continue;
    }
    if (is('signed')) {
      if (!signModifierFound) {
        signModifierFound = true;
        info.signature = Signed;
      }
      remove(6);
      continue;
    }
    if (is('short')) {
      shortsFound++;
      remove(5);
      continue;
    }
    if (is('long')) {
      longsFound++;
      remove(4);
      continue;
    }
    lookingForModifiers = false;
  }

  removeUnwantedCharacters();

  if (is('int')) {
    info.bitSize = 32;
    remove(3);
  } else if (is('uint')) {
    if (!signModifierFound) info.signature = Unsigned;
    info.bitSize = 32;
    remove(4);
  } else if (is('i')) {
    info.bitSize = 32;
    remove(1);
  } else if (is('u')) {
    if (!signModifierFound) info.signature = Unsigned;
    info.bitSize = 32;
    remove(1);
  } else if (is('byte') || is('char')) {
    info.bitSize = 8;
    remove(4);
  }

  removeUnwantedCharacters();

  let sizePart = '';
  while (numberCharacter.test(type[0])) {
    sizePart += type[0];
    type = type.slice(1).trim();
  }
  if (sizePart !== '') {
    info.bitSize = Number(sizePart);
  }

  if (type.startsWith('be')) {
    info.endianness = BigEndian;
  }

  const divide = (longsFound > shortsFound) ? false : true;
  const times = (divide) ? (shortsFound - longsFound) : (longsFound - shortsFound);
  for (let i = 0; i < times; i++) {
    if (divide) {
      info.bitSize = info.bitSize / 2;
    } else {
      info.bitSize = info.bitSize * 2;
    }
  }

  return info;
}
