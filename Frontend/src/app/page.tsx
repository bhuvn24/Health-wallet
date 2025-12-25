import { getReports } from './reports/actions'
import { getVitals } from './vitals/actions'
import { getMyShares } from './sharing/actions'
import { HealthWalletClient } from '@/components/health-wallet-client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HealthWalletPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/auth/login')
  }

  // Fetch data from real backend
  const [reports, vitals, shares] = await Promise.all([
    getReports(),
    getVitals(),
    getMyShares(),
  ])

  // Get user info from cookies
  const user = {
    id: cookieStore.get('user_id')?.value || '1',
    email: 'user@example.com',
    full_name: cookieStore.get('user_name')?.value || 'User',
  }

  return (
    <HealthWalletClient
      initialReports={reports || []}
      initialVitals={vitals || []}
      initialShares={shares || []}
      user={user as any}
    />
  )
}
