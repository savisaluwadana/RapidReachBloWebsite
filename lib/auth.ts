'use client'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'contributor' | 'reader'
  avatar?: string
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  
  if (!userStr || isAuthenticated !== 'true') return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('isAuthenticated') === 'true'
}

export function isAdmin(): boolean {
  const user = getUser()
  return user?.role === 'admin'
}

export function logout(): void {
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  window.location.href = '/'
}
