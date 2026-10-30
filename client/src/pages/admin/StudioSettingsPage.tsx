import { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { api, settingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Field, fieldClass, UploadField } from '../../components/common/Forms';
export function StudioSettingsPage() {
  const { settings, refresh } = useSettings();
  const { admin } = useAuth();
  const [form, setForm] = useState<any>(null),
    [path, setPath] = useState('/'),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setForm({
      ...settings,
      pageSeo: settings.pageSeo || {},
      businessHours: settings.businessHours || {
        start: '09:00',
        end: '18:00',
        workDays: [1, 2, 3, 4, 5],
      },
      socialLinks: settings.socialLinks || {},
      slotDurationMinutes: settings.slotDurationMinutes || 30,
    });
  }, [settings]);
  if (!form) return <p>Loading settings…</p>;
  if (admin?.role !== 'superadmin') return <p>The studio owner manages website settings.</p>;
  const change = (key: string, value: any) => setForm({ ...form, [key]: value });
  return (
    <form
      className="max-w-3xl space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        setMessage('');
        try {
          const { _id, createdAt, updatedAt, __v, ...payload } = form;
          await settingsApi.update(payload);
          await refresh();
          window.dispatchEvent(new Event('settings-updated'));
          setMessage('Website settings saved.');
        } catch (err: any) {
          setError(err.response?.data?.error || 'Unable to save settings.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="text-2xl">Website settings</h1>
      {message && <p role="status">{message}</p>}
      {error && (
        <p role="alert" className="text-rose-300">
          {error}
        </p>
      )}
      <Field
        label="Studio name"
        value={form.studioName}
        onChange={(value) => change('studioName', value)}
        required
      />
      <Field label="Tagline" value={form.tagline} onChange={(value) => change('tagline', value)} />
      <Field
        label="Public contact email"
        type="email"
        value={form.contactEmail}
        onChange={(value) => change('contactEmail', value)}
        required
      />
      <UploadField
        label="Upload logo"
        currentName={form.logoUrl ? 'Logo attached' : ''}
        onUploaded={(file) => change('logoUrl', file.dataUrl || file.url)}
      />
      <Field
        label="Logo URL"
        value={form.logoUrl || ''}
        onChange={(value) => change('logoUrl', value)}
      />
      <Field
        label="Brand colour"
        type="color"
        value={form.brandColor || '#6366f1'}
        onChange={(value) => change('brandColor', value)}
      />
      <Field
        label="Footer description"
        value={form.footerText || ''}
        onChange={(value) => change('footerText', value)}
        multiline
      />
      <h2 className="text-xl">Consultation rules</h2>
      <Field
        label="Time zone"
        value={form.timeZone || 'Asia/Kolkata'}
        onChange={(value) => change('timeZone', value)}
        required
      />
      <Field
        label="Notice required to cancel or reschedule (hours)"
        type="number"
        value={form.cancellationHours ?? 24}
        onChange={(value) => change('cancellationHours', Number(value))}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Opening time"
          type="time"
          value={form.businessHours.start}
          onChange={(value) => change('businessHours', { ...form.businessHours, start: value })}
        />
        <Field
          label="Closing time"
          type="time"
          value={form.businessHours.end}
          onChange={(value) => change('businessHours', { ...form.businessHours, end: value })}
        />
      </div>
      <Field
        label="Consultation length (minutes)"
        type="number"
        value={form.slotDurationMinutes}
        onChange={(value) => change('slotDurationMinutes', Number(value))}
      />
      <fieldset>
        <legend>Working days</legend>
        <div className="flex flex-wrap gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={form.businessHours.workDays.includes(index + 1)}
                onChange={(e) =>
                  change('businessHours', {
                    ...form.businessHours,
                    workDays: e.target.checked
                      ? [...form.businessHours.workDays, index + 1]
                      : form.businessHours.workDays.filter((value: number) => value !== index + 1),
                  })
                }
              />{' '}
              {day}
            </label>
          ))}
        </div>
      </fieldset>
      <h2 className="text-xl">Social links</h2>
      {['github', 'linkedin', 'twitter', 'dribbble'].map((key) => (
        <Field
          key={key}
          label={key}
          value={form.socialLinks[key] || ''}
          onChange={(value) => change('socialLinks', { ...form.socialLinks, [key]: value })}
        />
      ))}
      <h2 className="text-xl">Page search metadata</h2>
      <label htmlFor="seo-page">Page</label>
      <select
        id="seo-page"
        className={fieldClass}
        value={path}
        onChange={(e) => setPath(e.target.value)}
      >
        {[
          '/',
          '/about',
          '/services',
          '/portfolio',
          '/pricing',
          '/contact',
          '/quote',
          '/book',
          '/reviews',
          '/blog',
          '/faqs',
          '/privacy',
          '/terms',
        ].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      {['title', 'description'].map((key) => (
        <Field
          key={key}
          label={key === 'title' ? 'Page title' : 'Search description'}
          value={form.pageSeo[path]?.[key] || ''}
          onChange={(value) =>
            change('pageSeo', {
              ...form.pageSeo,
              [path]: { title: '', description: '', ...form.pageSeo[path], [key]: value },
            })
          }
          multiline={key === 'description'}
        />
      ))}
      <button disabled={busy} className="rounded-xl bg-primary px-5 py-3 disabled:opacity-50">
        {busy ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
export function AdminUsersPage() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<any[]>([]),
    [email, setEmail] = useState(''),
    [name, setName] = useState(''),
    [password, setPassword] = useState(''),
    [role, setRole] = useState('admin'),
    [message, setMessage] = useState('');
  const load = () => api.get('/auth/users').then((response) => setUsers(response.data.data));
  useEffect(() => {
    if (admin?.role === 'superadmin') load();
  }, [admin]);
  if (admin?.role !== 'superadmin') return <p>Only the studio owner can manage administrators.</p>;
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl">Administrator accounts</h1>
      <p>
        Administrators manage customers and content. Owners also manage accounts and website
        settings.
      </p>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.fullName} · {user.email} · {user.role}
          </li>
        ))}
      </ul>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api.post('/auth/users', { email, fullName: name, password, role });
            setPassword('');
            setMessage('Account created.');
            load();
          } catch (err: any) {
            setMessage(err.response?.data?.error || 'Could not create account.');
          }
        }}
      >
        <Field label="Name" value={name} onChange={setName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field
          label="Temporary password (at least 12 characters)"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <label htmlFor="admin-role">Permission level</label>
        <select
          id="admin-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={fieldClass}
        >
          <option value="admin">Administrator</option>
          <option value="superadmin">Owner</option>
        </select>
        <button className="bg-primary rounded-xl px-5 py-2">Create account</button>
        <p role="status">{message}</p>
      </form>
    </div>
  );
}
