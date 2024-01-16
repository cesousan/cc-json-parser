function expect(currentToken, expectedType) {
  const token = currentToken.value

  if (token && token.type === expectedType) {
    return
  }

  throw new Error(
    `Expected ${expectedType} but got ${token ? token.type : 'EOF'} at position ${token ? token.position : ''}`,
  )
}

module.exports = {
  expect,
}
