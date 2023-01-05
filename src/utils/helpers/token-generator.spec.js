const jwt = require('jsonwebtoken')
const { MissingParamError } = require('../errors')

class TokenGenerator {
  constructor(secret) {
    this.secret = secret
  }

  async generate(id) {
    if (!this.secret) {
      throw new MissingParamError('secret')
    }
    return jwt.sign(id, this.secret)
  }
}

const makeSut = () => {
  return new TokenGenerator('secret')
}

describe('Token Generator', () => {
  it('should return null if JWT returns null', async () => {
    const sut = makeSut()
    jwt.token = null
    const token = await sut.generate('any_id')

    expect(token).toBeNull()
  })

  it('should return a token if JWT returns token', async () => {
    const sut = makeSut()
    const token = await sut.generate('any_id')

    expect(token).toBe(jwt.token)
  })

  it('should call JWT with correct values', async () => {
    const sut = makeSut()
    await sut.generate('any_id')

    expect(jwt.id).toBe('any_id')
    expect(jwt.secret).toBe(sut.secret)
  })

  it('should throw if no secret is provided', async () => {
    const sut = new TokenGenerator()
    const promise = sut.generate('any_id')

    await expect(promise).rejects.toThrow(new MissingParamError('secret'))
  })
})
