import { useState } from 'react';
import { api } from '../../services/api';
import { Field, downloadFile } from '../../components/common/Forms';
import { Seo } from '../../components/common/Seo';

export function TrackingPage() {
  const [token, setToken] = useState(() => window.location.hash.slice(1)),
    [project, setProject] = useState<any>(null),
    [error, setError] = useState('');
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 space-y-6">
      <Seo title="Track Project" noindex={true} />
      <h1 className="text-3xl">Track your project</h1>
      <p>
        Enter the private code shared by the studio. Keep it safe: it gives access to your project
        and approved documents.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            setProject((await api.post('/client-projects/track', { token })).data.data);
          } catch (err: any) {
            setProject(null);
            setError(err.response?.data?.error || 'Unable to load project.');
          }
        }}
        className="space-y-4"
      >
        <Field label="Private tracking code" value={token} onChange={setToken} required />
        <button className="rounded-xl bg-primary px-5 py-2">View project</button>
      </form>
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      {project && (
        <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-2xl">{project.title}</h2>
          <p className="capitalize">Status: {project.status.replace('_', ' ')}</p>
          {project.meetingLink && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Scheduled Project Review
                </span>
                <p className="text-xs text-white font-mono truncate">{project.meetingLink}</p>
              </div>
              <a
                href={project.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition text-center whitespace-nowrap"
              >
                Join Video Call
              </a>
            </div>
          )}
          {project.proposal && (
            <div>
              <h3>Quotation · ${project.quoteAmount}</h3>
              <p className="whitespace-pre-wrap">{project.proposal}</p>
            </div>
          )}
          <h3>Project updates</h3>
          <ol className="space-y-3">
            {project.updates.map((item: any, index: number) => (
              <li key={index}>
                <time className="text-xs text-muted-foreground">
                  {new Date(item.at).toLocaleString()}
                </time>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <h3>Approved documents</h3>
          {project.documents.map((file: any) => (
            <button
              key={file._id}
              className="block underline text-primary"
              onClick={() => downloadFile(file._id, file.filename, token)}
            >
              {file.filename}
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
