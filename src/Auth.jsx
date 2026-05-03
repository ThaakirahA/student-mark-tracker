import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Registration successful. Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Login successful.')
      }
    }
  }

  return (
    <div className="auth-container">
      <h1>Student Mark Tracker</h1>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <p>{message}</p>

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'No account? Register'}
      </button>
    </div>
  )
}