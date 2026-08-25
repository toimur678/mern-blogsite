import { EditorOutputData } from '../assets/assets'

interface EditorRendererProps {
  data: EditorOutputData
}

/**
 * Renders Editor.js JSON blocks as safe React elements.
 * No dangerouslySetInnerHTML — all content is rendered as text nodes.
 */
const EditorRenderer = ({ data }: EditorRendererProps) => {
  if (!data?.blocks) return null

  return (
    <div className="rich-text">
      {data.blocks.map((block, index) => {
        const key = block.id || index

        switch (block.type) {
          case 'header': {
            const level = (block.data.level as number) || 2
            const text = (block.data.text as string) || ''
            if (level === 1) return <h1 key={key}>{text}</h1>
            if (level === 2) return <h2 key={key}>{text}</h2>
            if (level === 3) return <h3 key={key}>{text}</h3>
            if (level === 4) return <h4 key={key}>{text}</h4>
            if (level === 5) return <h5 key={key}>{text}</h5>
            return <h6 key={key}>{text}</h6>
          }

          case 'paragraph': {
            const text = (block.data.text as string) || ''
            return <p key={key}>{text}</p>
          }

          case 'list': {
            const items = (block.data.items as string[]) || []
            const style = block.data.style as string
            if (style === 'ordered') {
              return (
                <ol key={key}>
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              )
            }
            return (
              <ul key={key}>
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )
          }

          case 'quote': {
            const text = (block.data.text as string) || ''
            const caption = (block.data.caption as string) || ''
            return (
              <blockquote key={key} className="border-l-4 border-primary pl-5 my-6 italic text-[#555]">
                <p className="mb-2">{text}</p>
                {caption && (
                  <cite className="text-sm text-[#777] not-italic">— {caption}</cite>
                )}
              </blockquote>
            )
          }

          case 'delimiter': {
            return (
              <hr key={key} className="my-8 border-0 h-px bg-border" />
            )
          }

          case 'inlineCode': {
            const text = (block.data.text as string) || ''
            return (
              <p key={key}>
                <code className="bg-surface-input px-2 py-1 rounded text-sm font-mono text-primary-dark">
                  {text}
                </code>
              </p>
            )
          }

          default:
            return null
        }
      })}
    </div>
  )
}

export default EditorRenderer
