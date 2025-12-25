'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = 'http://localhost:5000/api/auth';

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Login failed' }
    }

    const cookieStore = await cookies();
    cookieStore.set('token', data.token, { secure: true, httpOnly: true, path: '/' });
    cookieStore.set('user_id', data.user.id.toString(), { secure: true, httpOnly: true, path: '/' });
    cookieStore.set('user_name', data.user.full_name, { secure: true, httpOnly: true, path: '/' });

  } catch (err: any) {
    return { error: err.message || 'Connection failed' }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Signup failed' }
    }

    // Auto login after signup
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok) {
      const cookieStore = await cookies();
      cookieStore.set('token', loginData.token, { secure: true, httpOnly: true, path: '/' });
      cookieStore.set('user_id', loginData.user.id.toString(), { secure: true, httpOnly: true, path: '/' });
      cookieStore.set('user_name', loginData.user.full_name, { secure: true, httpOnly: true, path: '/' });
    }

  } catch (err: any) {
    return { error: err.message || 'Connection failed' }
  }

  redirect('/')
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('token')
  cookieStore.delete('user_id')
  cookieStore.delete('user_name')
  redirect('/auth/login')
}
