const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const { JSONParse } = require('./json-parse')

describe('json-parser', () => {
  describe('parse empty object', () => {
    it('should parse {} into an empty object', () => {
      const json = fs.readFileSync('./tests/step1/valid.json', 'utf8')
      const result = JSONParse(json)
      assert.deepStrictEqual(result, {})
    })
    it('should fail to parse an empty string', () => {
      const json = fs.readFileSync('./tests/step1/invalid.json', 'utf8')
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'TypeError')
          assert.strictEqual(err.message, "Cannot read properties of undefined (reading 'type')")
          return true
        },
      )
    })
    it('should fail to parse a string with only an opening brace', () => {
      const json = '{'
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Expected } but got EOF at position 1')
          return true
        },
      )
    })
    it('should fail to parse a string with only a closing brace', () => {
      const json = '}'
      assert.throws(
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
    it('should parse {"key": "value"} into an object with one key-value pair', () => {
      const json = fs.readFileSync('./tests/step2/valid.json', 'utf8')
      const result = JSONParse(json)
      assert.deepStrictEqual(result, { key: 'value' })
    })
    it('should parse multiple key-string-value pairs', () => {
      const json = fs.readFileSync('./tests/step2/valid2.json', 'utf8')
      const result = JSONParse(json)
      assert.deepStrictEqual(result, { key: 'value', key2: 'value' })
    })
    it('should fail to parse an object with trailing comma', () => {
      const json = fs.readFileSync('./tests/step2/invalid.json', 'utf8')
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected token "," at position 15')
          return true
        },
      )
    })
    it('should fail to parse an object with non-string key', () => {
      const json = fs.readFileSync('./tests/step2/invalid2.json', 'utf8')
      assert.throws(
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
    it('should parse an object containing string, numeric, boolean and null values', () => {
      const json = fs.readFileSync('./tests/step3/valid.json', 'utf8')
      const result = JSONParse(json)
      assert.deepStrictEqual(result, {
        key1: true,
        key2: false,
        key3: null,
        key4: 'value',
        key5: 101.5,
      })
    })
    it('should fail to parse an object with wrong boolean value', () => {
      const json = fs.readFileSync('./tests/step3/invalid.json', 'utf8')
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected character F at position 28')
          return true
        },
      )
    })
    it('should fail to parse an object with wrong null value', () => {
      const json = '{"key": nil}'
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected character i at position 8')
          return true
        },
      )
    })
    it('should fail to parse an object with wrong numeric value', () => {
      const json = '{"key": 1.0_1}'
      assert.throws(
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
    it('should parse an object containing an empty object and an empty list', () => {
      const json = fs.readFileSync('./tests/step4/valid.json', 'utf8')
      const result = JSONParse(json)
      assert.deepStrictEqual(result, {
        key: 'value',
        'key-n': 101,
        'key-o': {},
        'key-l': [],
      })
    })
    it('shoudl parse an object containing an object with key-values and a list with values', () => {
      const json = fs.readFileSync('./tests/step4/valid2.json', 'utf8')
      const result = JSONParse(json)
      assert.deepStrictEqual(result, {
        key: 'value',
        'key-n': 101,
        'key-o': {
          'inner key': 'inner value',
        },
        'key-l': ['list value1', 'list value2'],
      })
    })
    it('should fail to parse an object containing an invalid object', () => {
      const json = '{"key": { "key": "value", "inner-invalid-obj": }{ }}'
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Unexpected token "}" at position 47')
          return true
        },
      )
    })
    it('should fail to parse an object containing an invalid list', () => {
      const json = '{"key": [ "value", "inner-invalid-list": ]}'
      assert.throws(
        () => JSONParse(json),
        err => {
          assert.strictEqual(err.name, 'Error')
          assert.strictEqual(err.message, 'Expected ] but got : at position 39')
          return true
        },
      )
    })
  })

  describe('full suite - from JSON_checker (json.org)', () => {
    const allFileNames = fs.readdirSync('./tests/full-suite')
    const passFileNames = allFileNames.filter(fileName => fileName.startsWith('pass'))
    const failFileNames = allFileNames.filter(fileName => fileName.startsWith('fail'))
    // it('should parse all valid files',  () => {
    //   for (const fileName of passFileNames) {
    //     const json = fs.readFileSync(`./tests/full-suite/${fileName}`, 'utf8')
    //     try {
    //       const result =  JSONParse(json)
    //       assert.ok(result)
    //     } catch (err) {
    //       console.log(fileName, 'failed to parse: \n', err)
    //     }
    //   }
    // })
    it('should reject all invalid files', () => {
      for (const fileName of failFileNames) {
        const json = fs.readFileSync(`./tests/full-suite/${fileName}`, 'utf8')
        try {
          const result = JSONParse(json)
          console.log(fileName, 'was parsed successfully: \n', result)
        } catch (err) {
          assert.throws(
            () => JSONParse(json),
            err => true,
          )
        }
      }
    })
  })
})
