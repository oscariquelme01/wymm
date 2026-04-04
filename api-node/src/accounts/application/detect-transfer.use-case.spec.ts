import { TestContext } from 'src/test/test-context'
import { DetectTransferUseCase } from './detect-transfer.use-case'
import { Transaction } from 'src/transactions/domain/transaction.entity'

describe('DetectTransferUseCase', () => {
  let ctx: TestContext
  let useCase: DetectTransferUseCase

  beforeAll(async () => {
    ctx = await TestContext.create()
    useCase = new DetectTransferUseCase(ctx.transactions, ctx.accounts)
  }, 60_000)

  afterAll(async () => {
    await ctx?.destroy()
  })

  afterEach(async () => {
    await ctx.clean()
  })

  async function reload(id: string): Promise<Transaction | null> {
    return ctx.transactions.findOneBy({ id } as any)
  }

  describe('IBAN-based detection', () => {
    it('should link two transactions when counterpart IBAN matches a known account', async () => {
      const accountA = await ctx.seedAccount({
        name: 'Checking',
        iban: 'DE1111',
      })
      const accountB = await ctx.seedAccount({
        name: 'Savings',
        iban: 'DE2222',
      })

      const outgoing = await ctx.seedTransaction(accountA.id!, {
        amount: 500,
        date: new Date('2025-03-15'),
        type: 'EXPENSE',
      })
      const incoming = await ctx.seedTransaction(accountB.id!, {
        amount: 500,
        date: new Date('2025-03-15'),
        type: 'INCOME',
      })

      await useCase.execute(outgoing, 'DE2222')

      const reloadedOutgoing = await reload(outgoing.id!)
      const reloadedIncoming = await reload(incoming.id!)

      expect(reloadedOutgoing!.type).toBe('TRANSFER')
      expect(reloadedIncoming!.type).toBe('TRANSFER')
      expect(reloadedOutgoing!.transferGroupId).toBeDefined()
      expect(reloadedOutgoing!.transferGroupId).toBe(
        reloadedIncoming!.transferGroupId
      )
    })

    it('should do nothing when counterpart IBAN does not belong to any user account', async () => {
      const account = await ctx.seedAccount({ iban: 'DE1111' })
      const tx = await ctx.seedTransaction(account.id!, {
        amount: -200,
        type: 'EXPENSE',
      })

      await useCase.execute(tx, 'UNKNOWN_IBAN')

      const reloaded = await reload(tx.id!)
      expect(reloaded!.type).toBe('EXPENSE')
      expect(reloaded!.transferGroupId).toBeNull()
    })
  })

  describe('fallback amount+date detection', () => {
    it('should link transactions with opposite amounts within 2 days', async () => {
      const accountA = await ctx.seedAccount({ iban: 'DE1111' })
      const accountB = await ctx.seedAccount({ iban: 'DE2222' })

      const outgoing = await ctx.seedTransaction(accountA.id!, {
        amount: 300,
        date: new Date('2025-03-15'),
        type: 'EXPENSE',
      })
      const incoming = await ctx.seedTransaction(accountB.id!, {
        amount: 300,
        date: new Date('2025-03-16'),
        type: 'INCOME',
      })

      await useCase.execute(outgoing)

      const reloadedOutgoing = await reload(outgoing.id!)
      const reloadedIncoming = await reload(incoming.id!)

      expect(reloadedOutgoing!.type).toBe('TRANSFER')
      expect(reloadedIncoming!.type).toBe('TRANSFER')
      expect(reloadedOutgoing!.transferGroupId).toBe(
        reloadedIncoming!.transferGroupId
      )
    })

    it('should NOT link when the opposite amount is on the same account', async () => {
      const account = await ctx.seedAccount({ iban: 'DE1111' })

      const tx1 = await ctx.seedTransaction(account.id!, {
        amount: 100,
        date: new Date('2025-03-15'),
        type: 'EXPENSE',
      })
      await ctx.seedTransaction(account.id!, {
        amount: 100,
        date: new Date('2025-03-15'),
        type: 'INCOME',
      })

      await useCase.execute(tx1)

      const reloaded = await reload(tx1.id!)
      expect(reloaded!.type).toBe('EXPENSE')
      expect(reloaded!.transferGroupId).toBeNull()
    })

    it('should NOT link when the date gap exceeds 2 days', async () => {
      const accountA = await ctx.seedAccount({ iban: 'DE1111' })
      const accountB = await ctx.seedAccount({ iban: 'DE2222' })

      const outgoing = await ctx.seedTransaction(accountA.id!, {
        amount: 100,
        date: new Date('2025-03-10'),
        type: 'EXPENSE',
      })
      await ctx.seedTransaction(accountB.id!, {
        amount: 100,
        date: new Date('2025-03-20'),
        type: 'INCOME',
      })

      await useCase.execute(outgoing)

      const reloaded = await reload(outgoing.id!)
      expect(reloaded!.type).toBe('EXPENSE')
      expect(reloaded!.transferGroupId).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should not link anything when no candidate exists', async () => {
      const account = await ctx.seedAccount({ iban: 'DE1111' })
      const tx = await ctx.seedTransaction(account.id!, {
        amount: 999,
        date: new Date('2025-03-15'),
        type: 'EXPENSE',
      })

      await useCase.execute(tx)

      const reloaded = await reload(tx.id!)
      expect(reloaded!.type).toBe('EXPENSE')
      expect(reloaded!.transferGroupId).toBeNull()
    })
  })
})
