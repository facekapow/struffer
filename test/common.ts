import { Expect, TestCase } from 'alsatian';
import StrufferBase from '../src/base';
import { BinaryValue, MemberDictionary } from '../src';
import { endianness } from 'os';
import { parseType, MemberSignature, MemberEndianness } from '../src/common';
import { inspect } from 'util';

// tslint:disable-next-line:max-line-length
export const CommonAPITestCase = TestCase('foobar', 'bar', 'foo', 'something', 'UTF-8-Up-Next...', '👍');

/* istanbul ignore next */
class TestsBase {
  protected get factory(): (name: string, stuff: [string, string][]) => typeof StrufferBase {
    return () => StrufferBase;
  }
  protected get defaultSize(): number {
    return 8;
  }
}

export class FactoryTestsBase extends TestsBase {
  basicGeneration({ byteLength, bitLength, types }: {
    byteLength: number,
    bitLength: number,
    types: string[],
  }) {
    const Test = this.factory('Basic', types.map((type, i) => {
      return [type, `member${i}`] as [string, string];
    }));
    Expect(Test.byteLength).toBe(byteLength);
    Expect(Test.bitLength).toBe(bitLength);
  }
  instantiation(name: string, offset: number | null, types: string[]) {
    const Test = this.factory(name, types.map((type, i) => {
      return [type, `member${i}`] as [string, string];
    }));
    const buffer = Buffer.alloc(Test.byteLength + ((offset !== null) ? offset : 0));
    const struff = new Test(buffer, (offset !== null) ? offset : undefined);
    Expect(struff.kind).toBe(name);
    Expect(struff.offset).toBe((offset !== null) ? offset : 0);
    Expect(struff.size).toBe(types.length);
    Expect(struff[Symbol.toStringTag]).toBe(`${struff.constructor.name}<${name}>`);
  }
}

class APITestsBase extends TestsBase {
  retrievalBase(bufferData: number[], stuff: [string, number][]): StrufferBase {
    const Test = this.factory('Test', stuff.map(([type], i) => {
      return [type, `member${i}`] as [string, string];
    }));
    const buf = Buffer.alloc(Test.byteLength);
    buf.set(bufferData);
    return new Test(buf);
  }
  assignmentBase(stuff: [string, number][]): StrufferBase {
    const Test = this.factory('Test', stuff.map(([type], i) => {
      return [type, `member${i}`] as [string, string];
    }));
    const buf = Buffer.alloc(Test.byteLength);
    return new Test(buf);
  }
  otherBase(names: string[], size: number = this.defaultSize): StrufferBase {
    const Test = this.factory('Test', names.map(name => [`u${size}`, name] as [string, string]));
    const buf = Buffer.alloc(Test.byteLength);
    return new Test(buf);
  }
}

export class ObjectAPITestsBase extends APITestsBase {
  retrieval(bufferData: number[], stuff: [string, number][]) {
    const struff = super.retrievalBase(bufferData, stuff);
    for (const [i, [, value]] of stuff.entries()) {
      Expect(struff.structure[`member${i}`]).toBe(value);
    }
    Expect(struff.structure.someNonexistentMember).not.toBeDefined();
  }
  // technically, this test also includes retrieval but ¯\_(ツ)_/¯
  assignment(stuff: [string, number][]) {
    const struff = super.assignmentBase(stuff);
    for (const [i, [, value]] of stuff.entries()) {
      Expect(() => struff.structure[`member${i}`] = value).not.toThrow();
      Expect(struff.structure[`member${i}`]).toBe(value);
    }
    Expect(() => struff.structure.someNonexistentMember = 1).toThrow();
  }
  presence(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      Expect(name in struff.structure).toBe(true);
    }
    Expect('someNonexistentMember' in struff.structure).toBe(false);
  }
  deletion(...names: string[]) {
    const struff = super.otherBase(names);
    (struff.buffer as Buffer).fill(1);
    for (const name of names) {
      /*
       * in strict mode (which typescript enables by default), `delete` returning
       * `false` causes a `TypeError` to be thrown
       */
      Expect(() => Expect(delete struff.structure[name]).toBe(true)).not.toThrow();
      Expect(struff.structure[name]).toBe(0);
    }
    // same here
    Expect(() => Expect(delete struff.structure.someNonexistentMember).toBe(false)).toThrow();
  }
  enumeration(...names: string[]) {
    const struff = super.otherBase(names);
    let i = 0;
    for (const member of Object.keys(struff.structure)) {
      Expect(member).toBe(names[i]);
      i++;
    }
  }
  propertyDescription(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      let desc = Object.getOwnPropertyDescriptor(struff.structure, name);
      Expect(desc).toBeDefined();
      desc = desc as PropertyDescriptor;
      Expect(desc.configurable).toBe(true);
      Expect(desc.enumerable).toBe(true);
      Expect(desc.writable).toBe(true);
    }
    const desc = Object.getOwnPropertyDescriptor(struff.structure, 'someNonexistentMember');
    Expect(desc).not.toBeDefined();
  }
}

