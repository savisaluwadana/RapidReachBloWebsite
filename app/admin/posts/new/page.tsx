'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Save, Eye, Send, Image as ImageIcon, Code, Bold, Italic, List, Link as LinkIcon } from 'lucide-react'
import { createPost } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/actions/auth'

export default function NewArticle() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('kubernetes')
  const [tags, setTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState('intermediate')
  const [coverImage, setCoverImage] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  const calculateReadTime = () => {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handlePublish = async () => {
    if (!title || !excerpt || !content) {
      setError('Please fill in title, excerpt, and content')
      return
    }

    setIsPublishing(true)
    setError('')

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('You must be logged in to publish')
      }

      const wordCount = content.trim().split(/\s+/).length
      const characterCount = content.length

      await createPost({
        title,
        slug: generateSlug(title),
        excerpt,
        content,
        author_id: user.id,
        category,
        tags,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        status: 'published',
        featured: false,
        trending: false,
        word_count: wordCount,
        character_count: characterCount,
        cover_image_url: coverImage || undefined,
        published_at: new Date().toISOString(),
      })

      router.push('/admin/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to publish article')
      console.error('Publish error:', err)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!title) {
      setError('Please enter a title')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('You must be logged in to save')
      }

      const wordCount = content.trim().split(/\s+/).length
      const characterCount = content.length

      await createPost({
        title,
        slug: generateSlug(title),
        excerpt,
        content,
        author_id: user.id,
        category,
        tags,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        status: 'draft',
        featured: false,
        trending: false,
        word_count: wordCount,
        character_count: characterCount,
        cover_image_url: coverImage || undefined,
      })

      router.push('/admin/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save draft')
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Create New Article</h1>
            <p className="text-sm text-gray-500">Write and publish engaging DevOps content</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button 
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-white text-lg font-bold placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
              />
            </div>

            {/* Excerpt */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2">
                Excerpt *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description for social media and article listings..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
              />
              <p className="text-[10px] text-gray-600 mt-1.5">{excerpt.length}/280 characters</p>
            </div>

            {/* Content Editor */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1.5 p-3 border-b border-white/[0.04] bg-white/[0.01]">
                <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/[0.06]" />
                <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="List">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Link">
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Code">
                  <Code className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/[0.06]" />
                <button className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Image">
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-5">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your article... (Supports Markdown)"
                  rows={20}
                  className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none font-mono leading-relaxed"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.01] text-xs text-gray-500">
                <div className="flex items-center gap-5">
                  <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>{content.length} characters</span>
                  <span className="text-electric-cyan font-medium">{calculateReadTime()} min read</span>
                </div>
                <span>Last saved: Never</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Category */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Difficulty Level
              </label>
              <div className="space-y-2">
                {difficulties.map((level) => (
                  <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level.toLowerCase()}
                      checked={difficulty === level.toLowerCase()}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-3.5 h-3.5 text-electric-cyan focus:ring-electric-cyan/30"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
              />
              {coverImage && (
                <div className="mt-3 rounded-lg overflow-hidden bg-white/[0.02] border border-white/[0.04] aspect-video" />
              )}
            </div>

            {/* Tags */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Tags
              </label>
              <input
                type="text"
                placeholder="Press Enter to add tags..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setTags([...tags, e.currentTarget.value])
                    e.currentTarget.value = ''
                  }
                }}
              />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-electric-cyan/10 text-electric-cyan text-xs flex items-center gap-1.5"
                  >
                    #{tag}
                    <button
                      onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Auto-generated from title"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Meta Description</label>
                  <textarea
                    placeholder="Auto-generated from excerpt"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
