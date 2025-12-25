'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const API_URL = 'http://localhost:5000/api/vitals';

export async function addVital(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const vitalType = formData.get('vital_type') as string
  const value = parseFloat(formData.get('value') as string)
  const unit = formData.get('unit') as string
  const recordedAt = formData.get('recorded_at') as string

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vital_type: vitalType,
        value,
        unit,
        recorded_at: recordedAt
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Failed to add vital' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Connection failed' };
  }
}

export async function getVitals() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  try {
    const res = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store' // Ensure fresh data
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (err) {
    console.error("Fetch vitals error:", err);
    return [];
  }
}
