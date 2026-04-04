import { TestContext } from './test-context'

describe('TestContext', () => {
  let ctx: TestContext

  beforeAll(async () => {
    ctx = await TestContext.create()
  }, 60_000)

  afterAll(async () => {
    await ctx?.destroy()
  })

  afterEach(async () => {
    await ctx.clean()
  })

  it('should seed an account', async () => {
    const account = await ctx.seedAccount({ name: 'Checking' })

    expect(account.id).toBeDefined()
    expect(account.name).toBe('Checking')
  })

  it('should seed a transaction linked to an account', async () => {
    const account = await ctx.seedAccount()
    const tx = await ctx.seedTransaction(account.id!, {
      amount: -50,
      description: 'Coffee',
    })

    expect(tx.id).toBeDefined()
    expect(tx.amount).toBe(-50)
    expect(tx.accountId).toBe(account.id)
  })

  it('should provide working repositories', async () => {
    const account = await ctx.seedAccount()
    await ctx.seedTransaction(account.id!)
    await ctx.seedTransaction(account.id!, { amount: 200 })

    const all = await ctx.transactions.find()

    expect(all).toHaveLength(2)
  })

  it('should clean between tests', async () => {
    const all = await ctx.transactions.find()

    expect(all).toHaveLength(0)
  })
})
