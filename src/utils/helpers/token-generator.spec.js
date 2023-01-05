class TokenGenerator {
  generate(id) {
    return null
  }
}

describe('Token Generator', () => {
  it('should return null if JWT returns null', async () => {
    const sut = new TokenGenerator()
    const token = await sut.generate('any_id')

    expect(token).toBeNull()
  })
})