export class MapAPITestsBase extends APITestsBase {
  retrieval(bufferData: number[], stuff: [string, number][]) {
    const struff = super.retrievalBase(bufferData, stuff);
    for (const [i, [, value]] of stuff.entries()) {
      Expect(struff.get(`member${i}`)).toBe(value);
    }
    Expect(struff.get('someNonexistentMember')).not.toBeDefined();
  }
  // technically, this test also includes retrieval but ¯\_(ツ)_/¯
  assignment(stuff: [string, number][]) {
    const struff = super.assignmentBase(stuff);
    for (const [i, [, value]] of stuff.entries()) {
      Expect(() => struff.set(`member${i}`, value)).not.toThrow();
      Expect(struff.get(`member${i}`)).toBe(value);
    }
    Expect(() => struff.set('someNonexistentMember', 1)).toThrow();
  }
  presence(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      Expect(struff.has(name)).toBe(true);
    }
    Expect(struff.has('someNonexistentMember')).toBe(false);
  }
  deletion(...names: string[]) {
    const struff = super.otherBase(names);
    (struff.buffer as Buffer).fill(1);
    for (const name of names) {
      Expect(struff.delete(name)).toBe(true);
      Expect(struff.get(name)).toBe(0);
    }
    Expect(struff.delete('someNonexistentMember')).toBe(false);
  }
  enumeration(...names: string[]) {
    const struff = super.otherBase(names);
    let i = 0;
    for (const member of struff.keys()) {
      Expect(member).toBe(names[i]);
      i++;
    }
  }

  clearance(...names: string[]) {
    const struff = super.otherBase(names);
    (struff.buffer as Buffer).fill(1);
    struff.clear();
    for (const name of names) {
      Expect(struff.get(name)).toBe(0);
    }
  }
  iteration(thisArg: any = undefined, ...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    let i = 0;
    struff.forEach(
      function (this: any, value, key, map) {
        Expect(key).toBe(names[i]);
        Expect(value).toBe(1);
        Expect(map).toBe(struff);
        Expect(this).toBe(thisArg);
        i++;
      },
      thisArg,
    );
  }
  valueEnumeration(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    let i = 0;
    for (const val of struff.values()) {
      Expect(val).toBe(1);
      i++;
    }
  }
  entryEnumeration(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    let i = 0;
    for (const [name, value] of struff.entries()) {
      Expect(name).toBe(names[i]);
      Expect(value).toBe(1);
      i++;
    }
  }
  automaticIteration(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    let i = 0;
    for (const [name, value] of struff) {
      Expect(name).toBe(names[i]);
      Expect(value).toBe(1);
      i++;
    }
  }
}

