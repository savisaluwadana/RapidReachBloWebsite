'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Save, Eye, Plus, Trash2, GripVertical, ArrowLeft, Loader2 } from 'lucide-react'
import { getLearningPathById, updateLearningPath } from '@/lib/actions/learning-paths'
import type { LearningPath } from '@/lib/actions/learning-paths'

interface Module {
  title: string
  description: string
  post_ids: string[]
  order: number
}

export default function EditLearningPath() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [path, setPath] = useState<LearningPath | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('kubernetes')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [prerequisites, setPrerequisites] = useState('')
  const [learningOutcomes, setLearningOutcomes] = useState('')
  const [modules, setModules] = useState<Module[]>([{ title: '', description: '', post_ids: [], order: 1 }])
  const [isPublished, setIsPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  const categories = [
    { label: 'Kubernetes', value: 'kubernetes' },
    { label: 'Terraform', value: 'terraform' },
    { label: 'CI/CD', value: 'cicd' },
    { label: 'Security', value: 'security' },
    { label: 'Platform Engineering', value: 'platform-engineering' },
    { label: 'Observability', value: 'observability' },
    { label: 'AWS', value: 'aws' },
    { label: 'Azure', value: 'azure' },
    { label: 'GCP', value: 'gcp' },
    { label: 'Docker', value: 'docker' },
    { label: 'Monitoring', value: 'monitoring' },
  ]

  // Load on mount
  useEffect(() => {
    if (!id) return
    getLearningPathById(id)
      .then(data => {
        if (!data) { setError('Learning path not found.'); return }
        setPath(data)
        setTitle(data.title)
        setDescription(data.description)
        setCategory(data.category)
        setDifficulty(data.difficulty)
        setEstimatedDuration(data.estimated_duration ? String(data.estimated_duration) : '')
        setCoverImage(data.cover_image_url ?? '')
        setPrerequisites((data.prerequisites ?? []).join('\n'))
        setLearningOutcomes((data.learning_outcomes ?? []).join('\n'))
        setModules(data.modules?.length ? data.modules : [{ title: '', description: '', post_ids: [], order: 1 }])
        setIsPublished(data.is_published)
        setFeatured(data.featured)
      })
      .catch(() => setError('Failed to load learning path.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const addModule = () =>
    setModules(prev => [...prev, { title: '', description: '', post_ids: [], order: prev.length + 1 }])

  const removeModule = (index: number) => {
    if (modules.length <= 1) return
    setModules(prev => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i + 1 })))
  }

  const updateModule = (index: number, field: keyof Module, value: string) => {
    setModules(prev => {
      const updated = [...prev]
      ;(updated[index] as any)[field] = value
      return updated
    })
  }

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { setError('Title is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    if (modules.some(m => !m.title.trim())) { setError('All modules must have a title'); return }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateLearningPath(id, {
        title: title.trim(),
        slug: generateSlug(title),
        description: description.trim(),
        cover_image_url: coverImage || undefined,
        difficulty,
        estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        category,
        modules: modules.map(m => ({
          title: m.title.trim(),
          description: m.description.trim(),
          post_ids: m.post_ids,
          order: m.order,
        })),
        prerequisites: prerequisites.split('\n').map(s => s.trim()).filter(Boolean),
        learning_outcomes: learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean),
        is_published: publish,
        featured,
      })

      if (!result.success) throw new Error(result.error || 'Failed to save')

      setIsPublished(publish)
      setSuccess(publish ? 'Learning path published!' : 'Draft saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save learning path')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 text-electric-cyan animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error && !path) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => router.push('/admin/learning-paths')}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to learning paths
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/learning-paths')}
              className="p-2 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Learning Path</h1>
              <p className="text-sm text-gray-500 mt-0.5">Update this structured learning experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving && !isPublished ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-cyan text-sm font-medium text-white hover:bg-electric-cyan/90 transition-colors disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              {isSaving && isPublished ? 'Saving...' : isPublished ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="rounded-lg bg-cyber-lime/10 border border-cyber-lime/20 px-4 py-3 text-sm text-cyber-lime">{success}</div>
        )}

        {/* Basic Info */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-5">
          <h2 className="text-sm font-medium text-white">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Kubernetes Fundamentals"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
              />
              {title && <p className="text-[10px] text-gray-600 mt-1">Slug: {generateSlug(title)}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A brief overview of what learners will achieve..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value} className="bg-[#0a0a0a]">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                >
                  <option value="beginner" className="bg-[#0a0a0a]">Beginner</option>
                  <option value="intermediate" className="bg-[#0a0a0a]">Intermediate</option>
                  <option value="advanced" className="bg-[#0a0a0a]">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Duration (hours)</label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={e => setEstimatedDuration(e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Cover Image URL (optional)</label>
              <input
                type="url"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
              />
              {coverImage && (
                <div className="mt-3 rounded-lg overflow-hidden bg-white/[0.02] border border-white/[0.04] aspect-video">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-white/[0.1] bg-white/[0.03] text-electric-cyan focus:ring-electric-cyan/30"
                />
                <span className="text-xs text-gray-400">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-white/[0.1] bg-white/[0.03] text-electric-cyan focus:ring-electric-cyan/30"
                />
                <span className="text-xs text-gray-400">Published</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Modules ({modules.length})</h2>
            <button
              onClick={addModule}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Module
            </button>
          </div>
          <div className="space-y-3">
            {modules.map((mod, index) => (
              <div key={index} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">Module {index + 1}</span>
                  </div>
                  {modules.length > 1 && (
                    <button
                      onClick={() => removeModule(index)}
                      className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={mod.title}
                  onChange={e => updateModule(index, 'title', e.target.value)}
                  placeholder="Module title"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                />
                <textarea
                  value={mod.description}
                  onChange={e => updateModule(index, 'description', e.target.value)}
                  placeholder="Brief description of this module..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prerequisites & Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-3">
            <h2 className="text-sm font-medium text-white">Prerequisites</h2>
            <p className="text-[10px] text-gray-600">One per line</p>
            <textarea
              value={prerequisites}
              onChange={e => setPrerequisites(e.target.value)}
              placeholder={"Docker basics\nLinux fundamentals\nBasic networking"}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
            />
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-3">
            <h2 className="text-sm font-medium text-white">Learning Outcomes</h2>
            <p className="text-[10px] text-gray-600">One per line</p>
            <textarea
              value={learningOutcomes}
              onChange={e => setLearningOutcomes(e.target.value)}
              placeholder={"Deploy applications to Kubernetes\nManage cluster resources\nDebug common issues"}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pb-8">
          <button
            onClick={() => router.push('/admin/learning-paths')}
            className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-cyan text-sm font-medium text-white hover:bg-electric-cyan/90 transition-colors disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
