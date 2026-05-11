export class DataWithResponseInit<D> {
  type: string
  data: D
  init: ResponseInit | null

  constructor(data: D, init?: ResponseInit) {
    this.type = 'data'
    this.data = data
    this.init = init ?? null
  }
}

type LowerCaseFormMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'
type UpperCaseFormMethod = Uppercase<LowerCaseFormMethod>

export type HTMLFormMethod = LowerCaseFormMethod | UpperCaseFormMethod
