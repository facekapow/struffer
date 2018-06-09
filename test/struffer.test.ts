import { Test, TestCase, TestFixture, Expect } from 'alsatian';
import Struffer from '../src/index';
import {
  FactoryTestsBase,
  ObjectAPITestsBase,
  MapAPITestsBase,
  CommonAPITestCase,
  BatchAPITestsBase,
  MiscellaneousTestsBase,
} from './common';

@TestFixture('Struffer factory tests')
export class FactoryTests extends FactoryTestsBase {
  protected get factory() {
    return Struffer;
  }
  protected get defaultSize() {
    return 8;
  }

  @TestCase({
    byteLength: 3,
    bitLength: 24,
    types: ['i8', 'i16be'],
  })
  @TestCase({
    byteLength: 6,
    bitLength: 48,
    types: ['u8', 'i8', 'u32'],
  })
  @TestCase({
    byteLength: 4,
    bitLength: 32,
    types: ['i16', 'unsigned int_8 BE', 'uint8'],
  })
  @Test('Basic generation')
  basicGeneration(opts: any) {
    super.basicGeneration(opts);
  }

  @TestCase('Foobar3000', undefined, ['byte', 'char', 'short', 'int', 'signed short int'])
  @TestCase('MisterTesty', 24, ['uint8be', 'u16', 'i_be'])
  @TestCase('UnaCosa', 1, ['long int', 'long long uint', 'uint', 'i32', 'u16'])
  @TestCase('TypeTesting', undefined, ['signed long uint', 'short i', 'signed long u'])
  @Test('Struffer instantiation')
  instantiation(name: string, offset: number | null = null, types: string[]) {
    super.instantiation(name, offset, types);
  }

  @Test('Struffer member size invalidity')
  memberSizeInvalidity() {
    Expect(() => {
      const Test = Struffer('Test', [
        ['u3', 'foobar'],
      ]);
    }).toThrow();
  }
}

@TestFixture('Struffer Object API tests')
export class ObjectAPITests extends ObjectAPITestsBase {
  protected get factory() {
    return Struffer;
  }
  protected get defaultSize() {
    return 8;
  }

  @TestCase([4, 254, 224, 0, 0, 0, 255, 255, 0, 0, 12, 195, 255, 255, 255, 131], [
    ['u8', 4],
    ['i8', -2],
    ['uint_be', 7],
    ['short int BE', -1],
    ['uint', 3267],
    ['int', -125],
  ])
  @Test('Object API member retrieval')
  retrieval(bufferData: number[], stuff: [string, number][]) {
    super.retrieval(bufferData, stuff);
  }

  @TestCase([
    ['u8', 4],
    ['i8', -2],
    ['uint_be', 7],
    ['short int BE', -1],
    ['uint', 3267],
    ['int', -125],
  ])
  @Test('Object API member assignment')
  assignment(stuff: [string, number][]) {
    super.assignment(stuff);
  }

  @CommonAPITestCase
  @Test('Object API member presence')
  presence(...names: string[]) {
    super.presence(...names);
  }

  @CommonAPITestCase
  @Test('Object API member "deletion"')
  deletion(...names: string[]) {
    super.deletion(...names);
  }

  @CommonAPITestCase
  @Test('Object API member enumeration')
  enumeration(...names: string[]) {
    super.enumeration(...names);
  }

  @CommonAPITestCase
  @Test('Object API member property description')
  propertyDescription(...names: string[]) {
    super.propertyDescription(...names);
  }
}

@TestFixture('Struffer Map API tests')
export class MapAPITests extends MapAPITestsBase {
  protected get factory() {
    return Struffer;
  }
  protected get defaultSize() {
    return 8;
  }

  @TestCase([4, 254, 224, 0, 0, 0, 255, 255, 0, 0, 12, 195, 255, 255, 255, 131], [
    ['u8', 4],
    ['i8', -2],
    ['uint_be', 7],
    ['short int BE', -1],
    ['uint', 3267],
    ['int', -125],
  ])
  @Test('Map API member retrieval')
  retrieval(bufferData: number[], stuff: [string, number][]) {
    super.retrieval(bufferData, stuff);
  }

  @TestCase([
    ['u8', 4],
    ['i8', -2],
    ['uint_be', 7],
    ['short int BE', -1],
    ['uint', 3267],
    ['int', -125],
  ])
  @Test('Map API member assignment')
  assignment(stuff: [string, number][]) {
    super.assignment(stuff);
  }

