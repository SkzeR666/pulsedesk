"use client"

import { Fragment, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ArticleContentProps {
  content: string
  className?: string
}

type Block =
  | { type: "image"; alt: string; url: string }
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "blockquote"; content: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; language: string; content: string }

function sanitizeUrl(url: string) {
  const trimmed = url.trim()
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
    return trimmed
  }

  return null
}

function renderInline(content: string) {
  const nodes: ReactNode[] = []
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index))
    }

    if (match[2] && match[3]) {
      const href = sanitizeUrl(match[3])
      nodes.push(
        href ? (
          <a
            key={`${match.index}-${href}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {match[2]}
          </a>
        ) : (
          match[0]
        )
      )
    } else if (match[4]) {
      nodes.push(
        <code
          key={`${match.index}-${match[4]}`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {match[4]}
        </code>
      )
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex))
  }

  return nodes
}

function sanitizeImageUrl(url: string) {
  return sanitizeUrl(url)
}

function parseBlocks(content: string): Block[] {
  const normalized = content.replace(/\r\n/g, "\n").trim()
  if (!normalized) {
    return []
  }

  const lines = normalized.split("\n")
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const currentLine = lines[index]

    if (!currentLine.trim()) {
      index += 1
      continue
    }

    if (currentLine.startsWith("```")) {
      const language = currentLine.slice(3).trim()
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index])
        index += 1
      }

      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n"),
      })
      index += 1
      continue
    }

    const imageMatch = currentLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      const imageUrl = sanitizeImageUrl(imageMatch[2])
      if (imageUrl) {
        blocks.push({
          type: "image",
          alt: imageMatch[1].trim(),
          url: imageUrl,
        })
      }
      index += 1
      continue
    }

    const headingMatch = currentLine.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2].trim(),
      })
      index += 1
      continue
    }

    if (currentLine.startsWith("> ")) {
      const quoteLines: string[] = []
      while (index < lines.length && lines[index].startsWith("> ")) {
        quoteLines.push(lines[index].slice(2))
        index += 1
      }
      blocks.push({ type: "blockquote", content: quoteLines })
      continue
    }

    if (/^[-*]\s+/.test(currentLine)) {
      const items: string[] = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, "").trim())
        index += 1
      }
      blocks.push({ type: "unordered-list", items })
      continue
    }

    if (/^\d+\.\s+/.test(currentLine)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, "").trim())
        index += 1
      }
      blocks.push({ type: "ordered-list", items })
      continue
    }

    const paragraphLines: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("```") &&
      !lines[index].startsWith("> ") &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^(#{1,3})\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push({ type: "paragraph", content: paragraphLines.join(" ") })
  }

  return blocks
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  const blocks = parseBlocks(content)

  if (blocks.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Nenhum conteudo publicado ainda.
      </div>
    )
  }

  return (
    <div className={cn("space-y-5 text-[15px] leading-7 text-foreground", className)}>
      {blocks.map((block, index) => {
        if (block.type === "image") {
          return (
            <figure key={index} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={block.url} alt={block.alt || "Imagem"} className="max-h-[520px] w-full object-contain bg-muted/20" />
              {block.alt && (
                <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          )
        }

        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h2 key={index} className="text-2xl font-semibold tracking-tight">
                {renderInline(block.content)}
              </h2>
            )
          }

          if (block.level === 2) {
            return (
              <h3 key={index} className="text-xl font-semibold tracking-tight">
                {renderInline(block.content)}
              </h3>
            )
          }

          return (
            <h4 key={index} className="text-lg font-semibold">
              {renderInline(block.content)}
            </h4>
          )
        }

        if (block.type === "code") {
          return (
            <div key={index} className="overflow-hidden rounded-lg border border-border bg-muted/40">
              <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
                <span>{block.language || "codigo"}</span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 text-sm leading-6">
                <code className="font-mono text-foreground">{block.content}</code>
              </pre>
            </div>
          )
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-primary/40 pl-4 text-muted-foreground"
            >
              {block.content.map((line, lineIndex) => (
                <p key={lineIndex}>{renderInline(line)}</p>
              ))}
            </blockquote>
          )
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={index} className="space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="list-disc">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="list-decimal">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          )
        }

        return (
          <p key={index} className="text-muted-foreground">
            {renderInline(block.content).map((node, nodeIndex) => (
              <Fragment key={nodeIndex}>{node}</Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
