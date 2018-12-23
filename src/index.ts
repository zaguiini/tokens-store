export type Token = string | null

export interface Tokens {
  accessToken: Token
  refreshToken: Token
}

export type SetterHandler = (token: Token) => Promise<any>
export type GetterHandler = () => Promise<Token>
export type Subscriber = (tokens: Tokens) => void

export interface TokenHandlers {
  setAccessToken: SetterHandler
  getAccessToken: GetterHandler
  setRefreshToken: SetterHandler
  getRefreshToken: GetterHandler
}

class TokensStore {
  private subscribers: Array<Subscriber>

  setAccessToken: SetterHandler
  getAccessToken: GetterHandler
  setRefreshToken: SetterHandler
  getRefreshToken: GetterHandler

  constructor(handlers: TokenHandlers) {
    this.subscribers = []

    this.getAccessToken = handlers.getAccessToken
    this.setAccessToken = this.createPublishablePromise(handlers.setAccessToken)

    this.getRefreshToken = handlers.getRefreshToken
    this.setRefreshToken = this.createPublishablePromise(
      handlers.setRefreshToken
    )
  }

  private createPublishablePromise(promise: SetterHandler): SetterHandler {
    return (token) => new Promise(async (resolve, reject) => {
      try {
        await promise(token)
        const tokens = await this.getTokens()

        this.subscribers.forEach(fn => fn(tokens)) // publish changes
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  subscribe(fn: Subscriber) {
    this.subscribers.push(fn)

    return () => {
      this.subscribers.splice(this.subscribers.indexOf(fn), 1)
    }
  }

  async getTokens(): Promise<Tokens> {
    return {
      accessToken: await this.getAccessToken(),
      refreshToken: await this.getRefreshToken(),
    }
  }
}

export default TokensStore
