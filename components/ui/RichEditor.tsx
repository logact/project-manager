import { forwardRef, useImperativeHandle, useRef } from 'react'
import { cn } from '../../lib/utils'

export interface RichEditorHandle {
  getMarkdown: () => string
  setMarkdown: (md: string) => void
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function imageBlockHtml(src: string, alt: string): string {
  return (
    '<div class="image-block" contenteditable="false" style="margin:8px 0;position:relative;display:inline-block;">' +
    `<img src="${src}" alt="${alt}" style="max-width:120px;border-radius:6px;border:1px solid #2e3446;display:block;max-height:80px;">` +
    '<button data-action="delete-image" style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:4px;background:rgba(0,0,0,0.7);color:white;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;">×</button>' +
    '</div>'
  )
}

function markdownToHtml(md: string): string {
  if (!md) return ''

  const parts = md.split(/(!\[([^\]]*)\]\(([^)]+)\))/g)
  let html = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue

    if (part.startsWith('![') && i + 2 < parts.length) {
      const alt = parts[i + 1] || 'image'
      const src = parts[i + 2] || ''
      html += imageBlockHtml(src, alt)
      i += 2
    } else {
      const escaped = part
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      html += escaped.replace(/\n/g, '<br>')
    }
  }

  return html
}

function htmlToMarkdown(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  let markdown = ''

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      markdown += node.textContent || ''
    } else if (node.nodeName === 'IMG') {
      const img = node as HTMLImageElement
      markdown += `![${img.alt || 'image'}](${img.src})`
    } else if (node.nodeName === 'BR') {
      markdown += '\n'
    } else if (node.nodeName === 'DIV') {
      const el = node as HTMLDivElement
      if (el.classList.contains('image-block')) {
        const img = el.querySelector('img')
        if (img) {
          markdown += `![${img.alt || 'image'}](${img.src})`
        }
      } else {
        if (markdown && !markdown.endsWith('\n')) markdown += '\n'
        for (const child of node.childNodes) walk(child)
      }
    } else if (node.nodeName === 'P') {
      if (markdown && !markdown.endsWith('\n')) markdown += '\n'
      for (const child of node.childNodes) walk(child)
      if (!markdown.endsWith('\n')) markdown += '\n'
    } else {
      for (const child of node.childNodes) walk(child)
    }
  }

  for (const child of doc.body.childNodes) walk(child)
  return markdown.trim()
}

const RichEditor = forwardRef<RichEditorHandle, { className?: string; placeholder?: string }>(
  ({ className, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      getMarkdown: () => htmlToMarkdown(editorRef.current?.innerHTML || ''),
      setMarkdown: (md: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = markdownToHtml(md)
        }
      },
    }))

    const insertImage = (dataUrl: string, fileName: string) => {
      const imgHtml = imageBlockHtml(dataUrl, fileName) + '<div><br></div>'
      document.execCommand('insertHTML', false, imgHtml)
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            readFileAsBase64(file).then((dataUrl) => {
              insertImage(dataUrl, file.name)
            })
          }
          return
        }
      }

      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          readFileAsBase64(file).then((dataUrl) => {
            insertImage(dataUrl, file.name)
          })
          return
        }
      }
    }

    const handleClick = (e: React.MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-action="delete-image"]')
      if (btn) {
        e.preventDefault()
        const block = btn.closest('.image-block')
        if (block) {
          block.remove()
        }
      }
    }

    return (
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'w-full bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text min-h-[120px] max-h-[320px] overflow-y-auto',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
          className
        )}
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder={placeholder}
      />
    )
  }
)

RichEditor.displayName = 'RichEditor'

export default RichEditor
