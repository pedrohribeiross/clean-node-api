const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecases')

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate(userId) {
      this.userId = userId

      return this.accessToken
    }
  }

  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'

  return tokenGeneratorSpy
}

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare(password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword

      return this.isValid
    }
  }

  const encrypterSpy = new EncrypterSpy()

  encrypterSpy.isValid = true
  return encrypterSpy
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email

      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()

  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }

  return loadUserByEmailRepositorySpy
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()

  const sut = new AuthUseCase(
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy
  )

  return { sut, loadUserByEmailRepositorySpy, encrypterSpy, tokenGeneratorSpy }
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
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
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

  it('should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()

    await sut.auth('valid_email@mail.com', 'valid_password')
    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })
})
