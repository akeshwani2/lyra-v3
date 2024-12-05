import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Highlighter,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'
import { useEffect } from 'react'


interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  noteId?: string
}

const RichTextEditor = ({ content, onChange, noteId }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: (level: number): string => {
              const classes = {
                1: 'text-white font-semibold mt-0',
                2: 'text-white font-semibold m-0',
                3: 'text-white font-semibold mt-0',
              };
              return classes[level as keyof typeof classes] || '';
            },
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'leading-relaxed mb-1',
          },
        },
      }),
      TextStyle,
      FontFamily,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: 'bg-purple-500/50 text-white rounded px-1',
        }
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none h-full overflow-y-auto px-6 leading-relaxed',
      },
    },
  }, [noteId])

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const fontSize = editor.getAttributes('textStyle').fontSize || 16

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 relative bg-white/5 rounded-lg overflow-hidden">
        <EditorContent 
          editor={editor} 
          className="absolute inset-0 prose prose-invert max-w-none focus:outline-none px-6 py-4 overflow-y-auto
            [&_p]:!leading-relaxed [&_p]:!mb-1
            [&_h1]:!mt-0 [&_h1]:!text-white [&_h1]:!text-4xl
            [&_h2]:!m-0 [&_h2]:!p-0 [&_h2]:!text-white [&_h2]:!text-3xl [&_h2]:!mb-1
            [&_h3]:!mt-0 [&_h3]:!text-white [&_h3]:!text-2xl [&_h3]:!mb-1
            scrollbar scrollbar-track-transparent scrollbar-thumb-purple-500/20 
            hover:scrollbar-thumb-purple-500/40 
            scrollbar-w-1.5 
            scrollbar-thumb-rounded-full
            scrollbar-track-rounded-full
            transition-colors"
        />
      </div>

      <div className="w-12 flex-shrink-0 p-2 bg-white/5  rounded-lg border border-purple-500/20">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('bold') ? 'bg-purple-500/20' : ''
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('italic') ? 'bg-purple-500/20' : ''
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('underline') ? 'bg-purple-500/20' : ''
            }`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          
          <div className="w-py w-5 bg-purple-500/20 my-4" />
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('bulletList') ? 'bg-purple-500/20' : ''
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('orderedList') ? 'bg-purple-500/20' : ''
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <div className="w-py w-5 bg-purple-500/20 my-4" />
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-purple-500/20' : ''
            }`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-purple-500/20' : ''
            }`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-purple-500/20' : ''
            }`}
          >
            <AlignRight className="w-4 h-4" />
          </button>
          
          <div className="w-py w-5 bg-purple-500/20 my-4" />
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('heading', { level: 1 }) ? 'bg-purple-500/20' : ''
            }`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('heading', { level: 2 }) ? 'bg-purple-500/20' : ''
            }`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('heading', { level: 3 }) ? 'bg-purple-500/20' : ''
            }`}
          >
            <Heading3 className="w-4 h-4" />
          </button>
          
          <div className="w-py w-6 bg-purple-500/20 my-2" />
          
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-purple-500/20 ${
              editor.isActive('highlight') ? 'bg-purple-500/20' : ''
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor