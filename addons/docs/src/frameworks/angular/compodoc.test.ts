import { extractType, setCompodocJson } from './compodoc';
import { CompodocJson, Decorator } from './types';

const makeProperty = (compodocType?: string) => ({
  type: compodocType,
  name: 'dummy',
  decorators: [] as Decorator[],
  optional: true,
});

const getDummyCompodocJson = () =>
  ({
    miscellaneous: {
      typealiases: [
        {
          name: 'EnumAlias',
          ctype: 'miscellaneous',
          subtype: 'typealias',
          rawtype: 'EnumNumeric',
          file: 'src/stories/component-with-enums/enums.component.ts',
          description: '',
          kind: 161,
        },
        {
          name: 'TypeAlias',
          ctype: 'miscellaneous',
          subtype: 'typealias',
          rawtype: '"Type Alias 1" | "Type Alias 2" | "Type Alias 3"',
          file: 'src/stories/component-with-enums/enums.component.ts',
          description: '',
          kind: 168,
        },
      ],
      enumerations: [
        {
          name: 'EnumNumeric',
          childs: [
            {
              name: 'FIRST',
            },
            {
              name: 'SECOND',
            },
            {
              name: 'THIRD',
            },
          ],
          ctype: 'miscellaneous',
          subtype: 'enum',
          description: '<p>Button Priority</p>\n',
          file: 'src/stories/component-with-enums/enums.component.ts',
        },
        {
          name: 'EnumNumericInitial',
          childs: [
            {
              name: 'UNO',
              value: '1',
            },
            {
              name: 'DOS',
            },
            {
              name: 'TRES',
            },
          ],
          ctype: 'miscellaneous',
          subtype: 'enum',
          description: '',
          file: 'src/stories/component-with-enums/enums.component.ts',
        },
        {
          name: 'EnumStringValues',
          childs: [
            {
              name: 'PRIMARY',
              value: 'PRIMARY',
            },
            {
              name: 'SECONDARY',
              value: 'SECONDARY',
            },
            {
              name: 'TERTIARY',
              value: 'TERTIARY',
            },
          ],
          ctype: 'miscellaneous',
          subtype: 'enum',
          description: '',
          file: 'src/stories/component-with-enums/enums.component.ts',
        },
      ],
    },
  } as CompodocJson);

describe('extractType', () => {
  describe('with compodoc type', () => {
    setCompodocJson(getDummyCompodocJson());
    it.each([
      ['string', { name: 'string' }],
      ['boolean', { name: 'boolean' }],
      ['number', { name: 'number' }],
      ['object', { name: 'object' }],
      ['foo', { name: 'object' }],
      [null, { name: 'void' }],
      [undefined, { name: 'void' }],
      ['T[]', { name: 'object' }],
      ['[]', { name: 'object' }],
      ['"primary" | "secondary"', { name: 'enum', value: ['primary', 'secondary'] }],
      ['TypeAlias', { name: 'enum', value: ['Type Alias 1', 'Type Alias 2', 'Type Alias 3'] }],
      ['EnumNumeric', { name: 'object' }],
      ['EnumNumericInitial', { name: 'object' }],
      ['EnumStringValues', { name: 'enum', value: ['PRIMARY', 'SECONDARY', 'TERTIARY'] }],
    ])('%s', (compodocType, expected) => {
      expect(extractType(makeProperty(compodocType), null)).toEqual(expected);
    });
  });

  describe('without compodoc type', () => {
    it.each([
      ['string', { name: 'string' }],
      ['', { name: 'string' }],
      [false, { name: 'boolean' }],
      [10, { name: 'number' }],
      [['abc'], { name: 'object' }],
      [{ foo: 1 }, { name: 'object' }],
      [undefined, { name: 'void' }],
    ])('%s', (defaultValue, expected) => {
      expect(extractType(makeProperty(null), defaultValue)).toEqual(expected);
    });
  });
});
