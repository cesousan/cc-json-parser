const { JSONLexer } = require('./json-lexer')
const { JSONParser } = require('./json-parser')

function JSONParse(jsonString) {
  const lexer = new JSONLexer(jsonString)
  const parser = new JSONParser(lexer)
  return parser.parse()
}

module.exports = {
  JSONParse,
}
