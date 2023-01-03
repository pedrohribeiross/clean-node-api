const validator = require('validator')
const { MissingParamError } = require('../errors')
const EmailValidator = require('./email-validator')

const makeSut = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  it('should return true if validator returns true', () => {
    const sut = makeSut()
    const isEmailValid = sut.isValid('valid_email@mail.com')

    expect(isEmailValid).toBe(true)
  })

  it('should return false if validator returns false', () => {
    validator.isEmailValid = false
    const sut = makeSut()
    const isEmailValid = sut.isValid('invalid_email@mail.com')

    expect(isEmailValid).toBe(false)
  })

  it('should call validator if correct email', () => {
    const sut = makeSut()
    sut.isValid('any_email@mail.com')

    expect(validator.email).toBe('any_email@mail.com')
  })

  it('should throw if no email is provided', async () => {
    const sut = makeSut()

    await expect(sut.isValid).toThrow(new MissingParamError('email'))
  })
})
