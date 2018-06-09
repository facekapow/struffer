import {
  BinaryValue,
  unsignedSplit,
  joinBits,
  ByteBit,
  MemberInfo,
  parseType,
} from './common';
import StrufferBase from './base';

/**
 * Struct + Buffer with support for members with arbitrary bit sizes
 *
 * Also works with Uint8Arrays
 *
 * @param strufferName The name of your struffer
 * @param structure The definition of your struffer. An array of `[type, name]` for each member.
 * @returns Your custom advanced struffer class
 */
export default function (strufferName: string, structure: [string, string][]) {
  const structInfo: Map<string, MemberInfo> = new Map();
  const memberOrder = structure.map(i => i[1]);
  let nextByte: number = 0;
  let nextBit: ByteBit = 0;

  for (const [type, name] of structure) {
    const typeInfo = parseType(type);
    const info: MemberInfo = {
      startByteOffset: nextByte,
      startBitOffset: nextBit,
      endByteOffset: nextByte,
      endBitOffset: nextBit,
      endianness: typeInfo.endianness,
      signature: typeInfo.signature,
      bitSize: typeInfo.bitSize,
    };

    let bitsLeft = info.bitSize;
    while (bitsLeft > 0) {
      const bitsLeftInCurrentByte = 8 - nextBit;
      if (bitsLeft < bitsLeftInCurrentByte) {
        nextBit = (nextBit + bitsLeft) as ByteBit; // we know it can only be 0...7
        info.endBitOffset = (nextBit - 1) as ByteBit;
        info.endByteOffset = nextByte;
        bitsLeft = 0;
      } else if (bitsLeft === bitsLeftInCurrentByte) {
        info.endBitOffset = 7;
        info.endByteOffset = nextByte;
        bitsLeft = 0;
        nextBit = 0;
        nextByte = nextByte + 1;
      } else /* (bitsLeft > bitsLeftInCurrentByte) */ {
        bitsLeft = bitsLeft - bitsLeftInCurrentByte;
        nextBit = 0;
        nextByte = nextByte + 1;
      }
    }

    structInfo.set(name, info);
  }

  const byteLength = (nextBit === 0) ? nextByte : nextByte + 1;
  const bitLength = ((byteLength - ((nextBit === 0) ? 0 : 1)) * 8) + nextBit;

  return class AdvancedStruffer extends StrufferBase {
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

      if (info.startByteOffset === info.endByteOffset) {
        const byteBits = unsignedSplit(this.buffer[info.startByteOffset + this.offset], 8);
        const myBits = byteBits.slice(info.startBitOffset, info.endBitOffset + 1);
        bits = myBits;
      } else {
        const startBits = unsignedSplit(this.buffer[info.startByteOffset + this.offset], 8);
        const myStartBits = startBits.slice(info.startBitOffset);
        bits = myStartBits;
        // "x - 1" because... well, here's an example:
        //     let startOffset = 3;
        //     let endOffset = 4;
        //     startOffset - endOffset = 1;
        // but there's no bytes in between. so minus 1.
        const bytesInBetween = info.endByteOffset - info.startByteOffset - 1;
        for (let i = 0; i < bytesInBetween; i++) {
          const byteOffset = info.startByteOffset + this.offset + i + 1;
          const byteBits = unsignedSplit(this.buffer[byteOffset], 8);
          bits = bits.concat(byteBits);
        }
        const endBits = unsignedSplit(this.buffer[info.endByteOffset + this.offset], 8);
        const myEndBits = endBits.slice(0, info.endBitOffset + 1);
        bits = bits.concat(myEndBits);
      }

      return bits;
    }
    setBits(name: string, _bits: BinaryValue[]) {
      const info = structInfo.get(name);
      if (!info) {
        throw new Error('Structure member not found!');
      }

      const bits = _bits.slice();

      if (info.startByteOffset === info.endByteOffset) {
        const byteBits = unsignedSplit(this.buffer[info.startByteOffset + this.offset], 8);
        let j = 0;
        for (let i = info.startBitOffset; i < info.endBitOffset + 1; i++) {
          byteBits[i] = bits[j];
          j++;
        }
        this.buffer[info.startByteOffset + this.offset] = joinBits(byteBits);
      } else {
        const startByteBits = unsignedSplit(this.buffer[info.startByteOffset + this.offset], 8);
        const startByteBitCount = 8 - info.startBitOffset;
        for (let i = 0; i < startByteBitCount; i++) {
          const bit = bits.shift() as BinaryValue;
          startByteBits[info.startBitOffset + i] = bit;
        }
        this.buffer[info.startByteOffset + this.offset] = joinBits(startByteBits);
        const bytesInBetween = info.endByteOffset - info.startByteOffset - 1;
        for (let i = 0; i < bytesInBetween; i++) {
          const byteOffset = info.startByteOffset + this.offset + i + 1;
          const byteBits = bits.splice(0, 8);
          this.buffer[byteOffset] = joinBits(byteBits);
        }
        const endByteBits = unsignedSplit(this.buffer[info.endByteOffset + this.offset], 8);
        const endByteBitCount = info.endBitOffset + 1;
        for (let i = 0; i < endByteBitCount; i++) {
          const bit = bits.shift() as BinaryValue;
          endByteBits[i] = bit;
        }
        this.buffer[info.endByteOffset + this.offset] = joinBits(endByteBits);
      }
    }
  };
}
