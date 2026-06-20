import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor({
  value = '',
  onChange,
  selectedTab = 'write',
  onTabChange,
  minEditorHeight = 200,
}) {
  return (
    <div className="w-full">
      <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
        <button
          type="button"
          onClick={() => onTabChange?.('write')}
          style={{
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: selectedTab === 'write' ? '600' : '400',
            borderBottom: selectedTab === 'write' ? '2px solid #3b82f6' : '2px solid transparent',
            background: 'transparent',
            color: selectedTab === 'write' ? '#3b82f6' : '#9ca3af',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
          }}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => onTabChange?.('preview')}
          style={{
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: selectedTab === 'preview' ? '600' : '400',
            borderBottom: selectedTab === 'preview' ? '2px solid #3b82f6' : '2px solid transparent',
            background: 'transparent',
            color: selectedTab === 'preview' ? '#3b82f6' : '#9ca3af',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
          }}
        >
          Preview
        </button>
      </div>

      {selectedTab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: '100%',
            minHeight: `${minEditorHeight}px`,
            padding: '12px',
            background: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.6',
            boxSizing: 'border-box',
          }}
          placeholder="Write your content in Markdown..."
        />
      ) : (
        <div
          style={{
            minHeight: `${minEditorHeight}px`,
            padding: '12px',
            overflowY: 'auto',
          }}
          className="prose prose-invert max-w-none"
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
