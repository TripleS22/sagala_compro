import { Button, Loading } from '@/components/ui'
import { type Message, formatDate, send, useFetch } from '@/lib/api'

export default function Messages() {
  const { data, loading, error, setData } = useFetch<Message[]>('/admin/messages')

  async function toggle(m: Message) {
    await send('PATCH', `/admin/messages/${m.id}`, { is_read: !m.is_read })
    setData((data ?? []).map((x) => (x.id === m.id ? { ...x, is_read: m.is_read ? 0 : 1 } : x)))
  }
  async function remove(m: Message) {
    if (!confirm('Hapus pesan ini?')) return
    await send('DELETE', `/admin/messages/${m.id}`)
    setData((data ?? []).filter((x) => x.id !== m.id))
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-ink">Pesan Masuk</h1>
      {loading && <Loading />}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {data?.length === 0 && <p className="mt-6">Belum ada pesan.</p>}
      <div className="mt-6 space-y-3">
        {data?.map((m) => (
          <div key={m.id} className={`rounded-xl border bg-white p-4 ${m.is_read ? 'border-slate-200' : 'border-brand-500'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">{m.subject || '(tanpa subjek)'}</p>
                <p className="text-sm">
                  {m.name} · <a className="text-brand-600" href={`mailto:${m.email}`}>{m.email}</a> · {formatDate(m.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => toggle(m)}>
                  {m.is_read ? 'Tandai belum dibaca' : 'Tandai dibaca'}
                </Button>
                <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => remove(m)}>Hapus</Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
