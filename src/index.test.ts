import TokenStore, { TokenHandlers } from './index'

describe('TokenStore', () => {
  let handlers: TokenHandlers
  let accessToken: string | null
  let refreshToken: string | null

  beforeEach(() => {
    handlers = {
      setAccessToken: token => {
        accessToken = token
        return Promise.resolve()
      },
      setRefreshToken: token => {
        refreshToken = token
        return Promise.resolve()
      },
      getAccessToken: () => Promise.resolve(accessToken),
      getRefreshToken: () => Promise.resolve(refreshToken),
    }

    accessToken = 'mockAccessToken'
    refreshToken = 'mockRefreshToken'
  })

  it('should construct without any errors', () => {
    new TokenStore(handlers)
  })

  it('should not set token', async () => {
    const e = new Error('I am an error!')
    handlers.setAccessToken = () => Promise.reject(e)

    const store = new TokenStore(handlers)

    let error

    try {
      await store.setAccessToken('123')
    } catch (e) {
      error = e
    }

    expect(error).toBe(e)
  })

  it('should retrieve tokens', async () => {
    const store = new TokenStore(handlers)

    expect(await store.getTokens()).toEqual({
      accessToken,
      refreshToken,
    })
  })

  it('should observe for new values', async () => {
    const observer = jest.fn()

    const store = new TokenStore(handlers)
    store.subscribe(observer)

    const newAccessToken = 'newAccessToken'
    await store.setAccessToken(newAccessToken)

    expect(observer).toHaveBeenCalled()
    expect(accessToken).toBe(newAccessToken)

    const newRefreshToken = 'newRefreshToken'
    await store.setRefreshToken(newRefreshToken)

    expect(observer).toHaveBeenCalled()
    expect(refreshToken).toBe(newRefreshToken)
  })

  it('should unsubscribe from observer', async () => {
    const observer = jest.fn()

    const store = new TokenStore(handlers)
    const unsubscribe = store.subscribe(observer)
    unsubscribe()

    const newAccessToken = 'newAccessToken'
    await store.setAccessToken(newAccessToken)

    expect(observer).not.toHaveBeenCalled()
  })
})
