const JSON_SEPARATORS = new Set(['{', '}', '[', ']', ',', ':'])
/**
 *
 * @param {String} c the examined character
 * @returns {boolean} true if the character is the start of a null value
 */
function isNullChar(currentChar) {
  return currentChar === 'n'
}

/**
 *
 * @param {String} c the examined character
 * @returns {boolean} true if the character is the start of a boolean (i.e. t or f)
 */
function isBoolChar(c) {
  return c === 't' || c === 'f'
}

/**
 *
 * @param {String} c the examined character
 * @returns {boolean} true if the character is a JSON separator (i.e. {, }, [, ], , or :)
 */
function isJSONSeparator(c) {
  return JSON_SEPARATORS.has(c)
}
/**
 *
 * @param {String} c the examined character
 * @returns {boolean} true if the character is a string delimiter (i.e. ")
 */
function isStringDelimiter(c) {
  return c === '"'
}
/**
 *
 * @param {String} c the examined character
 * @returns {boolean} true if the character is the start of a number (i.e. 0-9, -, ., e, E, +)
 */
function isNumberChar(c) {
  return c === '-' || /\d/.test(c)
}
/**
 *
 * @param {String} str the string to check
 * @param {number} position the position of the pointer
 * @returns true is the position is at the end of the string (or beyond)
 */
function isEndOfString(str, position) {
  return position >= str.length
}
/**
 *
 * @param {String} str the string to check
 * @param {number} position the position of the pointer
 * @returns true if the character at position is a string delimiter and is escaped
 */
function isEscapedStringDelimiter(str, position) {
  return isStringDelimiter(str[position]) && str[position - 1] === '\\'
}

function getTypeFromChar(c) {
  return {
    '{': 'OPEN_BRACE',
    '}': 'CLOSE_BRACE',
    '[': 'OPEN_BRACKET',
    ']': 'CLOSE_BRACKET',
    ',': 'COMMA',
    ':': 'COLON',
  }[c]
}

/**
 *
 * @param {String} jsonString the json string to lex
 * @param {number} currentPosition the current position of the pointer
 * @returns {{type: String, value: String, position: number, endPosition: number}} the lexed separator.
 */
function readJSONSeparator(jsonString, currentPosition) {
  const currentChar = jsonString[currentPosition]
  const type = getTypeFromChar(currentChar)
  return { type, value: currentChar, position: currentPosition, endPosition: currentPosition + 1 }
}

/**
 *
 * @param {String} jsonString the json string to lex
 * @param {number} currentPosition the position of the pointer
 * @returns {{type: 'STRING', value: String, position: number, endPosition: number}} the lexed string.
 * The endPosition is the position of the pointer after the string has been read
 * The position is the position of the pointer before the string has been read
 */
function readString(jsonString, currentPosition) {
  const start = currentPosition
  currentPosition++ // Skip the opening double quote '"'
  let result = ''
  while (
    !isEndOfString(jsonString, currentPosition) &&
    (!isStringDelimiter(jsonString[currentPosition]) || isEscapedStringDelimiter(jsonString, currentPosition))
  ) {
    result += jsonString[currentPosition]
    currentPosition++
  }

  currentPosition++ // Skip the closing double quote '"'
  return { type: 'STRING', value: result, position: start, endPosition: currentPosition }
}

/**
 *
 * @param {String} jsonString the json string to lex
 * @param {number} currentPosition the position of the pointer
 * @returns {{type: 'NUMBER', value: Number, position: number, endPosition: number}} the lexed number.
 * The endPosition is the position of the pointer after the number has been read
 * The position is the position of the pointer before the number has been read
 */
function readNumber(jsonString, currentPosition) {
  const start = currentPosition
  let result = ''
  while (currentPosition < jsonString.length && /\d|\.|e|E|\-|\+/.test(jsonString[currentPosition])) {
    result += jsonString[currentPosition]
    currentPosition++
  }
  return { type: 'NUMBER', value: parseFloat(result), position: start, endPosition: currentPosition }
}

/**
 *
 * @param {String} jsonString the json string to lex
 * @param {number} currentPosition the position of the pointer
 * @returns {{type: 'BOOLEAN', value: Boolean, position: number, endPosition: number}} the lexed boolean.
 * The endPosition is the position of the pointer after the boolean has been read
 * The position is the position of the pointer before the boolean has been read
 */
function readBoolean(jsonString, currentPosition) {
  const start = currentPosition
  const value = jsonString[currentPosition] === 't' ? 'true' : 'false'
  for (let i = 0; i < value.length; i++) {
    if (jsonString[currentPosition + i] !== value[i]) {
      throw new Error(`Unexpected character ${jsonString[currentPosition + i]} at position ${currentPosition}`)
    }
  }
  currentPosition += value.length
  return { type: 'BOOLEAN', value: value === 'true', position: start, endPosition: currentPosition }
}
/**
 *
 * @param {String} jsonString the json string to lex
 * @param {number} currentPosition the position of the pointer
 * @returns {{type: 'NULL', value: null, position: number, endPosition: number}} the lexed null.
 * The endPosition is the position of the pointer after the boolean has been read
 * The position is the position of the pointer before the boolean has been read
 */
function readNull(jsonString, currentPosition) {
  const start = currentPosition
  const value = 'null'
  for (let i = 0; i < value.length; i++) {
    if (jsonString[currentPosition + i] !== value[i]) {
      throw new Error(`Unexpected character ${jsonString[currentPosition + i]} at position ${currentPosition}`)
    }
  }

  currentPosition += value.length
  return { type: 'NULL', value: null, position: start, endPosition: currentPosition }
}

function skipWhitespace(jsonString, currentPosition) {
  while (currentPosition < jsonString.length && /\s/.test(jsonString[currentPosition])) {
    currentPosition++
  }
  return currentPosition
}

function getReadFunctionFromType(type, position) {
  switch (type) {
    case 'JSON_SEPARATOR':
      return readJSONSeparator
    case 'STRING':
      return readString
    case 'NUMBER':
      return readNumber
    case 'BOOLEAN':
      return readBoolean
    case 'NULL':
      return readNull
    default:
      throw new Error(`Unexpected token type ${type} at position ${position}`)
  }
}

function getTypeFromJSONString(jsonString, position) {
  const char = jsonString[position]
  if (isJSONSeparator(char)) {
    return 'JSON_SEPARATOR'
  }
  if (isStringDelimiter(char)) {
    return 'STRING'
  }
  if (isNumberChar(char)) {
    return 'NUMBER'
  }
  if (isBoolChar(char)) {
    return 'BOOLEAN'
  }
  if (isNullChar(char)) {
    return 'NULL'
  }
  if (char === undefined) {
    return
  }
  throw new Error(`Unexpected character ${char} at position ${position}`)
}
module.exports = {
  getTypeFromJSONString,
  getReadFunctionFromType,
  skipWhitespace,
}
