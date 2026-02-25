import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { fetchBanks, connectBank } from '../services/api'
import type { BankData } from '../types'

import { Landmark, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Auth() {
  const [banks, setBanks] = useState<BankData[]>([])
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [country, setCountry] = useState<string>('ES') // Default to Spain
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await fetchBanks()
        setBanks(data)
      } catch (err) {
        console.error("Failed to load banks", err)
        setError("Could not load available banks.")
      }
    }
    loadBanks()
  }, [])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!selectedBank) {
        setError("Please select a bank.")
        setLoading(false)
        return
      }

      const url = await connectBank(selectedBank, country)
      // In a real app, we would redirect: window.location.href = url
      console.log("Redirecting to:", url)
      setSuccess(true)
      
      // Simulate redirect delay
      setTimeout(() => {
          window.location.href = url
      }, 1500)

    } catch (err) {
      console.error("Connection failed", err)
      setError("Failed to initiate bank connection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Filter banks by country if needed, for now just show all
  const filteredBanks = banks.filter(b => b.country === country)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Connect your Bank</h2>
        <p className="text-muted-foreground">Securely link your financial accounts to get started.</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bank Authentication</CardTitle>
          <CardDescription>Choose your provider to authorize access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Country</label>
              <Input 
                id="country" 
                value={country} 
                onChange={(e) => {
                    setCountry(e.target.value.toUpperCase())
                    setSelectedBank('') // Reset bank selection on country change
                }}
                maxLength={2}
                placeholder="e.g. FI, DE, SE" 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bank" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Institution</label>
              <Select 
                id="bank" 
                value={selectedBank} 
                onChange={(e) => setSelectedBank(e.target.value)}
                disabled={filteredBanks.length === 0}
              >
                <option value="" disabled>Select a bank...</option>
                {filteredBanks.map((bank) => (
                  <option key={bank.name} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </Select>
              {filteredBanks.length === 0 && (
                  <p className="text-xs text-muted-foreground">No banks found for this country code.</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
               <div className="flex items-center gap-2 p-3 text-sm text-emerald-600 bg-emerald-50 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                Redirecting to bank login...
              </div>
            )}
             <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? "Connecting..." : (
                    <>
                    Connect Account <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
            <p className="text-xs text-center text-muted-foreground flex items-center gap-1">
                <Landmark className="h-3 w-3" /> 
                Bank-level security encryption
            </p>
        </CardFooter>
      </Card>
    </div>
  )
}
