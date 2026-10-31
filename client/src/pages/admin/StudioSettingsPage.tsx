import { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { api, settingsApi, zohoApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Field, fieldClass, UploadField } from '../../components/common/Forms';
import { RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Zap } from 'lucide-react';

export function StudioSettingsPage() {
  const { settings, refresh } = useSettings();
  const { admin } = useAuth();
  const [form, setForm] = useState<any>(null),
    [path, setPath] = useState('/'),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);

  // Zoho CRM Diagnostics State
  const [zohoStatus, setZohoStatus] = useState<any>(null);
  const [pendingSyncs, setPendingSyncs] = useState<any[]>([]);
  const [zohoLoading, setZohoLoading] = useState(false);
  const [zohoFeedback, setZohoFeedback] = useState('');

  const loadZoho = async () => {
    try {
      const [status, pending] = await Promise.all([
        zohoApi.getStatus().catch(() => null),
        zohoApi.getPending().catch(() => []),
      ]);
      setZohoStatus(status);
      setPendingSyncs(pending || []);
    } catch {}
  };

  useEffect(() => {
    loadZoho();
  }, []);

  const handleRetryZoho = async () => {
    setZohoLoading(true);
    setZohoFeedback('');
    try {
      const res = await zohoApi.retrySync();
      setZohoFeedback(`Sync queue processed: ${res.data?.processed || 0} succeeded, ${res.data?.remaining || 0} remaining.`);
      loadZoho();
    } catch (err: any) {
      setZohoFeedback('Retry failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setZohoLoading(false);
    }
  };

  const handleTestPing = async () => {
    setZohoLoading(true);
    setZohoFeedback('');
    try {
      const res = await zohoApi.testLead();
      setZohoFeedback(res.message || 'Zoho CRM test ping succeeded!');
      loadZoho();
    } catch (err: any) {
      setZohoFeedback('Test ping failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setZohoLoading(false);
    }
  };

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
    <div className="space-y-8 max-w-4xl">
      {/* ======================================================== */}
      {/* ZOHO CRM INTEGRATION & DIAGNOSTICS SECTION               */}
      {/* ======================================================== */}
      <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#203C3D]/10 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#FEDAB8] text-[#203C3D]">
                <Zap className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-black text-[#203C3D]">Zoho CRM Integration Status</h2>
            </div>
            <p className="text-xs font-bold text-[#4D6768] mt-1">
              Synchronizes inquiries, quotation requests, and customer consultations directly into Zoho CRM Leads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={zohoLoading}
              className="px-3.5 py-1.5 rounded-xl border border-[#203C3D]/25 bg-white hover:bg-zinc-50 text-xs font-black text-[#203C3D] transition-all disabled:opacity-50"
            >
              Test Diagnostic Ping
            </button>
            <button
              type="button"
              onClick={handleRetryZoho}
              disabled={zohoLoading || pendingSyncs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#203C3D] hover:bg-[#162A2B] text-xs font-black text-[#FEDAB8] transition-all disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${zohoLoading ? 'animate-spin' : ''}`} />
              <span>Retry Sync Queue ({pendingSyncs.length})</span>
            </button>
          </div>
        </div>

        {zohoFeedback && (
          <div className="p-3 rounded-xl bg-[#EDF3F3] border border-[#203C3D]/20 text-xs font-black text-[#203C3D]">
            {zohoFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#203C3D]/10">
            <span className="text-[10px] font-black uppercase text-[#7A9394]">CRM Provider</span>
            <p className="text-xs font-black text-[#111E1F] mt-1">Zoho CRM (India DC)</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#203C3D]/10">
            <span className="text-[10px] font-black uppercase text-[#7A9394]">Destination Module</span>
            <p className="text-xs font-black text-[#111E1F] mt-1">Leads Module</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#203C3D]/10">
            <span className="text-[10px] font-black uppercase text-[#7A9394]">Configuration Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  zohoStatus?.isConfigured ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="font-black text-[#111E1F]">
                {zohoStatus?.isConfigured ? 'Configured (Active)' : 'Unconfigured'}
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FBF9F6] border border-[#203C3D]/10">
            <span className="text-[10px] font-black uppercase text-[#7A9394]">OAuth Token Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  zohoStatus?.isAuthorized ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-black text-[#111E1F]">
                {zohoStatus?.isAuthorized ? 'Authorized (Healthy)' : 'Pending OAuth'}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Queue Table if any */}
        {pendingSyncs.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-black text-[#203C3D] uppercase tracking-wider mb-2">
              Queued Recoverable Submissions ({pendingSyncs.length})
            </h4>
            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3 space-y-2">
              {pendingSyncs.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-[#203C3D] border-b border-amber-200/50 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                      {item.type}
                    </span>
                    <span className="font-bold">{item.payload?.email || item.payload?.clientEmail || 'Client submission'}</span>
                  </div>
                  <span className="text-[10px] text-amber-800">
                    Attempts: {item.attempts || 1} · {item.lastError || 'Queued for retry'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    <form
      className="max-w-4xl space-y-5"
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
    </div>
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
