import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Field,
  fieldClass,
  Pagination,
  UploadField,
  downloadFile,
} from '../../components/common/Forms';
export function AdminClientProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [search, setSearch] = useState(''),
    [type, setType] = useState('inquiry'),
    [leads, setLeads] = useState<any[]>([]),
    [leadPage, setLeadPage] = useState(1),
    [leadPages, setLeadPages] = useState(1),
    [leadSearch, setLeadSearch] = useState(''),
    [source, setSource] = useState(''),
    [selected, setSelected] = useState<any>(null),
    [status, setStatus] = useState('inquiry'),
    [update, setUpdate] = useState(''),
    [proposal, setProposal] = useState(''),
    [amount, setAmount] = useState(0),
    [documents, setDocuments] = useState<any[]>([]),
    [code, setCode] = useState(''),
    [meetingLink, setMeetingLink] = useState(''),
    [successMessage, setSuccessMessage] = useState(''),
    [error, setError] = useState('');
  const load = async () => {
    const response = await api.get('/client-projects', { params: { page, limit: 20, search } });
    setProjects(response.data.data);
    setPages(response.data.meta.totalPages);
  };
  useEffect(() => {
    load().catch(() => {});
  }, [page, search]);
  useEffect(() => {
    setSource('');
    api
      .get(type === 'inquiry' ? '/inquiries' : '/quotations', {
        params: { search: leadSearch, page: leadPage, limit: 20 },
      })
      .then((response) => {
        setLeads(response.data.data);
        setLeadPages(response.data.meta.totalPages);
      });
  }, [type, leadSearch, leadPage]);
  const choose = (project: any) => {
    setSelected(project);
    setStatus(project.status);
    setProposal(project.proposal || '');
    setAmount(project.quoteAmount || 0);
    setDocuments(project.documents || []);
    setMeetingLink(project.meetingLink || '');
    setUpdate('');
    setCode('');
    setError('');
    setSuccessMessage('');
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Client projects</h1>
      <p className="text-xs text-muted-foreground">
        Convert customer inquiries into client projects, prepare quotations, schedule review calls, and share private tracking codes.
      </p>
      {successMessage && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          {successMessage}
        </div>
      )}
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      <section className="rounded-xl bg-card border border-border p-5 space-y-3">
        <h2>Convert a lead</h2>
        <label htmlFor="lead-type">Request type</label>
        <select
          id="lead-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setLeadPage(1);
          }}
          className={fieldClass}
        >
          <option value="inquiry">Inquiry</option>
          <option value="quotation">Quotation request</option>
        </select>
        <Field
          label="Search customer requests"
          value={leadSearch}
          onChange={(value) => {
            setLeadSearch(value);
            setLeadPage(1);
          }}
        />
        <label htmlFor="lead-choice">Customer request</label>
        <select
          id="lead-choice"
          className={fieldClass}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">Select a request</option>
          {leads.map((lead) => (
            <option key={lead._id} value={lead._id}>
              {lead.name}: {lead.subject || lead.projectType}
            </option>
          ))}
        </select>
        <Pagination page={leadPage} totalPages={leadPages} onChange={setLeadPage} />
        <button
          disabled={!source}
          className="bg-primary rounded-xl px-4 py-2 disabled:opacity-40"
          onClick={async () => {
            setError('');
            try {
              const response = await api.post('/client-projects', {
                sourceType: type,
                sourceId: source,
              });
              choose(response.data.data.project);
              setCode(response.data.data.token);
              await load();
            } catch (err: any) {
              setError(err.response?.data?.error || 'Conversion failed.');
            }
          }}
        >
          Create client project
        </button>
      </section>
      <Field
        label="Search projects"
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((project) => (
          <button
            key={project._id}
            onClick={() => choose(project)}
            className="text-left bg-card border border-border rounded-xl p-4"
          >
            <strong>{project.title}</strong>
            <p>
              {project.clientName} · {project.status.replace('_', ' ')}
            </p>
          </button>
        ))}
      </div>
      <Pagination page={page} totalPages={pages} onChange={setPage} />
      {selected && (
        <form
          className="space-y-4 border border-border bg-card rounded-xl p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setSuccessMessage('');
            try {
              await api.put(`/client-projects/${selected._id}`, {
                status,
                update,
                proposal,
                quoteAmount: amount,
                documents: documents.map((file) => file._id || file.fileId),
                meetingLink: meetingLink.trim(),
              });
              setSuccessMessage('Client project and meeting link saved successfully!');
              setUpdate('');
              await load();
            } catch (err: any) {
              setError(err.response?.data?.error || err.message || 'Save failed.');
            }
          }}
        >
          <h2 className="text-lg font-bold text-white">{selected.title}</h2>
          <label htmlFor="project-status">Project status</label>
          <select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={fieldClass}
          >
            {['inquiry', 'quotation', 'approved', 'in_progress', 'completed', 'cancelled'].map(
              (value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ),
            )}
          </select>
          <Field
            label="Video meeting / review link"
            placeholder="https://meet.google.com/..."
            value={meetingLink}
            onChange={setMeetingLink}
          />
          <Field
            label="Quotation amount"
            type="number"
            value={amount}
            onChange={(value) => setAmount(Number(value))}
          />
          <Field
            label="Quotation scope and terms"
            value={proposal}
            onChange={setProposal}
            multiline
          />
          <Field
            label="Client-visible progress update"
            value={update}
            onChange={setUpdate}
            multiline
          />
          <UploadField
            label="Upload an approved document"
            visibility="private"
            onUploaded={(file) => setDocuments((previous) => [...previous, file])}
          />
          {documents.map((file, index) => (
            <div key={file._id || file.fileId} className="flex gap-3">
              <button
                type="button"
                className="underline"
                onClick={() => downloadFile(file._id || file.fileId, file.filename || 'document')}
              >
                {file.filename || 'Document'}
              </button>
              <button
                type="button"
                onClick={() => setDocuments((previous) => previous.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="bg-primary rounded-xl px-4 py-2">Save project</button>
          <button
            type="button"
            className="block underline"
            onClick={async () => {
              if (
                !window.confirm(
                  'Generate a new tracking code? The previous code will stop working.',
                )
              )
                return;
              const response = await api.post(`/client-projects/${selected._id}/tracking-code`);
              setCode(response.data.data.token);
            }}
          >
            Generate new tracking code
          </button>
          {code && (
            <div className="break-all space-y-2">
              <p>Share privately with the client. This code is shown only now.</p>
              <a
                className="text-primary underline"
                href={`/track#${code}`}
                target="_blank"
                rel="noreferrer"
              >
                {window.location.origin}/track#{code}
              </a>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
