const { JSONLexer } = require('./json-lexer')
const { expect } = require('./json.invariant')

class JSONParser {
  /**
   *
   * @param {JSONLexer} lexer
   */
  constructor(lexer) {
    this.getCurrentTokens = getNextToken(lexer.generateTokens())
    this.consumeToken()
  }

  /**
   * the main parse function
   * @returns {T extends object}
   */
  parse() {
    return this.parseValue()
  }

  parseValue() {
    const token = this.currentToken

    if (token.type === 'OPEN_BRACE') {
      return this.parseObject()
    } else if (token.type === 'OPEN_BRACKET') {
      return this.parseArray()
    } else if (
      token.type === 'STRING' ||
      token.type === 'NUMBER' ||
      token.type === 'BOOLEAN' ||
      token.type === 'NULL'
    ) {
      this.consumeToken(this.currentToken)
      return token.value
    }
    throw new Error(`Unexpected token "${token.value}" at position ${token.position}`)
  }

  parseObject() {
    expect.is(this.currentToken, 'OPEN_BRACE')
    this.consumeToken(this.currentToken)
    let obj = {}
    while (this.currentToken.type && this.currentToken.type !== 'CLOSE_BRACE') {
      const key = this.parseString()
      expect.is(this.currentToken, 'COLON')
      this.consumeToken(this.currentToken)
      const value = this.parseValue()
      obj = { ...obj, [key]: value }

      if (this.currentToken && this.currentToken.type === 'COMMA') {
        this.consumeToken(this.currentToken)
      } else {
        expect.is(this.currentToken, 'CLOSE_BRACE')
      }
    }
    expect.isNot(this.previousToken, 'COMMA')
    expect.is(this.currentToken, 'CLOSE_BRACE')
    this.consumeToken(this.currentToken)
    return obj
  }

  parseArray() {
    expect.is(this.currentToken, 'OPEN_BRACKET')
    this.consumeToken(this.currentToken)
    let arr = []

    while (this.currentToken && this.currentToken.type !== 'CLOSE_BRACKET') {
      const value = this.parseValue()
      arr.push(value)

      if (this.currentToken && this.currentToken.type === 'COMMA') {
        this.consumeToken(this.currentToken)
      } else {
        expect.is(this.currentToken, 'CLOSE_BRACKET')
      }
    }

    expect.is(this.currentToken, 'CLOSE_BRACKET')
    this.consumeToken(this.currentToken)
    return arr
  }

  parseString() {
    const token = this.currentToken

    if (token.type === 'STRING') {
      this.consumeToken(this.currentToken)
      return token.value
    }

    throw new Error(`Expected STRING but got ${token.type} at position ${token.position}`)
  }

  consumeToken(token = null) {
    const { previousToken, currentToken } = this.getCurrentTokens(token)
    this.previousToken = previousToken
    this.currentToken = currentToken
  }
}
/**
 *
 * @param {IterableIterator<{type: String, value: String|Number|Boolean|null, position: Number, endPosition: Number}>} tokenGenerator
 * @returns any
 */
function getNextToken(tokenGenerator) {
  return getTokens
  /**
   *
   * @param {type: String, value: String|Number|Boolean|null, position: Number, endPosition: Number} currentToken
   */
  function getTokens(currentToken = null) {
    const previousToken = currentToken
    const newToken = tokenGenerator.next()?.value
    return { previousToken, currentToken: newToken }
  }
}

module.exports = {
  JSONParser,
}
