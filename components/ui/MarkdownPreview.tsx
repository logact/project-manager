import { useMemo } from 'react'
import { marked } from 'marked'
import { cn } from '../../lib/utils'

marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function MarkdownPreview({
  markdown,
  className,
}: {
  markdown: string
  className?: string
}) {
  const html = useMemo(() => {
    return marked.parse(markdown || '')
  }, [markdown])

  return (
    <div
      className={cn(
        'text-sm text-text leading-relaxed',
        '[&_p]:my-2 [&_p]:text-text',
        '[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-text [&_h1]:my-3',
        '[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text [&_h2]:my-3',
        '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-text [&_h3]:my-2',
        '[&_h4]:text-sm [&_h4]:font-medium [&_h4]:text-text [&_h4]:my-2',
        '[&_strong]:font-semibold [&_strong]:text-text',
        '[&_em]:italic [&_em]:text-text',
        '[&_code]:text-text [&_code]:bg-bg-tertiary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono',
        '[&_pre]:bg-bg-tertiary [&_pre]:border [&_pre]:border-border [&_pre]:rounded [&_pre]:p-2 [&_pre]:overflow-x-auto [&_pre]:my-2',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:text-text',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:text-text',
        '[&_li]:my-0.5',
        '[&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-text-muted [&_blockquote]:italic',
        '[&_hr]:border-border [&_hr]:my-3',
        '[&_table]:w-full [&_table]:text-sm [&_table]:my-2',
        '[&_th]:text-left [&_th]:font-semibold [&_th]:border-b [&_th]:border-border [&_th]:py-1 [&_th]:px-2',
        '[&_td]:border-b [&_td]:border-border-subtle [&_td]:py-1 [&_td]:px-2',
        '[&_img]:max-w-full [&_img]:rounded [&_img]:border [&_img]:border-border [&_img]:my-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
