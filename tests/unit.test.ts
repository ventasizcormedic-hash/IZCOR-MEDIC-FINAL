import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseApplications, parseTechnicalSpecs } from '../src/components/product/types.ts';

describe('product data utilities', () => {
  it('parses technical specification pairs into table rows', () => {
    assert.deepStrictEqual(parseTechnicalSpecs('Voltaje: 220 V\nPeso: 10 kg'), {
      type: 'table',
      rows: [
        { key: 'Voltaje', value: '220 V' },
        { key: 'Peso', value: '10 kg' },
      ],
    });
  });

  it('returns null for empty technical specifications', () => {
    assert.equal(parseTechnicalSpecs('  '), null);
  });

  it('normalizes application lists without inventing values', () => {
    assert.deepStrictEqual(parseApplications('UCI; Emergencia'), ['UCI', 'Emergencia']);
  });
});