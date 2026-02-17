'use client'

import { useState } from 'react'
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
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4 text-electric-cyan" />
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden bg-[#080808] border border-white/[0.04]">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="ml-2 text-[10px] text-gray-600 font-mono">
              {language}.{language === 'yaml' ? 'yaml' : language === 'go' ? 'go' : 'sh'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {runnable && (
              <button
                onClick={handleRun}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyber-lime/10 text-cyber-lime hover:bg-cyber-lime/20 transition-colors text-[10px] font-semibold"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-electric-cyan/10 text-electric-cyan hover:bg-electric-cyan/20 transition-colors text-[10px] font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <SyntaxHighlighter
            language={language}
            style={customStyle}
            showLineNumbers
            customStyle={{
              maxHeight: '360px',
              overflow: 'auto',
            }}
            lineNumberStyle={{
              minWidth: '2.5em',
              paddingRight: '0.8em',
              color: '#333',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>

          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
        </div>

        {output && (
          <div className="border-t border-white/[0.04] bg-black/40 animate-fade-in">
            <div className="px-3 py-2 flex items-center gap-1.5 border-b border-white/[0.04]">
              <Terminal className="w-3 h-3 text-cyber-lime" />
              <span className="text-[10px] font-semibold text-white">Output</span>
            </div>
            <div className="px-3 py-2 font-mono text-xs text-gray-400 whitespace-pre-wrap">
              {output}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="text-[9px] text-gray-600 mb-0.5">Language</div>
          <div className="text-xs font-semibold text-white uppercase">{language}</div>
        </div>
        <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="text-[9px] text-gray-600 mb-0.5">Lines</div>
          <div className="text-xs font-semibold text-white">{code.split('\n').length}</div>
        </div>
        {runnable && (
          <div className="flex-1 px-3 py-2 rounded-lg bg-cyber-lime/[0.05] border border-cyber-lime/10">
            <div className="text-[9px] text-cyber-lime/60 mb-0.5">Status</div>
            <div className="text-xs font-semibold text-cyber-lime">Interactive</div>
          </div>
        )}
      </div>
    </div>
  )
}
