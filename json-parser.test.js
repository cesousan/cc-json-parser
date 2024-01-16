const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const { JSONParse } = require('./json-parse')

describe('json-parser', () => {
  describe('parse empty object', () => {
    it('should parse {} into an empty object', async () => {
      const json = fs.readFileSync('./tests/step1/valid.json', 'utf8')
      const result = await JSONParse(json)
      assert.deepStrictEqual(result, {})
    })
    it('should fail to parse an empty string', async () => {
      const json = fs.readFileSync('./tests/step1/invalid.json', 'utf8')
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'TypeError')
          assert.strictEqual(err.message, "Cannot read properties of undefined (reading 'type')")
          return true
        },
      )
    })
    it('should fail to parse a string with only an opening brace', async () => {
      const json = '{'
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Expected } but got EOF at position ')
          return true
        },
      )
    })
    it('should fail to parse a string with only a closing brace', async () => {
      const json = '}'
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected token "}" at position 0')
          return true
        },
      )
    })
  })
  describe('parse {"key": "string" } object', () => {
    it('should parse {"key": "value"} into an object with one key-value pair', async () => {
      const json = fs.readFileSync('./tests/step2/valid.json', 'utf8')
      const result = await JSONParse(json)
      assert.deepStrictEqual(result, { key: 'value' })
    })
    it('should parse multiple key-string-value pairs', async () => {
      const json = fs.readFileSync('./tests/step2/valid2.json', 'utf8')
      const result = await JSONParse(json)
      assert.deepStrictEqual(result, { key: 'value', key2: 'value' })
    })
    it('should fail to parse an object with trailing comma', async () => {
      const json = fs.readFileSync('./tests/step2/invalid.json', 'utf8')
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected token "," at position 15')
          return true
        },
      )
    })
    it('should fail to parse an object with non-string key', async () => {
      const json = fs.readFileSync('./tests/step2/invalid2.json', 'utf8')
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected character k at position 22')
          return true
        },
      )
    })
  })
  describe('parse {"key": primitive-value } object ', () => {
    it('should parse an object containing string, numeric, boolean and null values', async () => {
      const json = fs.readFileSync('./tests/step3/valid.json', 'utf8')
      const result = await JSONParse(json)
      assert.deepStrictEqual(result, {
        key1: true,
        key2: false,
        key3: null,
        key4: 'value',
        key5: 101.5,
      })
    })
    it('should fail to parse an object with wrong boolean value', async () => {
      const json = fs.readFileSync('./tests/step3/invalid.json', 'utf8')
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected character F at position 28')
          return true
        },
      )
    })
    it('should fail to parse an object with wrong null value', async () => {
      const json = '{"key": nil}'
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected character i at position 8')
          return true
        },
      )
    })
    it('should fail to parse an object with wrong numeric value', async () => {
      const json = '{"key": 1.0_1}'
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected character _ at position 11')
          return true
        },
      )
    })
  })
  describe('parse {"key": object } and {"key": list } object', () => {
    it('should parse an object containing an empty object and an empty list', async () => {
      const json = fs.readFileSync('./tests/step4/valid.json', 'utf8')
      const result = await JSONParse(json)
      assert.deepStrictEqual(result, {
        key: 'value',
        'key-n': 101,
        'key-o': {},
        'key-l': [],
      })
    })
    it('shoudl parse an object containing an object with key-values and a list with values', async () => {
      const json = fs.readFileSync('./tests/step4/valid2.json', 'utf8')
      const result = await JSONParse(json)
      assert.deepStrictEqual(result, {
        key: 'value',
        'key-n': 101,
        'key-o': {
          'inner key': 'inner value',
        },
        'key-l': ['list value1', 'list value2'],
      })
    })
    it('should fail to parse an object containing an invalid object', async () => {
      const json = '{"key": { "key": "value", "inner-invalid-obj": }{ }}'
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected token "}" at position 47')
          return true
        },
      )
    })
    it('should fail to parse an object containing an invalid list', async () => {
      const json = '{"key": [ "value", "inner-invalid-list": ]}'
      await assert.rejects(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected token ":" at position 39')
          return true
        },
      )
    })
  })
})
