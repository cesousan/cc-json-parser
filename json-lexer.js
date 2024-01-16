class JSONLexer {
  constructor(jsonString) {
    this.jsonString = jsonString
    this.position = 0
  }

  *generateTokens() {
    while (this.position < this.jsonString.length) {
      const token = this.getNextToken()
      if (token) {
        yield token
      }
    }
  }

  getNextToken() {
    this.skipWhitespace()

    if (this.position >= this.jsonString.length) {
      return null
    }

    const currentChar = this.jsonString[this.position]

    if (
      currentChar === '{' ||
      currentChar === '}' ||
      currentChar === '[' ||
      currentChar === ']' ||
      currentChar === ',' ||
      currentChar === ':'
    ) {
      this.position++
      return { type: currentChar, value: currentChar, position: this.position - 1 }
    } else if (currentChar === '"') {
      return this.readString()
    } else if (currentChar === '-' || /\d/.test(currentChar)) {
      return this.readNumber()
    } else if (currentChar === 't' || currentChar === 'f') {
      return this.readBoolean()
    } else if (currentChar === 'n') {
      return this.readNull()
    }

    throw new Error(`Unexpected character ${currentChar} at position ${this.position}`)
  }

  readString() {
    const start = this.position
    this.position++ // Skip the opening double quote '"'
    let result = ''

    while (
      this.position < this.jsonString.length &&
      (this.jsonString[this.position] !== '"' ||
        (this.jsonString[this.position] === '"' && this.jsonString[this.position - 1] === '\\'))
    ) {
      result += this.jsonString[this.position]
      this.position++
    }

    this.position++ // Skip the closing double quote '"'
    return { type: 'STRING', value: result, position: start }
  }

  readNumber() {
    const start = this.position
    let result = ''
    while (this.position < this.jsonString.length && /\d|\.|e|E|\-|\+/.test(this.jsonString[this.position])) {
      result += this.jsonString[this.position]
      this.position++
    }
    return { type: 'NUMBER', value: parseFloat(result), position: start }
  }

  readBoolean() {
    const start = this.position
    const value = this.jsonString[this.position] === 't' ? 'true' : 'false'
    for (let i = 0; i < value.length; i++) {
      if (this.jsonString[this.position + i] !== value[i]) {
        throw new Error(`Unexpected character at position ${this.position}`)
      }
    }

    this.position += value.length
    return { type: 'BOOLEAN', value: value === 'true', position: start }
  }

  readNull() {
    const start = this.position
    const value = 'null'
    for (let i = 0; i < value.length; i++) {
      if (this.jsonString[this.position + i] !== value[i]) {
        throw new Error(`Unexpected character ${this.jsonString[this.position + i]} at position ${this.position}`)
      }
    }

    this.position += value.length
    return { type: 'NULL', value: null, position: start }
  }

  skipWhitespace() {
    while (this.position < this.jsonString.length && /\s/.test(this.jsonString[this.position])) {
      this.position++
    }
  }
}

module.exports = { JSONLexer }
