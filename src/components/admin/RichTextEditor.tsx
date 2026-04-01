import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, 
  Heading1, Heading2, Quote, Undo, 
  Redo, Link as LinkIcon, Image as ImageIcon,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-gold text-white shadow-sm' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

export function RichTextEditor({ value, onChange, className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gold underline decoration-gold/30 hover:decoration-gold transition-all',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl border border-slate-200 shadow-lg max-w-full h-auto my-6',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gold max-w-none focus:outline-none min-h-[200px] font-body text-slate-700 leading-relaxed p-4',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:border-gold/50 transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-slate-200 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <Type className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={addImage} title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </MenuButton>

        <div className="flex-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Footer Area */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="text-[10px] font-ui text-slate-400 uppercase tracking-widest font-semibold">
          TipTap Editor Engine
        </div>
        <div className="text-[10px] font-ui text-slate-400 uppercase tracking-widest font-semibold">
          Characters: {editor.storage.characterCount?.characters?.() || 0}
        </div>
      </div>
    </div>
  );
}