  @CommonAPITestCase
  @Test('Map API member presence')
  presence(...names: string[]) {
    super.presence(...names);
  }

  @CommonAPITestCase
  @Test('Map API member "deletion"')
  deletion(...names: string[]) {
    super.deletion(...names);
  }

  @CommonAPITestCase
  @Test('Map API member enumeration')
  enumeration(...names: string[]) {
    super.enumeration(...names);
  }

  @CommonAPITestCase
  @Test('Map API member clearance')
  clearance(...names: string[]) {
    super.clearance(...names);
  }

  @TestCase(undefined, 'foobar', 'bar', 'foo', 'something', 'UTF-8-Up-Next...', '👍')
  @TestCase({ me: true }, 'foobar', 'bar', 'foo', 'something', 'UTF-8-Up-Next...', '👍')
  @Test('Map API member iteration')
  iteration(thisArg: any = undefined, ...names: string[]) {
    super.iteration(thisArg, ...names);
  }

  @CommonAPITestCase
  @Test('Map API member value enumeration')
  valueEnumeration(...names: string[]) {
    super.valueEnumeration(...names);
  }

  @CommonAPITestCase
  @Test('Map API member entry enumeration')
  entryEnumeration(...names: string[]) {
    super.entryEnumeration(...names);
  }

  @CommonAPITestCase
  @Test('Map API member automatic iteration')
  automaticIteration(...names: string[]) {
    super.automaticIteration(...names);
  }
}

@TestFixture('Struffer Batch API tests')
export class BatchAPITests extends BatchAPITestsBase {
  protected get factory() {
    return Struffer;
  }
  protected get defaultSize() {
    return 8;
  }

  @TestCase([4, 254, 224, 0, 0, 0, 255, 255, 0, 0, 12, 195, 255, 255, 255, 131], [
    ['u8', 4],
    ['i8', -2],
    ['uint_be', 7],
    ['short int BE', -1],
    ['uint', 3267],
    ['int', -125],
  ])
  @Test('Batch API member retrieval')
  retrieval(bufferData: number[], stuff: [string, number][]) {
    super.retrieval(bufferData, stuff);
  }

  @TestCase([
    ['u8', 4],
    ['i8', -2],
    ['uint_be', 7],
    ['short int BE', -1],
    ['uint', 3267],
    ['int', -125],
  ])
  @Test('Batch API member assignment')
  assignment(stuff: [string, number][]) {
    super.assignment(stuff);
  }

  @CommonAPITestCase
  @Test('Batch API member presence')
  presence(...names: string[]) {
    super.presence(...names);
  }

  @CommonAPITestCase
  @Test('Batch API member deletion')
  deletion(...names: string[]) {
    super.deletion(...names);
  }
}

export class MiscellaneousTests extends MiscellaneousTestsBase {
  protected get factory() {
    return Struffer;
  }
  protected get defaultSize() {
    return 8;
  }

  @CommonAPITestCase
  @Test('Member bit enumeration')
  bitEnumeration(...names: string[]) {
    super.bitEnumeration(...names);
  }

  @CommonAPITestCase
  @Test('Member bit entry enumeration')
  bitEntryEnumeration(...names: string[]) {
    super.bitEntryEnumeration(...names);
  }

  @Test('Member bit retrieval')
  getBits() {
    super.getBits();
  }

  @Test('Member bit assignment')
  setBits() {
    super.setBits();
  }

  @TestCase('FooStruff', [
    ['u16', 'foo', 352],
    ['i8', 'bar', -2],
    ['unsigned byte BE', 'something', 255],
  ])
  @Test('Accurate toString representation')
  toString(name: string, members: [string, string, number][]) {
    super.toString(name, members);
  }

  @TestCase('FooStruff', [
    ['u16', 'foo', 352],
    ['i8', 'bar', -2],
    ['unsigned byte BE', 'something', 255],
  ])
  @Test('Accurate coercion')
  coercion(name: string, members: [string, string, number][]) {
    super.coercion(name, members);
  }

  @TestCase('FooStruff', [
    ['u16', 'foo', 352],
    ['i8', 'bar', -2],
    ['unsigned byte BE', 'something', 255],
  ])
  @Test('Accurate util.inspect representation')
  inspection(name: string, members: [string, string, number][]) {
    super.inspection(name, members);
  }
}
