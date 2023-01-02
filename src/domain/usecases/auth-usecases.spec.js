const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecases')

const makeSut = () => {
  class EncrypterSpy {
    async compare(password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
    }
  }

  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email

      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const encrypterSpy = new EncrypterSpy()

  loadUserByEmailRepositorySpy.user = {
    password: 'hashed_password'
  }

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy)

  return { sut, loadUserByEmailRepositorySpy, encrypterSpy }
}

describe('Auth UseCase', () => {
  it('should throw if no email is provided', async () => {
    const { sut } = makeSut()

    const promise = sut.auth()
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  it('should throw if no password is provided', async () => {
    const { sut } = makeSut()

    const promise = sut.auth('any_email@mail.com')
    await expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  it('should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()

    await sut.auth('any_email@mail.com', 'any_password')
    await expect(loadUserByEmailRepositorySpy.email).toBe('any_email@mail.com')
  })

  it('should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()

    const promise = sut.auth('any_email@mail.com', 'any_password')
    await expect(promise).rejects.toThrow()
  })

  it('should throw if no LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({})

    const promise = sut.auth('any_email@mail.com', 'any_password')
    await expect(promise).rejects.toThrow()
  })

  it('should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null

    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  it('should return null if an invalid password is provided', async () => {
    const { sut } = makeSut()

    const accessToken = await sut.auth(
      'valid_email@mail.com',
      'invalid_password'
    )
    expect(accessToken).toBeNull()
  })

  it('should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()

    await sut.auth('valid_email@mail.com', 'any_password')
    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(
      loadUserByEmailRepositorySpy.user.password
    )
  })
})
