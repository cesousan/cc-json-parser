function getCharFromType(type) {
  return {
    OPEN_BRACE: '{',
    CLOSE_BRACE: '}',
    OPEN_BRACKET: '[',
    CLOSE_BRACKET: ']',
    COMMA: ',',
    COLON: ':',
    STRING: type,
  }[type]
}

module.exports = {
  getCharFromType,
}
