'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const API_URL = 'http://localhost:5000/api/shares';

export async function shareReport(reportId: string, email: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ report_id: reportId, shared_with_email: email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Sharing failed' };
    }

    revalidatePath('/');
    return { success: true, share: data };
  } catch (err: any) {
    return { error: err.message || 'Connection failed' };
  }
}

export async function getMyShares() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  try {
    const res = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (err) {
    console.error("Fetch shares error:", err);
    return [];
  }
}
