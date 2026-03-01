'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import {
  Save, Eye, EyeOff, Send, Image as ImageIcon, Code,
  Bold, Italic, List, Link as LinkIcon, Heading2, ArrowLeft, Loader2,
} from 'lucide-react'
import { getPostById, updatePost } from '@/lib/actions/posts'
import type { Post } from '@/lib/types/database'
import MarkdownContent from '@/app/blog/[slug]/MarkdownContent'

export default function EditArticle() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Link modal
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  // Form fields
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState('intermediate')
  const [coverImage, setCoverImage] = useState('')
  const [status, setStatus] = useState<Post['status']>('draft')

  const categoryOptions = [
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

  // Load post on mount
  useEffect(() => {
    if (!id) return
    getPostById(id)
      .then((data) => {
        if (!data) {
          setError('Article not found.')
          return
        }
        setPost(data)
        setTitle(data.title)
        setExcerpt(data.excerpt)
        setContent(data.content)
        setCategories(
          data.categories?.length ? data.categories : data.category ? [data.category] : []
        )
        setTags(data.tags ?? [])
        setDifficulty(data.difficulty ?? 'intermediate')
        setCoverImage(data.cover_image_url ?? '')
        setStatus(data.status)
      })
      .catch(() => setError('Failed to load article.'))
      .finally(() => setIsLoading(false))
  }, [id])

  // ── Toolbar helpers ───────────────────────────────────────────────────────
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end) || placeholder
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + before.length + selected.length + after.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const handleInsertLink = () => {
    const textarea = textareaRef.current
    const selected = textarea ? content.slice(textarea.selectionStart, textarea.selectionEnd) : ''
    setLinkText(selected || '')
    setLinkUrl('')
    setShowLinkModal(true)
  }

  const confirmInsertLink = () => {
    const url = linkUrl.trim() || '#'
    const text = linkText.trim() || url
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      setContent(c => c.slice(0, start) + `[${text}](${url})` + c.slice(end))
    } else {
      setContent(c => c + `[${text}](${url})`)
    }
    setShowLinkModal(false)
    setLinkText('')
    setLinkUrl('')
  }

  const toggleCategory = (value: string) => {
    setCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    )
  }

  const calculateReadTime = () => {
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / 200)
  }

  // ── Save / Publish ────────────────────────────────────────────────────────
  const handleSave = async (newStatus: Post['status']) => {
    if (!title.trim()) { setError('Please enter a title'); return }
    if (!excerpt.trim()) { setError('Please enter an excerpt'); return }
    if (!content.trim()) { setError('Please enter content'); return }
    if (categories.length === 0) { setError('Please select at least one category'); return }

    newStatus === 'published' ? setIsPublishing(true) : setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const wordCount = content.trim().split(/\s+/).length
      const characterCount = content.length

      const updates: Partial<Post> = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: categories[0] as Post['category'],
        categories,
        tags,
        difficulty: difficulty as Post['difficulty'],
        cover_image_url: coverImage || undefined,
        word_count: wordCount,
        character_count: characterCount,
        estimated_read_time: calculateReadTime(),
        status: newStatus,
        ...(newStatus === 'published' && !post?.published_at
          ? { published_at: new Date().toISOString() }
          : {}),
      }

      await updatePost(id, updates)
      setStatus(newStatus)
      setSuccess(newStatus === 'published' ? 'Article published!' : 'Draft saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save article')
    } finally {
      setIsPublishing(false)
      setIsSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 text-electric-cyan animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error && !post) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => router.push('/admin/posts')} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to articles
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Link Insert Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-[#111] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-semibold text-white">Insert Link</h3>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Link Text</label>
                <input
                  autoFocus
                  type="text"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  placeholder="Display text"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={e => e.key === 'Enter' && confirmInsertLink()}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/40"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={confirmInsertLink}
                  className="flex-1 py-2 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors"
                >
                  Insert
                </button>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/[0.04] text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/posts')}
              className="p-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Edit Article</h1>
              <p className="text-sm text-gray-500">Update and republish your content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(p => !p)}
              className={`px-3.5 py-2 rounded-lg border transition-colors flex items-center gap-1.5 text-sm ${
                isPreview
                  ? 'bg-electric-cyan/10 border-electric-cyan/30 text-electric-cyan'
                  : 'bg-white/[0.02] border-white/[0.04] text-gray-500 hover:text-white'
              }`}
            >
              {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isPublishing}
              className="px-5 py-2 rounded-lg bg-electric-cyan text-white text-sm font-medium hover:bg-electric-cyan/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {isPublishing ? 'Saving...' : status === 'published' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-cyber-lime/10 border border-cyber-lime/20 p-3">
            <p className="text-xs text-cyber-lime">{success}</p>
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
                onChange={e => setTitle(e.target.value)}
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
                onChange={e => setExcerpt(e.target.value)}
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
                <button onClick={() => insertMarkdown('**', '**', 'bold text')} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('*', '*', 'italic text')} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('\n## ', '', 'Heading')} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Heading">
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/[0.06]" />
                <button onClick={() => insertMarkdown('\n- ', '', 'List item')} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="List">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleInsertLink} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Link">
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => insertMarkdown('`', '`', 'code')} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Inline Code">
                  <Code className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-white/[0.06]" />
                <button onClick={() => insertMarkdown('\n![Alt text](', ')', 'https://image-url.com')} className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors" title="Image">
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-5">
                {isPreview ? (
                  <div className="min-h-[480px] prose prose-invert prose-sm max-w-none">
                    {title && <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>}
                    {excerpt && (
                      <p className="text-gray-400 italic mb-4 text-sm border-l-2 border-electric-cyan/40 pl-3">{excerpt}</p>
                    )}
                    {content
                      ? <MarkdownContent content={content} />
                      : <p className="text-gray-600 italic">Nothing to preview yet.</p>
                    }
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`Write your article here... (Supports Markdown)\n\nTip: Select text then click toolbar buttons, or use:\n  [link text](https://url.com) for links\n  **bold**  *italic*  \`code\``}
                    rows={20}
                    className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.01] text-xs text-gray-500">
                <div className="flex items-center gap-5">
                  <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>{content.length} characters</span>
                  <span className="text-electric-cyan font-medium">{calculateReadTime()} min read</span>
                </div>
                <span className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  status === 'published' ? 'bg-cyber-lime/10 text-cyber-lime' :
                  status === 'draft' ? 'bg-gray-500/10 text-gray-400' :
                  'bg-yellow-400/10 text-yellow-400'
                }`}>{status}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Categories */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Categories *
              </label>
              <p className="text-[10px] text-gray-600 mb-3">Select one or more categories</p>
              <div className="grid grid-cols-2 gap-1.5">
                {categoryOptions.map(cat => {
                  const selected = categories.includes(cat.value)
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors border ${
                        selected
                          ? 'bg-electric-cyan/15 text-electric-cyan border-electric-cyan/30'
                          : 'bg-white/[0.02] text-gray-500 border-white/[0.04] hover:text-white hover:border-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
              {categories.length === 0 && (
                <p className="text-[10px] text-red-400 mt-2">Please select at least one category</p>
              )}
            </div>

            {/* Difficulty */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Difficulty Level
              </label>
              <div className="space-y-2">
                {difficulties.map(level => (
                  <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level.toLowerCase()}
                      checked={difficulty === level.toLowerCase()}
                      onChange={e => setDifficulty(e.target.value)}
                      className="w-3.5 h-3.5 text-electric-cyan focus:ring-electric-cyan/30"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{level}</span>
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

            {/* Tags */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Tags
              </label>
              <input
                type="text"
                placeholder="Press Enter to add tags..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-cyan/30"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setTags(prev => [...prev, e.currentTarget.value.trim()])
                    e.currentTarget.value = ''
                  }
                }}
              />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-electric-cyan/10 text-electric-cyan text-xs flex items-center gap-1.5">
                    #{tag}
                    <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
