'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const API_URL = 'http://localhost:5000/api/reports';

export async function uploadReport(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Content-Type header is not set for FormData, browser/fetch handles it
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Upload failed' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Connection failed' };
  }
}

export async function getReports() {
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
    console.error("Fetch reports error:", err);
    return [];
  }
}

export async function getDownloadUrl(filePath: string) {
  // For now, return the static URL from backend
  // In production, this might call an API to get a signed URL
  return `http://localhost:5000/uploads/${filePath}`;
}
