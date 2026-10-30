import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Field, Pagination, fieldClass } from '../../components/common/Forms';
const blank = {
  clientName: '',
  company: '',
  role: 'Client',
  rating: 5,
  reviewText: '',
  avatarUrl: '',
  isApproved: false,
  isFeatured: false,
};
export function TestimonialsEditorPage() {
  const [rows, setRows] = useState<any[]>([]),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [search, setSearch] = useState(''),
    [form, setForm] = useState(blank),
    [editing, setEditing] = useState(''),
    [open, setOpen] = useState(false),
    [error, setError] = useState('');
  const load = async () => {
    const response = await api.get('/testimonials/admin/all', {
      params: { page, search, limit: 20 },
    });
    setRows(response.data.data || []);
    setPages(response.data.meta?.totalPages || 1);
  };
  useEffect(() => {
    load();
  }, [page, search]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl">Testimonials and moderation</h1>
      <Field
        label="Search reviews"
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
      <button
        onClick={() => {
          setEditing('');
          setForm(blank);
          setOpen(true);
        }}
        className="rounded-xl bg-primary px-5 py-2"
      >
        Add review
      </button>
      {error && <p role="alert">{error}</p>}
      {rows.map((row) => (
        <article key={row._id} className="border border-border rounded-xl p-4 space-y-2">
          <h2>
            {row.clientName} · {row.rating}/5
          </h2>
          <p>{row.reviewText}</p>
          <p>
            {row.isApproved ? 'Published' : 'Awaiting approval'}
            {row.isFeatured ? ' · Featured' : ''}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                const { _id, createdAt, updatedAt, __v, ...values } = row;
                setEditing(_id);
                setForm({ ...blank, ...values });
                setOpen(true);
              }}
            >
              Edit
            </button>
            <button
              onClick={async () => {
                await api.put(`/testimonials/${row._id}/approve`, { isApproved: !row.isApproved });
                load();
              }}
            >
              {row.isApproved ? 'Unpublish' : 'Approve'}
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Delete this review?')) {
                  await api.delete(`/testimonials/${row._id}`);
                  load();
                }
              }}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
      <Pagination page={page} totalPages={pages} onChange={setPage} />
      {open && (
        <form
          className="space-y-4 rounded-xl border border-border p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            try {
              if (editing) await api.put(`/testimonials/${editing}`, form);
              else await api.post('/testimonials/admin', form);
              setOpen(false);
              load();
            } catch (err: any) {
              setError(err.response?.data?.error || 'Unable to save review.');
            }
          }}
        >
          <h2>{editing ? 'Edit review' : 'Add review'}</h2>
          {(['clientName', 'company', 'role', 'avatarUrl'] as const).map((key) => (
            <Field
              key={key}
              label={
                {
                  clientName: 'Client name',
                  company: 'Company',
                  role: 'Client role',
                  avatarUrl: 'Avatar URL',
                }[key]
              }
              value={form[key]}
              onChange={(value) => setForm({ ...form, [key]: value })}
              required={key === 'clientName'}
            />
          ))}
          <Field
            label="Review text"
            value={form.reviewText}
            onChange={(value) => setForm({ ...form, reviewText: value })}
            multiline
            required
          />
          <label htmlFor="review-rating">Rating</label>
          <select
            id="review-rating"
            className={fieldClass}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <label className="block">
            <input
              type="checkbox"
              checked={form.isApproved}
              onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
            />{' '}
            Published
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />{' '}
            Featured
          </label>
          <button className="rounded-xl bg-primary px-5 py-2">Save review</button>
          <button type="button" className="ml-4" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
