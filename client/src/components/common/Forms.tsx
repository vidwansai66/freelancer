import { useId, useState } from 'react';
import { api } from '../../services/api';

export const fieldClass =
  'w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-white';
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  multiline = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm text-white">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={fieldClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={fieldClass}
        />
      )}
    </div>
  );
}
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center gap-4 py-4 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="disabled:opacity-40"
      >
        Previous
      </button>
      <span>
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
export function UploadField({
  label,
  visibility = 'public',
  onUploaded,
}: {
  label: string;
  visibility?: 'public' | 'private';
  onUploaded: (file: { fileId: string; token: string; filename: string; url: string }) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={
          visibility === 'public'
            ? 'image/png,image/jpeg,image/webp'
            : 'image/png,image/jpeg,image/webp,application/pdf'
        }
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setError('');
          if (file.size > 5 * 1024 * 1024) {
            setError('Choose a file smaller than 5 MB.');
            e.target.value = '';
            return;
          }
          setBusy(true);
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const result = await api.post('/files', {
              filename: file.name,
              mime: file.type,
              base64,
              visibility,
            });
            onUploaded(result.data.data);
          } catch (err: any) {
            setError(err.response?.data?.error || 'Upload failed.');
          } finally {
            setBusy(false);
            e.target.value = '';
          }
        }}
        className={fieldClass}
      />
      <p className="text-xs text-muted-foreground">
        {busy
          ? 'Uploading…'
          : 'PNG, JPEG, WebP' + (visibility === 'private' ? ' or PDF' : '') + ' · maximum 5 MB'}
      </p>
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
export async function downloadFile(id: string, filename: string, token?: string) {
  const response = await api.get(`/files/${id}`, {
    responseType: 'blob',
    headers: token ? { 'X-Project-Token': token } : {},
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  const disposition = response.headers['content-disposition'] || '';
  link.download = /filename="([^"]+)"/.exec(disposition)?.[1] || filename;
  link.click();
  URL.revokeObjectURL(url);
}
