import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Pagination } from '../../components/common/Forms';
export function AdminNotificationsPage() {
  const [records, setRecords] = useState<any[]>([]),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1);
  useEffect(() => {
    api.get('/notifications', { params: { page, limit: 20 } }).then((response) => {
      setRecords(response.data?.data || []);
      setPages(response.data?.meta?.totalPages || 1);
    });
  }, [page]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl">Notification records</h1>
      <p>
        Email delivery is deferred for now. These records show events without claiming that a
        message reached an inbox.
      </p>
      {records.map((record) => (
        <article key={record._id} className="border border-border rounded-xl p-4">
          <h2>{record.subject}</h2>
          <p>
            {record.to} · {record.status}
          </p>
          <time>{new Date(record.createdAt).toLocaleString()}</time>
        </article>
      ))}
      <Pagination page={page} totalPages={pages} onChange={setPage} />
    </div>
  );
}
