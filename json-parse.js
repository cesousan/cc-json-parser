const { JSONLexer } = require('./json-lexer')
const { JSONParser } = require('./json-parser')

async function JSONParse(jsonString) {
  const lexer = new JSONLexer(jsonString)
  const parser = new JSONParser(lexer)
  const parsedObject = await parser.parse()
  return parsedObject
}

module.exports = {
  JSONParse,
}
