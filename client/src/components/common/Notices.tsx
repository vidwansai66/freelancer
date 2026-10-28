import { useEffect, useState } from 'react';
export function Notices() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (typeof detail === 'string') {
        setMessage(detail);
      } else if (detail && typeof detail === 'object') {
        setMessage(detail.message || detail.error || JSON.stringify(detail));
      } else {
        setMessage(String(detail || ''));
      }
    };
    window.addEventListener('api-error', handler);
    return () => window.removeEventListener('api-error', handler);
  }, []);
  return message ? (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[100] bg-card border border-rose-400 rounded-xl p-4 shadow-xl"
    >
      <p>{message}</p>
      <button type="button" onClick={() => setMessage('')} className="underline mt-2">
        Dismiss
      </button>
    </div>
  ) : null;
}
