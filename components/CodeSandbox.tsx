'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy, Info, Terminal } from 'lucide-react'
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
  const [showExecutionNote, setShowExecutionNote] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard')
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Unable to copy code:', error)
      toast.error('Unable to copy code')
    }
  }

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontSize: '0.8rem',
      lineHeight: '1.7',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.8rem',
    },
  }

  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <div className="mb-1 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-electric-cyan" />
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
          )}
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-[#080808]">
        <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1" aria-hidden="true">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="ml-2 font-mono text-[10px] text-gray-600">
              {language}.{language === 'yaml' ? 'yaml' : language === 'go' ? 'go' : 'sh'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {runnable && (
              <button
                type="button"
                onClick={() => setShowExecutionNote((value) => !value)}
                className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
                aria-expanded={showExecutionNote}
              >
                <Info className="h-3 w-3" />
                Execution
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md bg-electric-cyan/10 px-2 py-1 text-[10px] font-semibold text-electric-cyan transition-colors hover:bg-electric-cyan/20"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="relative">
          <SyntaxHighlighter
            language={language}
            style={customStyle}
            showLineNumbers
            customStyle={{ maxHeight: '360px', overflow: 'auto' }}
            lineNumberStyle={{
              minWidth: '2.5em',
              paddingRight: '0.8em',
              color: '#333',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#080808] to-transparent" />
        </div>

        {runnable && showExecutionNote && (
          <div className="border-t border-amber-400/10 bg-amber-400/[0.035] px-4 py-3 text-xs leading-5 text-amber-200/70">
            This example is illustrative only. RapidReach does not currently execute code or apply infrastructure from your browser. Copy it into a safe local or sandbox environment before running it.
          </div>
        )}
      </div>

      <div className="mt-2.5 flex gap-2">
        <div className="flex-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <div className="mb-0.5 text-[9px] text-gray-600">Language</div>
          <div className="text-xs font-semibold uppercase text-white">{language}</div>
        </div>
        <div className="flex-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
          <div className="mb-0.5 text-[9px] text-gray-600">Lines</div>
          <div className="text-xs font-semibold text-white">{code.split('\n').length}</div>
        </div>
        {runnable && (
          <div className="flex-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
            <div className="mb-0.5 text-[9px] text-gray-600">Mode</div>
            <div className="text-xs font-semibold text-gray-300">Read-only</div>
          </div>
        )}
      </div>
    </div>
  )
}
