import { endianness } from 'os';
import { inspect } from 'util';
import {
  BinaryValue,
  MemberDictionary,
  MemberPresenceTable,
  splitIntoBits,
  joinBits,
  joinSignedBits,
  MemberEndianness,
  MemberSignature,
  MemberInfo,
} from './common';

export default class StrufferBase implements Map<string, number> {
  /* our own original properties */
  buffer: Buffer | Uint8Array;
  structure: MemberDictionary;
  offset: number;

  /*
   * properties to be overridden by derrived classes.
   * we ignore them in code coverage because they're
   * never suppossed to be reached. derrived classes
   * MUST override them.
   */
  /* istanbul ignore next */
  get kind(): string {
    return 'null';
  }
  /* istanbul ignore next */
  protected get info(): Map<string, MemberInfo> {
    return new Map<string, MemberInfo>();
  }
  /* istanbul ignore next */
  protected get order(): string[] {
    return [];
  }
  /* istanbul ignore next */
  static get byteLength(): number {
    return 0;
  }
  /* istanbul ignore next */
  static get bitLength(): number {
    return 0;
  }

  /* map-like properties */
  get size(): number {
    return this.order.length;
  }
  get [Symbol.toStringTag](): 'Map' {
    // `as 'Map'` to be compatible with Maps (in typescript's view)
    return `${this.constructor.name}<${this.kind}>` as 'Map';
  }

  constructor(buf: Buffer | Uint8Array, offset: number = 0) {
    this.buffer = buf;
    this.structure = new Proxy(Object.create(null), {
      get: (self, _prop, recv) => {
        const prop = String(_prop);
        if (this.has(prop)) {
          return this.get(prop);
        }
        return undefined;
      },
      set: (self, _prop, val, recv) => {
        const prop = String(_prop);
        if (this.has(prop)) {
          this.set(prop, val);
          return true;
        }
        return false;
      },
      has: (self, _prop) => {
        const prop = String(_prop);
        if (this.has(prop)) {
          return true;
        }
        return false;
      },
      deleteProperty: (self, _prop) => {
        const prop = String(_prop);
        if (this.has(prop)) {
          return this.delete(prop);
        }
        return false;
      },
      ownKeys: (self) => {
        return [...this.keys()];
      },
      getOwnPropertyDescriptor: (self, _prop) => {
        const prop = String(_prop);
        if (this.has(prop)) {
          return {
            configurable: true,
            enumerable: true,
            writable: true,
          };
        }
        return undefined;
      },
    });
    this.offset = offset;
  }

  /*
   * method stubs
   * same reason for ignoring as the overriden properties
   */
  /* istanbul ignore next */
  getBits(name: string): BinaryValue[] {
    return [];
  }
  /* istanbul ignore next */
  setBits(name: string, bits: BinaryValue[]) {
    return;
  }

  /* map-like methods we care about */
  get(name: string): number | undefined {
    const info = this.info.get(name);
    if (!info) {
      return undefined;
    }
    const bits = this.getBits(name);
    /*
     * this condition is hardware dependent, so it's nearly impossible
     * to test properly for. let's tell istanbul to ignore it
     */
    /* istanbul ignore next: hardware dependent check */
    if (endianness() === 'LE') {
      if (info.endianness === MemberEndianness.BigEndian) {
        bits.reverse();
      }
    } else /* (endianness() === 'BE') */ {
      if (info.endianness === MemberEndianness.LittleEndian) {
        bits.reverse();
      }
    }
    if (info.signature === MemberSignature.Signed) {
      return joinSignedBits(bits);
    }
    return joinBits(bits);
  }
  set(name: string, value: number) {
    const info = this.info.get(name);
    if (!info) {
      throw new Error('Structure member not found!');
    }
    let bits = splitIntoBits(value, false);
    // same reason as the endianness check in `get`
    /* istanbul ignore next: hardware dependent check */
    if (endianness() === 'LE') {
      bits = bits.join('')
                 .padStart(info.bitSize, (value < 0) ? '1' : '0')
                 .split('')
                 .map(i => (i === '0') ? 0 : 1);
      if (info.endianness === MemberEndianness.BigEndian) {
        bits.reverse();
      }
    } else /* (endianness() === 'BE') */ {
      bits = bits.join('')
                 .padEnd(info.bitSize, (value < 0) ? '1' : '0')
                 .split('')
                 .map(i => (i === '0') ? 0 : 1);
      if (info.endianness === MemberEndianness.LittleEndian) {
        bits.reverse();
      }
    }
    this.setBits(name, bits);
    return this;
  }
  has(name: string): boolean {
    return this.info.has(name);
  }

