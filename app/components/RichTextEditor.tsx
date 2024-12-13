import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { cn } from '~/utils/cn'

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-2 space-x-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          'p-1 rounded',
          editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          'p-1 rounded',
          editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'p-1 rounded',
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          'p-1 rounded',
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        H3
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'p-1 rounded',
          editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"/>
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'p-1 rounded',
          editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zm2 8h13v2H7v-2zm-4-1v3h1v1H2v-1h1v-1H2v-1h2v-1H2V9h3v1H3zm2 8h13v2H7v-2zm-4-1v3h1v1H2v-1h1v-1H2v-1h2v-1H2v-1h3v1H3z"/>
        </svg>
      </button>

      <button
        onClick={() => {
          const url = window.prompt('Enter the URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={cn(
          'p-1 rounded',
          editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/>
        </svg>
      </button>
    </div>
  )
}

type RichTextEditorProps = {
  content: string
  onChange: (content: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-md">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
} 