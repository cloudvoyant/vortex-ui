// libs/vortex-react/src/editor/ImageInput.tsx
// React parity of ImageInput.svelte. The app-specific uploader is replaced by the injected
// `onUpload` seam, with the URL tab as the fallback when no handler is supplied.
import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { ImageUploadResult } from '@cloudvoyant/vortex-ui';
import { X } from 'lucide-react';

export interface ImageInputProps {
  editor: Editor;
  position: number;
  onClose: () => void;
  /** Seam: replaces the source editor's app-specific uploader. */
  onUpload?: (file: File) => Promise<ImageUploadResult>;
}

export function ImageInput({ editor, position, onClose, onUpload }: ImageInputProps) {
  // A consumer that supplies no upload handler must not be shown a disabled upload control.
  const [tab, setTab] = useState<'upload' | 'url'>(onUpload ? 'upload' : 'url');
  const [urlValue, setUrlValue] = useState('');
  const [urlError, setUrlError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === 'url') urlInputRef.current?.focus();
  }, [tab]);

  function insertImage(src: string, srcset?: string) {
    editor.chain().focus().setTextSelection(position).insertImage({ src, srcset, alt: '', caption: '' }).run();
    onClose();
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !onUpload) return;
    setUploading(true);
    setUploadError('');
    try {
      const result = await onUpload(file);
      insertImage(result.src, result.srcset);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleUrlSubmit() {
    const trimmed = urlValue.trim();
    if (!trimmed) return setUrlError('Please enter a URL');
    try {
      new URL(trimmed);
    } catch {
      return setUrlError('Please enter a valid URL');
    }
    insertImage(trimmed);
  }

  return (
    <div
      role="dialog"
      aria-label="Insert image"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      className="w-80 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Insert Image</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close image dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-1 rounded-md bg-muted p-1">
          {(onUpload ? (['upload', 'url'] as const) : (['url'] as const)).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setUrlError('');
              }}
              className={`flex-1 rounded px-3 py-1 text-xs font-medium transition-colors ${
                tab === value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {value === 'upload' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>

        {tab === 'upload' ? (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={!onUpload || uploading}
              className="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
            />
            {uploading ? <p className="text-xs text-muted-foreground">Uploading…</p> : null}
            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              ref={urlInputRef}
              type="url"
              value={urlValue}
              onChange={(event) => {
                setUrlValue(event.target.value);
                setUrlError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleUrlSubmit();
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {urlError ? <p className="text-xs text-destructive">{urlError}</p> : null}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">
            Cancel
          </button>
          {tab === 'url' ? (
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Insert
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
