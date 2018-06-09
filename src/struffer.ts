import {
  BinaryValue,
  unsignedSplit,
  joinBits,
  MemberInfo,
  parseType,
} from './common';
import StrufferBase from './base';

/**
 * Struct + Buffer
 *
 * Also works with Uint8Arrays
 * @param strufferName The name of your struffer
 * @param structure The definition of your struffer. An array of `[type, name]` for each member.
 * @returns Your custom struffer class
 */
export default function (strufferName: string, structure: [string, string][]) {
  const structInfo: Map<string, MemberInfo> = new Map();
  const memberOrder = structure.map(i => i[1]);
  let nextByte = 0;

  for (const [type, name] of structure) {
    const typeInfo = parseType(type);
    const info: MemberInfo = {
      startByteOffset: nextByte,
      startBitOffset: 0,
      endByteOffset: nextByte,
      endBitOffset: 7,
      endianness: typeInfo.endianness,
      signature: typeInfo.signature,
      bitSize: typeInfo.bitSize,
    };

    if (info.bitSize % 8 !== 0) {
      // tslint:disable-next-line:max-line-length
      throw new Error('Struffers only support bit sizes that are multiples of eight. For arbitrary bit sizes, use AdvancedStruffers instead.');
    }

    const byteSize = info.bitSize / 8;

    info.endByteOffset = nextByte + (byteSize - 1);
    nextByte = info.endByteOffset + 1;

    structInfo.set(name, info);
  }

  const byteLength = nextByte;
  const bitLength = byteLength * 8;

  return class Struffer extends StrufferBase {
    get kind(): string {
      return strufferName;
    }
    protected get info(): Map<string, MemberInfo> {
      return structInfo;
    }
    protected get order(): string[] {
      return memberOrder;
    }
    static get byteLength(): number {
      return byteLength;
    }
    static get bitLength(): number {
      return bitLength;
    }

    getBits(name: string): BinaryValue[] {
      const info = structInfo.get(name);
      if (!info) {
        throw new Error('Structure member not found!');
      }
      let bits: BinaryValue[] = [];

      const byteLength = info.bitSize / 8;

      for (let i = 0; i < byteLength; i++) {
        bits = bits.concat(unsignedSplit(this.buffer[info.startByteOffset + this.offset + i], 8));
      }

      return bits;
    }
    setBits(name: string, _bits: BinaryValue[]) {
      const info = structInfo.get(name);
      if (!info) {
        throw new Error('Structure member not found!');
      }

      const bits = _bits.slice();
      let i = 0;
      while (bits.length > 0) {
        const chunk = bits.splice(0, 8);
        this.buffer[info.startByteOffset + this.offset + i] = joinBits(chunk);
        i++;
      }
    }
  };
}
