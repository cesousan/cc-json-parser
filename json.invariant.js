const { getCharFromType } = require('./json-parser.utils')

function is(token, expectedType) {
  if (token.type === expectedType) {
    return
  }
  throw new Error(
    `Expected ${getCharFromType(expectedType)} but got ${
      token.type ? getCharFromType(token.type) : 'EOF'
    } at position ${token.position}`,
  )
}

function isNot(token, expectedType) {
  if (token.type !== expectedType) {
    return
  }
  throw new Error(
    `Unexpected token "${token.type ? getCharFromType(token.type) : 'EOF'}" at position ${token.position}`,
  )
}

module.exports = {
  expect: {
    is,
    isNot,
  },
}
