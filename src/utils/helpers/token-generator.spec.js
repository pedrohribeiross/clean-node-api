const jwt = require('jsonwebtoken')
const TokenGenerator = require('./token-generator')
const { MissingParamError } = require('../errors')

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

  it('should throw if no id is provided', async () => {
    const sut = makeSut()
    const promise = sut.generate()

    await expect(promise).rejects.toThrow(new MissingParamError('id'))
  })
})