export class BatchAPITestsBase extends APITestsBase {
  retrieval(bufferData: number[], stuff: [string, number][]) {
    const struff = super.retrievalBase(bufferData, stuff);
    const members = stuff.filter((_, i) => i % 2 === 0).map((_, i) => `member${i}`);
    const dict = struff.getMany(members);
    for (const name of Object.keys(dict)) {
      const i = Number(name.slice(6));
      Expect(dict[name]).toBe(stuff[i][1]);
    }
    const all = struff.getMany();
    for (const name of Object.keys(dict)) {
      const i = Number(name.slice(6));
      Expect(all[name]).toBe(stuff[i][1]);
    }
  }
  // technically, this test also includes retrieval but ¯\_(ツ)_/¯
  assignment(stuff: [string, number][]) {
    const struff = super.assignmentBase(stuff);
    const dict: MemberDictionary = {};
    for (const [i, [, value]] of stuff.entries()) {
      dict[`member${i}`] = value;
    }
    struff.setMany(dict);
    for (const [i, [, value]] of stuff.entries()) {
      Expect(struff.get(`member${i}`)).toBe(value);
    }
  }
  presence(...names: string[]) {
    const struff = super.otherBase(names);
    const present = struff.hasMany(names.concat('someNonexistentMember'));
    for (const name of names) {
      Expect(present[name]).toBe(true);
    }
    Expect(present.someNonexistentMember).toBe(false);
  }
  deletion(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    const toDelete = names.filter((_, i) => i % 2 === 0);
    const result = struff.deleteMany(toDelete);
    Expect(result).toBe(true);
    for (const name of names) {
      if (toDelete.includes(name)) {
        Expect(struff.get(name)).toBe(0);
      } else {
        Expect(struff.get(name)).not.toBe(0);
      }
    }
    const wrongDelete = names.filter(n => !toDelete.includes(n))
                             .concat('someNonexistentMember')
                             .concat(names[0]);
    const result2 = struff.deleteMany(wrongDelete);
    Expect(result2).toBe(false);
    for (const name of names) {
      Expect(struff.get(name)).toBe(0);
    }
  }
}

export class MiscellaneousTestsBase extends APITestsBase {
  stringRepresentation(
    factoryName: string,
    name: string,
    members: [string, string, number][],
  ): string {
    let rep = `${factoryName}<${name}> {\n`;
    for (const [type, name, value] of members) {
      const typeInfo = parseType(type);
      rep += '  ';
      rep += name;
      rep += ': ';
      rep += (typeInfo.signature === MemberSignature.Signed) ? 'i' : 'u';
      rep += typeInfo.bitSize;
      rep += (typeInfo.endianness === MemberEndianness.BigEndian) ? 'be' : '';
      rep += ' = ';
      rep += value;
      rep += ';\n';
    }
    rep += '}';
    return rep;
  }
  pad(
    arr: BinaryValue[],
    signature: 'u' | 'i' = 'u',
    endianness: 'le' | 'be' = 'le',
  ): BinaryValue[] {
    let result = arr.join('');
    if (signature === 'u') {
      if (endianness === 'le') {
        result = result.padStart(this.defaultSize, '0');
      } else {
        result = result.padEnd(this.defaultSize, '0');
      }
    } else {
      if (endianness === 'le') {
        result = result.padStart(this.defaultSize, String(arr[0]));
      } else {
        result = result.padEnd(this.defaultSize, String(arr[arr.length - 1]));
      }
    }
    return result.split('').map(i => (i === '0') ? 0 : 1);
  }

  bitEnumeration(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    let expected: BinaryValue[] = [];
    expected = '1'.padStart(this.defaultSize, '0').split('').map(i => (i === '0') ? 0 : 1);
    /* istanbul ignore next */
    if (endianness() === 'BE') {
      expected.reverse();
    }
    for (const bits of struff.bits()) {
      Expect(bits).toEqual(expected);
    }
  }
  bitEntryEnumeration(...names: string[]) {
    const struff = super.otherBase(names);
    for (const name of names) {
      struff.set(name, 1);
    }
    let expected: BinaryValue[] = [];
    expected = '1'.padStart(this.defaultSize, '0').split('').map(i => (i === '0') ? 0 : 1);
    /* istanbul ignore next */
    if (endianness() === 'BE') {
      expected.reverse();
    }
    let i = 0;
    for (const [name, bits] of struff.bitEntries()) {
      Expect(name).toBe(names[i]);
      Expect(bits).toEqual(expected);
      i++;
    }
  }

  getBits() {
    const Test = this.factory('Test', [
      [`u${this.defaultSize}`, 'foo'],
      [`i${this.defaultSize}`, 'bar'],
      [`u${this.defaultSize}be`, 'some'],
      [`i${this.defaultSize}be`, 'thing'],
    ]);
    const buf = Buffer.alloc(Test.byteLength);
    const struff = new Test(buf);
    struff.setMany({
      foo: 1,
      bar: -2,
      some: 1,
      thing: -2,
    });
    const expected: {
      [x: string]: BinaryValue[],
    } = {
      foo: this.pad([1]),
      bar: this.pad([1, 0], 'i'),
      some: this.pad([1], 'u', 'be'),
      thing: this.pad([0, 1], 'i', 'be'),
    };
    for (const name of ['foo', 'bar', 'some', 'thing']) {
      Expect(struff.getBits(name)).toEqual(expected[name]);
    }

    Expect(() => struff.getBits('someNonexistentMember')).toThrow();
  }
  setBits() {
    const Test = this.factory('Test', [
      [`u${this.defaultSize}`, 'foo'],
      [`i${this.defaultSize}`, 'bar'],
      [`u${this.defaultSize}be`, 'some'],
      [`i${this.defaultSize}be`, 'thing'],
    ]);
    const buf = Buffer.alloc(Test.byteLength);
    const struff = new Test(buf);
    const members = ['foo', 'bar', 'some', 'thing'];
    const values: {
      [x: string]: BinaryValue[],
    } = {
      foo: this.pad([1]),
      bar: this.pad([1, 0], 'i'),
      some: this.pad([1], 'u', 'be'),
      thing: this.pad([0, 1], 'i', 'be'),
    };
    for (const name of members) {
      struff.setBits(name, values[name]);
    }
    const expected = {
      foo: 1,
      bar: -2,
      some: 1,
      thing: -2,
    };
    const result = struff.getMany(members);
    Expect(result).toEqual(expected);

    Expect(() => struff.setBits('someNonexistentMember', [1, 1])).toThrow();
  }

  toString(name: string, members: [string, string, number][]) {
    const Test = this.factory(name, members.map(([type, name]) => {
      return [type, name] as [string, string];
    }));
    const buf = Buffer.alloc(Test.byteLength);
    const struff = new Test(buf);
    struff.setMany(members.reduce<MemberDictionary>(
      (obj, [, name, value]) => {
        obj[name] = value;
        return obj;
      },
      {},
    ));
    Expect(struff.toString()).toBe(this.stringRepresentation(
      struff.constructor.name,
      name,
      members,
    ));
  }
  coercion(name: string, members: [string, string, number][]) {
    const Test = this.factory(name, members.map(([type, name]) => {
      return [type, name] as [string, string];
    }));
    const buf = Buffer.alloc(Test.byteLength);
    const struff = new Test(buf);
    struff.setMany(members.reduce<MemberDictionary>(
      (obj, [, name, value]) => {
        obj[name] = value;
        return obj;
      },
      {},
    ));
    Expect(() => +struff).toThrow();
    // tslint:disable-next-line:max-line-length
    Expect(`${struff}foobar`).toBe(`${this.stringRepresentation(struff.constructor.name, name, members)}foobar`);
  }
  inspection(name: string, members: [string, string, number][]) {
    const Test = this.factory(name, members.map(([type, name]) => {
      return [type, name] as [string, string];
    }));
    const buf = Buffer.alloc(Test.byteLength);
    const struff = new Test(buf);
    struff.setMany(members.reduce<MemberDictionary>(
      (obj, [, name, value]) => {
        obj[name] = value;
        return obj;
      },
      {},
    ));
    Expect(inspect(struff)).toBe(this.stringRepresentation(struff.constructor.name, name, members));
  }
}
