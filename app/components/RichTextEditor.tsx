import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import BlockQuote from '@tiptap/extension-blockquote'
import HardBreak from '@tiptap/extension-hard-break'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import History from '@tiptap/extension-history'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Youtube from '@tiptap/extension-youtube'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import { cn } from '~/utils/cn'
import { useState, useEffect, useRef } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  maxLength?: number
}

const HIGHLIGHT_COLORS = {
  yellow: { color: '#fef08a', label: 'Yellow' },
  orange: { color: '#fed7aa', label: 'Orange' },
  red: { color: '#fecaca', label: 'Red' },
  pink: { color: '#fbcfe8', label: 'Pink' },
  purple: { color: '#e9d5ff', label: 'Purple' },
  blue: { color: '#bfdbfe', label: 'Blue' },
  cyan: { color: '#a5f3fc', label: 'Cyan' },
  green: { color: '#bbf7d0', label: 'Green' },
  lime: { color: '#d9f99d', label: 'Lime' },
  gray: { color: '#f3f4f6', label: 'Gray' },
} as const

const TEXT_COLORS = {
  Default: '#000000',
  Gray: '#374151',
  Brown: '#78350F',
  Orange: '#EA580C',
  Yellow: '#CA8A04',
  Green: '#16A34A',
  Blue: '#2563EB',
  Purple: '#7C3AED',
  Pink: '#DB2777',
  Red: '#DC2626',
}

const COLOR_SHADES = {
  Gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
  Red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  Orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  Yellow: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12'],
  Green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  Blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  Purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  Pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
} as const

