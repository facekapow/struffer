import { Test, TestCase, TestFixture } from 'alsatian';
import { AdvancedStruffer } from '../src/index';
import {
  FactoryTestsBase,
  ObjectAPITestsBase,
  MapAPITestsBase,
  CommonAPITestCase,
  BatchAPITestsBase,
  MiscellaneousTestsBase,
} from './common';

@TestFixture('AdvancedStruffer factory tests')
export class FactoryTests extends FactoryTestsBase {
  protected get factory() {
    return AdvancedStruffer;
  }
  protected get defaultSize() {
    return 2;
  }

  @TestCase({
    byteLength: 1,
    bitLength: 3,
    types: ['i2', 'i1be'],
  })
  @TestCase({
    byteLength: 3,
    bitLength: 17,
    types: ['u1', 'i3', 'u13'],
  })
  @TestCase({
    byteLength: 1,
    bitLength: 8,
    types: ['i5', 'unsigned int_2 BE', 'uint1'],
  })
  @Test('Basic generation')
  basicGeneration(opts: any) {
    super.basicGeneration(opts);
  }

  @TestCase('Foobar3000', undefined, ['byte', 'char', 'short', 'int', 'signed short int'])
  @TestCase('MisterTesty', 24, ['uint2be', 'u3', 'i_4be'])
  @TestCase('UnaCosa', 1, ['long int', 'long long uint', 'uint', 'i32', 'u12'])
  @TestCase('TypeTesting', undefined, ['signed long uint', 'short i', 'signed long u'])
  @Test('AdvancedStruffer instantiation')
  instantiation(name: string, offset: number | null = null, types: string[]) {
    super.instantiation(name, offset, types);
  }
}

@TestFixture('AdvancedStruffer Object API tests')
export class ObjectAPITests extends ObjectAPITestsBase {
  protected get factory() {
    return AdvancedStruffer;
  }
  protected get defaultSize() {
    return 2;
  }

  /*
   * some data bytes are separated so we know what bits correspond to who.
   * the third byte and part of the fourth byte belong to `uint13`.
   * part of the fourth byte, the fifth byte, the sixth byte and part of the
   * seventh byte belong to `int`
   */
  // tslint:disable-next-line:max-line-length
  @TestCase([4, parseInt('110' + '111' + '11', 2), 102, parseInt('00011' + '111', 2), 255, 255, 252, 24], [
    ['u8', 4],
    ['i3', -2],
    ['uint_3be', 7],
    ['int_2 BE', -1],
    ['uint13', 3267],
    ['int', -125],
  ])
  @Test('Object API member retrieval')
  retrieval(bufferData: number[], stuff: [string, number][]) {
    super.retrieval(bufferData, stuff);
  }

  @TestCase([
    ['u8', 4],
    ['i3', -2],
    ['uint_3be', 7],
    ['int_2 BE', -1],
    ['uint13', 3267],
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

@TestFixture('AdvancedStruffer Map API tests')
export class MapAPITests extends MapAPITestsBase {
  protected get factory() {
    return AdvancedStruffer;
  }
  protected get defaultSize() {
    return 2;
  }

  /*
   * some data bytes are separated so we know what bits correspond to who.
   * the third byte and part of the fourth byte belong to `uint13`.
   * part of the fourth byte, the fifth byte, the sixth byte and part of the
   * seventh byte belong to `int`
   */
  // tslint:disable-next-line:max-line-length
  @TestCase([4, parseInt('110' + '111' + '11', 2), 102, parseInt('00011' + '111', 2), 255, 255, 252, 24], [
    ['u8', 4],
    ['i3', -2],
    ['uint_3be', 7],
    ['int_2 BE', -1],
    ['uint13', 3267],
    ['int', -125],
  ])
  @Test('Map API member retrieval')
  retrieval(bufferData: number[], stuff: [string, number][]) {
    super.retrieval(bufferData, stuff);
  }

  @TestCase([
    ['u8', 4],
    ['i3', -2],
    ['uint_3be', 7],
    ['int_2 BE', -1],
    ['uint13', 3267],
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

@TestFixture('AdvancedStruffer Batch API tests')
export class BatchAPITests extends BatchAPITestsBase {
  protected get factory() {
    return AdvancedStruffer;
  }
  protected get defaultSize() {
    return 2;
  }

  // tslint:disable-next-line:max-line-length
  @TestCase([4, parseInt('110' + '111' + '11', 2), 102, parseInt('00011' + '111', 2), 255, 255, 252, 24], [
    ['u8', 4],
    ['i3', -2],
    ['uint_3be', 7],
    ['int_2 BE', -1],
    ['uint13', 3267],
    ['int', -125],
  ])
  @Test('Batch API member retrieval')
  retrieval(bufferData: number[], stuff: [string, number][]) {
    super.retrieval(bufferData, stuff);
  }

  @TestCase([
    ['u8', 4],
    ['i3', -2],
    ['uint_3be', 7],
    ['int_2 BE', -1],
    ['uint13', 3267],
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
    return AdvancedStruffer;
  }
  protected get defaultSize() {
    return 2;
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
    ['u23', 'foo', 352],
    ['i3', 'bar', -2],
    ['unsigned byte BE', 'something', 255],
  ])
  @Test('Accurate toString representation')
  toString(name: string, members: [string, string, number][]) {
    super.toString(name, members);
  }

  @TestCase('FooStruff', [
    ['u23', 'foo', 352],
    ['i3', 'bar', -2],
    ['unsigned byte BE', 'something', 255],
  ])
  @Test('Accurate coercion')
  coercion(name: string, members: [string, string, number][]) {
    super.coercion(name, members);
  }

  @TestCase('FooStruff', [
    ['u23', 'foo', 352],
    ['i3', 'bar', -2],
    ['unsigned byte BE', 'something', 255],
  ])
  @Test('Accurate util.inspect representation')
  inspection(name: string, members: [string, string, number][]) {
    super.inspection(name, members);
  }
}
