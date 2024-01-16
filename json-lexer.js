const { skipWhitespace, getTypeFromJSONString, getReadFunctionFromType } = require('./json-lexer.utils')

class JSONLexer {
  /**
   * @type {JSONReader}
   */
  #reader = null
  constructor(jsonString) {
    this.jsonString = jsonString
    this.position = 0
    this.#reader = new JSONReader(jsonString)
  }
  /**
   * @returns {IterableIterator<{type: String, value: String|Number|Boolean|null, position: Number, endPosition: Number}>}
   */
  *generateTokens() {
    while (!this.#reader.isEof) {
      const token = this.#getNextToken()
      if (token) {
        yield token
      }
    }
  }

  #getNextToken() {
    if (this.#reader.isEof) {
      return null
    }
    return this.#reader.scan().token
  }
}

class JSONReader {
  #type = null
  token = { type: null, value: null, position: 0, endPosition: 0 }

  get isEof() {
    return this.token.position >= this.jsonString.length
  }
  constructor(jsonString) {
    this.jsonString = jsonString
  }

  scan() {
    return this.#getType().#read()
  }

  #getType() {
    this.token.endPosition = skipWhitespace(this.jsonString, this.token.endPosition)
    const type = getTypeFromJSONString(this.jsonString, this.token.endPosition)
    if (type) {
      this.#type = type
    }
    return this
  }
  #read() {
    const readFn = getReadFunctionFromType(this.#type, this.token.endPosition)
    this.token = readFn(this.jsonString, this.token.endPosition)
    return { token: this.token }
  }
}

module.exports = { JSONLexer }