const MarkButton = ({ 
  isActive, 
  onClick, 
  children,
  title,
  disabled
}: { 
  isActive?: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
  disabled?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={cn(
      "p-2 text-sm rounded hover:bg-gray-100",
      isActive && "bg-gray-100 text-blue-600",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {children}
  </button>
)

const ColorButton = ({ color, onClick, isActive }: {
  color: string
  onClick: () => void
  isActive: boolean
}) => (
  <button
    type="button"
    className={cn(
      'w-6 h-6 rounded-full border-2',
      isActive ? 'border-blue-500' : 'border-transparent'
    )}
    style={{ backgroundColor: color }}
    onClick={onClick}
  />
)

const HighlightButton = ({ color, label, onClick, isActive }: {
  color: string
  label: string
  onClick: () => void
  isActive: boolean
}) => (
  <button
    type="button"
    className={cn(
      'w-6 h-6 rounded border transition-all',
      isActive ? 'ring-2 ring-blue-500 scale-110' : 'ring-1 ring-gray-200 hover:scale-110'
    )}
    style={{ backgroundColor: color }}
    onClick={onClick}
    title={`Highlight ${label}`}
  />
)

const ColorPickerButton = ({ 
  editor, 
  isOpen, 
  setIsOpen 
}: { 
  editor: any
  isOpen: boolean
  setIsOpen: (open: boolean) => void 
}) => {
  const [customColor, setCustomColor] = useState('#000000')
  const currentColor = editor.getAttributes('textStyle').color || '#000000'
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  const handleColorClick = (color: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editor.chain().focus()
      .setColor(color)
      .run()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-1 p-2 text-sm rounded hover:bg-gray-100"
        title="Text color"
      >
        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: currentColor }} />
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-lg border w-72 z-50">
          <div className="space-y-2">
            {Object.entries(COLOR_SHADES).map(([name, shades]) => (
              <div key={name}>
                <div className="text-xs font-medium text-gray-500 mb-1">{name}</div>
                <div className="grid grid-cols-10 gap-1">
                  {shades.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={(e) => handleColorClick(color, e)}
                      className={cn(
                        'w-6 h-6 rounded hover:ring-2 hover:ring-blue-500',
                        currentColor === color && 'ring-2 ring-blue-500'
                      )}
                      style={{ backgroundColor: color }}
                      title={`${name} ${shades.indexOf(color) + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="text-xs font-medium text-gray-500 mb-1">Custom</div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-8 p-0 border rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="text"
                  value={customColor.toUpperCase()}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  placeholder="#000000"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    editor.chain().focus().setColor(customColor).run()
                    setIsOpen(false)
                  }}
                  className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const HighlightPickerButton = ({ 
  editor, 
  isOpen, 
  setIsOpen 
}: { 
  editor: any
  isOpen: boolean
  setIsOpen: (open: boolean) => void 
}) => {
  const pickerRef = useRef<HTMLDivElement>(null)
  const currentHighlight = editor.getAttributes('highlight').color

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-1 p-2 text-sm rounded hover:bg-gray-100"
        title="Highlight color"
      >
        <span className="w-4 h-4 rounded border" style={{ backgroundColor: currentHighlight || '#ffffff' }} />
        <span>Highlight</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-lg border w-64 z-50">
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(HIGHLIGHT_COLORS).map(([key, { color, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    editor.chain().focus().toggleHighlight({ color }).run()
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-8 h-8 rounded transition-all',
                    currentHighlight === color ? 'ring-2 ring-blue-500 scale-110' : 'ring-1 ring-gray-200 hover:scale-110'
                  )}
                  style={{ backgroundColor: color }}
                  title={label}
                />
              ))}
            </div>
            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  editor.chain().focus().unsetHighlight().run()
                  setIsOpen(false)
                }}
                className="w-full px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span>✕</span>
                <span>Remove highlight</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ALIGNMENTS = [
  { name: 'left', icon: '⇤' },
  { name: 'center', icon: '⇔' },
  { name: 'right', icon: '⇥' },
  { name: 'justify', icon: '⇱' },
] as const

const isTableSelected = (editor: any) => {
  return editor.isActive('table')
}

// Add this type for table button groups
type TableButtonGroup = {
  title: string
  buttons: {
    icon: string
    title: string
    action: (editor: any) => void
  }[]
}

// Replace the existing TableControls with this enhanced version
const TableControls = ({ editor }: { editor: any }) => {
  if (!isTableSelected(editor)) return null

  const buttonGroups: TableButtonGroup[] = [
    {
      title: "Table",
      buttons: [
        {
          icon: "🗑️",
          title: "Delete table",
          action: (editor) => editor.chain().focus().deleteTable().run(),
        },
        {
          icon: "⚏",
          title: "Merge cells",
          action: (editor) => editor.chain().focus().mergeCells().run(),
        },
        {
          icon: "⊞",
          title: "Split cell",
          action: (editor) => editor.chain().focus().splitCell().run(),
        },
      ],
    },
    {
      title: "Columns",
      buttons: [
        {
          icon: "���|",
          title: "Add column before",
          action: (editor) => editor.chain().focus().addColumnBefore().run(),
        },
        {
          icon: "|→",
          title: "Add column after",
          action: (editor) => editor.chain().focus().addColumnAfter().run(),
        },
        {
          icon: "|␡",
          title: "Delete column",
          action: (editor) => editor.chain().focus().deleteColumn().run(),
        },
        {
          icon: "⫼",
          title: "Toggle header column",
          action: (editor) => editor.chain().focus().toggleHeaderColumn().run(),
        },
      ],
    },
    {
      title: "Rows",
      buttons: [
        {
          icon: "↑—",
          title: "Add row before",
          action: (editor) => editor.chain().focus().addRowBefore().run(),
        },
        {
          icon: "↓—",
          title: "Add row after",
          action: (editor) => editor.chain().focus().addRowAfter().run(),
        },
        {
          icon: "—␡",
          title: "Delete row",
          action: (editor) => editor.chain().focus().deleteRow().run(),
        },
        {
          icon: "≡",
          title: "Toggle header row",
          action: (editor) => editor.chain().focus().toggleHeaderRow().run(),
        },
      ],
    },
    {
      title: "Cell",
      buttons: [
        {
          icon: "⌗",
          title: "Toggle header cell",
          action: (editor) => editor.chain().focus().toggleHeaderCell().run(),
        },
        {
          icon: "⇥",
          title: "Go to next cell",
          action: (editor) => editor.chain().focus().goToNextCell().run(),
        },
        {
          icon: "⇤",
          title: "Go to previous cell",
          action: (editor) => editor.chain().focus().goToPreviousCell().run(),
        },
      ],
    },
  ]

  return (
    <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-2 bg-white shadow-lg border rounded-lg p-2">
      {buttonGroups.map((group) => (
        <div key={group.title}>
          <div className="text-xs font-medium text-gray-500 mb-1">{group.title}</div>
          <div className="flex gap-1">
            {group.buttons.map((button) => (
              <MarkButton
                key={button.title}
                onClick={() => button.action(editor)}
                title={button.title}
              >
                {button.icon}
              </MarkButton>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const isYoutubeSelected = (editor: any) => {
  return editor.isActive('youtube')
}

const YoutubeControls = ({ editor }: { editor: any }) => {
  if (!isYoutubeSelected(editor)) return null

  return (
    <div className="absolute top-0 right-0 m-2 flex gap-1 bg-white/90 backdrop-blur shadow-lg border rounded-lg p-2 z-10">
      <MarkButton
        onClick={() => {
          editor.chain().focus().deleteNode('youtube').run()
        }}
        title="Delete video (Press Delete or Backspace)"
      >
        Delete Video 🗑️
      </MarkButton>
    </div>
  )
}

export default function RichTextEditor({ content, onChange, maxLength = 50000 }: RichTextEditorProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: 'mb-4',
        },
      }),
      Text,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'rounded px-0.5 transition-colors',
        },
      }),
      Bold,
      Italic,
      Strike,
      Code.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded p-4 font-mono text-sm my-4',
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'font-bold',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-4 mb-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-4 mb-4',
        },
      }),
      ListItem,
      BlockQuote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic my-4',
        },
      }),
      HardBreak,
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-t border-gray-300 my-4',
        },
      }),
      History,
      Dropcursor.configure({
        color: '#2563eb',
        width: 2,
      }),
      Gapcursor,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 100,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-200',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border-b-2 border-gray-300 bg-gray-100 font-semibold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-200 p-2',
        },
      }),
      Youtube.configure({
        width: 840,
        height: 472.5,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg relative group',
        },
        handleKeyDown: ({ editor, event }) => {
          if (isYoutubeSelected(editor) && (event.key === 'Delete' || event.key === 'Backspace')) {
            editor.chain().focus().deleteNode('youtube').run()
            return true
          }
          return false
        },
      }),
      Underline,
      Subscript,
      Superscript,
      CharacterCount.configure({
        limit: maxLength,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']

  return (
    <div className="relative min-h-[200px]">
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-1 bg-white shadow-lg border rounded-lg p-1">
          <div className="flex items-center gap-0.5 px-1">
            <MarkButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <span className="font-bold">B</span>
            </MarkButton>
            <MarkButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <span className="italic">I</span>
            </MarkButton>
            <MarkButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <span className="underline">U</span>
            </MarkButton>
            <MarkButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <span className="line-through">S</span>
            </MarkButton>
            <MarkButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code"
            >
              <span className="font-mono">{`<>`}</span>
            </MarkButton>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          <div className="flex items-center gap-0.5 px-1">
            <MarkButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive('subscript')}
              title="Subscript"
            >
              <span>x₂</span>
            </MarkButton>
            <MarkButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive('superscript')}
              title="Superscript"
            >
              <span>x²</span>
            </MarkButton>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          <ColorPickerButton 
            editor={editor}
            isOpen={colorPickerOpen}
            setIsOpen={setColorPickerOpen}
          />

          <div className="w-px h-6 bg-gray-200" />

          <HighlightPickerButton
            editor={editor}
            isOpen={highlightPickerOpen}
            setIsOpen={setHighlightPickerOpen}
          />
        </div>
      </BubbleMenu>

      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex flex-wrap items-center gap-1 p-2">
          <MarkButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            ¶
          </MarkButton>
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value)
              level ? 
                editor.chain().focus().toggleHeading({ level }).run() :
                editor.chain().focus().setParagraph().run()
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' : '0'
            }
            className="px-2 py-1 rounded border"
          >
            <option value="0">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex">
            {ALIGNMENTS.map(({ name, icon }) => (
              <MarkButton
                key={name}
                onClick={() => editor.chain().focus().setTextAlign(name).run()}
                isActive={editor.isActive({ textAlign: name })}
                title={`Align ${name}`}
              >
                {icon}
              </MarkButton>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <MarkButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            •
          </MarkButton>
          <MarkButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            1.
          </MarkButton>
          <MarkButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
          >
            {'<code>'}
          </MarkButton>
          <MarkButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            "
          </MarkButton>
          <MarkButton onClick={() => {
            const url = window.prompt('Enter image URL')
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}>
            🖼️
          </MarkButton>
          <MarkButton onClick={() => {
            const url = window.prompt('Enter link URL')
            if (url) {
              editor.chain().focus().toggleLink({ href: url }).run()
            }
          }}
          isActive={editor.isActive('link')}>
            🔗
          </MarkButton>
          <MarkButton
            onClick={() => {
              const url = window.prompt('Enter YouTube URL')
              if (url) {
                editor.commands.setYoutubeVideo({
                  src: url,
                })
              }
            }}
          >
            📺
          </MarkButton>
          <MarkButton
            onClick={() => {
              editor.chain().focus().insertTable({
                rows: 3,
                cols: 3,
                withHeaderRow: true
              }).run()
            }}
          >
            Table
          </MarkButton>
          <MarkButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            ―
          </MarkButton>
          <MarkButton
            onClick={() => editor.chain().focus().setHardBreak().run()}
            title="Hard Break"
          >
            ⏎
          </MarkButton>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <MarkButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
          >
            ↺
          </MarkButton>
          <MarkButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Shift+Z)"
            disabled={!editor.can().redo()}
          >
            ↻
          </MarkButton>
          <div className="ml-auto text-sm text-gray-500">
            {editor.storage.characterCount.characters()}/{maxLength} characters
          </div>
        </div>
      </div>

      <div className="relative">
        <TableControls editor={editor} />
        <YoutubeControls editor={editor} />
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  )
} 