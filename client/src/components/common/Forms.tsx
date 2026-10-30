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
const compressImage = async (imageFile: File): Promise<{ dataUrl: string; base64: string; mime: string }> => {
  if (!imageFile.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const full = String(reader.result);
        resolve({ dataUrl: full, base64: full.split(',')[1] || '', mime: imageFile.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = String(ev.target?.result);
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const targetMime = imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const compressedDataUrl = canvas.toDataURL(targetMime, 0.82);
            resolve({
              dataUrl: compressedDataUrl,
              base64: compressedDataUrl.split(',')[1] || '',
              mime: targetMime,
            });
            return;
          }
        } catch {
          // fallback
        }
        resolve({
          dataUrl: rawDataUrl,
          base64: rawDataUrl.split(',')[1] || '',
          mime: imageFile.type,
        });
      };
      img.onerror = () => {
        resolve({
          dataUrl: rawDataUrl,
          base64: rawDataUrl.split(',')[1] || '',
          mime: imageFile.type,
        });
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      resolve({ dataUrl: '', base64: '', mime: imageFile.type });
    };
    reader.readAsDataURL(imageFile);
  });
};

export function UploadField({
  label,
  visibility = 'public',
  onUploaded,
}: {
  label: string;
  visibility?: 'public' | 'private';
  onUploaded: (file: { fileId: string; token: string; filename: string; url: string; dataUrl?: string }) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadedName, setUploadedName] = useState('');

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-black text-[#203C3D] uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border select-none ${
            busy
              ? 'bg-zinc-200 text-zinc-500 border-zinc-300 cursor-not-allowed'
              : 'bg-[#203C3D] hover:bg-[#162A2B] text-[#FEDAB8] border-[#FEDAB8]/30 shadow-sm hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {busy ? (
            <>
              <span className="h-3.5 w-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4 text-[#FEDAB8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{uploadedName ? 'Change Selected File' : 'Choose File from Computer'}</span>
            </>
          )}
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
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError('');
            if (file.size > 10 * 1024 * 1024) {
              setError('Choose a file smaller than 10 MB.');
              return;
            }
            setBusy(true);
            try {
              const { dataUrl, base64, mime } = await compressImage(file);
              let serverData: any = {};
              try {
                const result = await api.post('/files', {
                  filename: file.name,
                  mime,
                  base64,
                  visibility,
                });
                serverData = result.data?.data || {};
              } catch {
                // Serverless or offline fallback
              }

              setUploadedName(file.name);
              // Use permanent dataUrl so the image is self-contained and never lost on refresh
              onUploaded({
                fileId: serverData.fileId || `local-${Date.now()}`,
                token: serverData.token || '',
                filename: file.name,
                url: dataUrl || serverData.url,
                dataUrl,
              });
            } catch (err: any) {
              setError(err.response?.data?.error || 'Upload failed. Please try another file.');
            } finally {
              setBusy(false);
            }
          }}
        />
        <div className="flex-1 min-w-[140px] truncate">
          {uploadedName ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl shadow-xs">
              <svg className="h-3.5 w-3.5 text-emerald-700 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate">{uploadedName}</span>
            </span>
          ) : (
            <span className="text-xs text-[#4D6768] font-bold">No file selected yet</span>
          )}
        </div>
      </div>
      <p className="text-[11px] text-[#7A9394] font-semibold">
        PNG, JPEG, WebP{visibility === 'private' ? ' or PDF' : ''} · maximum 5 MB
      </p>
      {error && (
        <p role="alert" className="text-xs font-black text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
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
