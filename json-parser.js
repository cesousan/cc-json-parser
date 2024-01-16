const { JSONLexer } = require('./json-lexer')
const { expect } = require('./json.invariant')

class JSONParser {
  /**
   *
   * @param {JSONLexer} lexer
   */
  constructor(lexer) {
    this.lexer = lexer
    this.tokenGenerator = this.lexer.generateTokens()
    this.previousToken = null
    this.currentToken = this.tokenGenerator.next()
  }

  /**
   * the main parse function
   * @returns {Promise<T extends object>}
   */
  parse() {
    return this.parseValue()
  }

  async parseValue() {
    const token = this.currentToken.value

    if (token.type === '{') {
      return this.parseObject()
    } else if (token.type === '[') {
      return this.parseArray()
    } else if (
      token.type === 'STRING' ||
      token.type === 'NUMBER' ||
      token.type === 'BOOLEAN' ||
      token.type === 'NULL'
    ) {
      this.consumeToken()
      return token.value
    }
    throw new Error(`Unexpected token "${token.value}" at position ${token.position}`)
  }

  async parseObject() {
    expect(this.currentToken, '{')
    this.consumeToken()
    let obj = {}

    while (this.currentToken.value && this.currentToken.value.type !== '}') {
      const key = await this.parseString()
      expect(this.currentToken, ':')
      this.consumeToken()
      const value = await this.parseValue()
      obj = { ...obj, [key]: value }

      if (this.currentToken.value && this.currentToken.value.type === ',') {
        this.consumeToken()
      } else if (this.currentToken.value && this.currentToken.value.type !== '}') {
        throw new Error(
          `Unexpected token "${this.currentToken.value.type}" at position ${this.currentToken.value.position}`,
        )
      }
    }
    if (this.previousToken && this.previousToken.value.type === ',') {
      throw new Error(
        `Unexpected token "${this.previousToken.value.type}" at position ${this.previousToken.value.position}`,
      )
    }
    expect(this.currentToken, '}')
    this.consumeToken()
    return obj
  }

  async parseArray() {
    expect(this.currentToken, '[')
    this.consumeToken()
    let arr = []

    while (this.currentToken.value && this.currentToken.value.type !== ']') {
      const value = await this.parseValue()
      arr = [...arr, value]

      if (this.currentToken.value && this.currentToken.value.type === ',') {
        this.consumeToken()
      } else if (this.currentToken.value && this.currentToken.value.type !== ']') {
        throw new Error(
          `Unexpected token "${this.currentToken.value.type}" at position ${this.currentToken.value.position}`,
        )
      }
    }

    expect(this.currentToken, ']')
    this.consumeToken()
    return arr
  }

  async parseString() {
    const token = this.currentToken.value

    if (token.type === 'STRING') {
      this.consumeToken()
      return token.value
    }

    throw new Error(`Expected STRING but got ${token.type} at position ${token.position}`)
  }

  consumeToken() {
    this.previousToken = this.currentToken
    this.currentToken = this.tokenGenerator.next()
  }
}

module.exports = {
  JSONParser,
}