  /* map-like methods we don't care about (i.e. only implemented for compatability) */
  delete(name: string): boolean {
    if (this.has(name)) {
      this.set(name, 0);
      return true;
    }
    return false;
  }
  clear() {
    this.deleteMany(this.order.slice());
  }
  forEach(cb: (value: number, key: string, map: this) => void, thisArg?: any) {
    for (const member of this.order) {
      // override strict undefined check here, we know it exists
      const value = this.get(member) as number;
      if (thisArg !== undefined) {
        cb.call(thisArg, value, member, this);
      } else {
        cb(value, member, this);
      }
    }
  }

  /* batch methods for convenience */
  getMany(members: string[] = this.order.slice()): MemberDictionary {
    const dict: MemberDictionary = {};
    for (const member of members) {
      dict[member] = this.get(member);
    }
    return dict;
  }
  setMany(dictionary: MemberDictionary) {
    for (const member of Object.keys(dictionary)) {
      // override strict undefined check here, we know it exists
      this.set(member, dictionary[member] as number);
    }
  }
  hasMany(members: string[]): MemberPresenceTable {
    const table: MemberPresenceTable = {};
    for (const member of members) {
      table[member] = this.has(member);
    }
    return table;
  }
  deleteMany(members: string[]): boolean {
    let result: boolean = true;
    for (const member of members) {
      const tmp = this.delete(member);
      if (result) result = tmp;
    }
    return result;
  }

  /* iterators */
  *keys() {
    /*
     * it would be easier to use `Array.prototype.values` here,
     * but for some reason, Node doesn't have it!
     */
    for (const member of this.order) {
      yield member;
    }
  }
  *values() {
    for (const member of this.order) {
      // override strict undefined check here, we know it exists
      yield this.get(member) as number;
    }
  }
  *entries() {
    for (const member of this.order) {
      // same here
      yield [member, this.get(member) as number] as [string, number];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  *bits() {
    for (const member of this.order) {
      yield this.getBits(member);
    }
  }
  *bitEntries() {
    for (const member of this.order) {
      yield [member, this.getBits(member)] as [string, BinaryValue[]];
    }
  }

  /* string representations */
  toString() {
    let str = `${this.constructor.name}<${this.kind}> {\n`;
    for (const member of this.order) {
      // override strict undefined check here, we know it exists
      const info = this.info.get(member) as MemberInfo;
      str += '  ';
      str += member;
      str += ': ';
      str += (info.signature === MemberSignature.Signed) ? 'i' : 'u';
      str += info.bitSize;
      str += (info.endianness === MemberEndianness.BigEndian) ? 'be' : '';
      str += ' = ';
      str += this.get(member);
      str += ';\n';
    }
    str += '}';
    return str;
  }
  [Symbol.toPrimitive](hint: 'number' | 'string' | 'default') {
    if (hint === 'number') {
      throw new TypeError(`Cannot convert ${this.constructor.name}<${this.kind}> to a Number`);
    } else {
      return this.toString();
    }
  }
  [inspect.custom](depth: number, opts: any) {
    // TODO: stylize for node
    return this.toString();
  }
}
