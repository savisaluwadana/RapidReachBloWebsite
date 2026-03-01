'use client'

import { useState, useEffect } from 'react'
import type { UserProfile } from '@/lib/types/database'

interface Props {
  open: boolean
  user: UserProfile | null
  onClose: () => void
  onSave: (role: string) => Promise<void>
}

export default function RoleChangeModal({ open, user, onClose, onSave }: Props) {
  const [selectedRole, setSelectedRole] = useState<string>('reader')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) setSelectedRole(user.role || 'reader')
  }, [user])

  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white/5 border border-white/[0.06] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Change role for {user.full_name}</h3>
        <p className="text-xs text-gray-400 mb-4">Select a new role for this user. Roles change permissions across the site.</p>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white"
          >
            <option value="reader">Reader</option>
            <option value="contributor">Contributor</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white/[0.02] border border-white/[0.04] text-gray-300 text-sm"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setSaving(true)
              try {
                await onSave(selectedRole)
              } finally {
                setSaving(false)
              }
            }}
            className="px-4 py-2 rounded-md bg-electric-cyan text-white text-sm font-medium"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
