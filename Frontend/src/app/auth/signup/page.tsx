'use client'

import { useState } from 'react'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl shadow-slate-200">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Start managing your health data securely</CardDescription>
          </div>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm border border-rose-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input name="full_name" type="text" placeholder="John Doe" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="name@example.com" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" required className="rounded-xl" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 rounded-xl h-12 text-lg font-semibold shadow-lg shadow-rose-100" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </Button>
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-rose-500 font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
