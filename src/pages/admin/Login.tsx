import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Field } from '@/components/ui'
import { send } from '@/lib/api'

export default function Login() {
  const nav = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await send('POST', '/auth/login', Object.fromEntries(new FormData(e.currentTarget)))
      nav('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <img src="/logo.png" alt="Sagala Tech" className="mx-auto h-14 w-auto" />
        <h1 className="text-center text-xl font-bold text-ink">Masuk Admin</h1>
        <Field label="Username" name="username" required autoComplete="username" />
        <Field label="Password" name="password" type="password" required autoComplete="current-password" />
        {error && <Alert>{error}</Alert>}
        <Button disabled={busy} className="w-full">{busy ? 'Masuk…' : 'Masuk'}</Button>
      </form>
    </div>
  )
}
