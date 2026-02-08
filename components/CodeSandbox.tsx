'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Play, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'

interface CodeSandboxProps {
  code: string
  language: string
  title?: string
  description?: string
  runnable?: boolean
}

export default function CodeSandbox({
  code,
  language,
  title,
  description,
  runnable = false,
}: CodeSandboxProps) {
  const [copied, setCopied] = useState(false)
  const [output, setOutput] = useState<string | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = () => {
    // Simulate code execution (in real implementation, use a safe sandbox)
    setOutput('✓ Code executed successfully\n\nDeployment created: my-app\nService exposed on port 8080')
    toast.success('Code executed!')
  }

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontSize: '0.875rem',
      lineHeight: '1.7',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.875rem',
    },
  }

  return (
    <div className="w-full">
      {/* Header */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-5 h-5 text-electric-cyan" />
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div className="relative rounded-2xl overflow-hidden bg-deep-charcoal-300 border border-white/10 shadow-bento">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-sm text-gray-400 font-mono">
              {language}.{language === 'yaml' ? 'yaml' : language === 'go' ? 'go' : 'sh'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {runnable && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRun}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-lime/20 text-cyber-lime hover:bg-cyber-lime/30 transition-colors text-sm font-semibold"
              >
                <Play className="w-3.5 h-3.5" />
                Run
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-cyan/20 text-electric-cyan hover:bg-electric-cyan/30 transition-colors text-sm font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Code Display */}
        <div className="relative">
          <SyntaxHighlighter
            language={language}
            style={customStyle}
            showLineNumbers
            customStyle={{
              maxHeight: '400px',
              overflow: 'auto',
            }}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: '#4B5563',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>

          {/* Gradient Overlay for Long Code */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-deep-charcoal-300 to-transparent pointer-events-none" />
        </div>

        {/* Output Panel */}
        {output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 bg-black/40"
          >
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <Terminal className="w-4 h-4 text-cyber-lime" />
              <span className="text-sm font-semibold text-white">Output</span>
            </div>
            <div className="px-4 py-3 font-mono text-sm text-gray-300 whitespace-pre-wrap">
              {output}
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-500 mb-1">Language</div>
          <div className="text-sm font-semibold text-white uppercase">{language}</div>
        </div>
        <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-500 mb-1">Lines</div>
          <div className="text-sm font-semibold text-white">{code.split('\n').length}</div>
        </div>
        {runnable && (
          <div className="flex-1 px-4 py-3 rounded-xl bg-cyber-lime/10 border border-cyber-lime/30">
            <div className="text-xs text-cyber-lime/70 mb-1">Status</div>
            <div className="text-sm font-semibold text-cyber-lime">Interactive</div>
          </div>
        )}
      </div>
    </div>
  )
}
