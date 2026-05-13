import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setIsError(false)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setIsError(true)
        setMessage(error.message)
      } else {
        setMessage('Account created — check your email to confirm.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setIsError(true)
        setMessage(error.message)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            mark<span style={{ color: 'var(--accent)' }}>track</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
            {isRegister ? 'Create account' : 'Welcome back'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {isRegister ? 'Start tracking your marks today.' : 'Sign in to your mark tracker.'}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px 28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email</div>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div style={{ marginTop: 12, marginBottom: 4, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Password</div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" style={{ marginTop: 20 }}>
              {isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              background: isError ? 'var(--fail-bg)' : 'var(--pass-bg)',
              color: isError ? 'var(--fail)' : 'var(--pass)',
              border: `1px solid ${isError ? 'var(--fail-border)' : 'var(--pass-border)'}`,
            }}>
              {message}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => { setIsRegister(!isRegister); setMessage('') }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: 'auto', padding: 0, margin: 0 }}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

      </div>
    </div>
  )
}
