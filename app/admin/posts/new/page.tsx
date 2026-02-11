'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Save, Eye, Send, Image as ImageIcon, Code, Bold, Italic, List, Link as LinkIcon } from 'lucide-react'
import { createPost } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/actions/auth'

export default function NewPost() {
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

  const categories = ['Kubernetes', 'Terraform', 'CI/CD', 'Security', 'Platform Engineering', 'Cloud Native', 'Observability']
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
        category: category.toLowerCase(),
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
      setError(err.message || 'Failed to publish post')
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
        category: category.toLowerCase(),
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Post</h1>
            <p className="text-gray-400">Write and publish engaging DevOps content</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button 
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2 rounded-lg bg-gradient-cyber text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
            </div>

            {/* Excerpt */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Excerpt *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description for social media and article listings..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">{excerpt.length}/280 characters</p>
            </div>

            {/* Content Editor */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/5">
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10" />
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="List">
                  <List className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Link">
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Code">
                  <Code className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10" />
                <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Image">
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your article... (Supports Markdown)"
                  rows={20}
                  className="w-full bg-transparent text-white placeholder:text-gray-600 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 text-sm text-gray-400">
                <div className="flex items-center gap-6">
                  <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>{content.length} characters</span>
                  <span className="text-electric-cyan font-semibold">{calculateReadTime()} min read</span>
                </div>
                <span>Last saved: Never</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Difficulty Level
              </label>
              <div className="space-y-2">
                {difficulties.map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level.toLowerCase()}
                      checked={difficulty === level.toLowerCase()}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-4 h-4 text-electric-cyan focus:ring-electric-cyan/50"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
              />
              {coverImage && (
                <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-electric-cyan/20 to-cyber-lime/20 aspect-video" />
              )}
            </div>

            {/* Tags */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Tags
              </label>
              <input
                type="text"
                placeholder="Press Enter to add tags..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-electric-cyan/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setTags([...tags, e.currentTarget.value])
                    e.currentTarget.value = ''
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-electric-cyan/10 text-electric-cyan text-sm flex items-center gap-2"
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
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Auto-generated from title"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
                  <textarea
                    placeholder="Auto-generated from excerpt"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none resize-none"
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
