import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import SubjectCard from './SubjectCard'

export default function Dashboard({ session }) {
  const [subjectName, setSubjectName] = useState('')
  const [subjects, setSubjects] = useState([])

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) { alert(error.message); return }
    setSubjects(data)
  }

  async function addSubject(e) {
    e.preventDefault()
    const { error } = await supabase.from('subjects').insert([{ name: subjectName, user_id: session.user.id }])
    if (error) { alert(error.message); return }
    setSubjectName('')
    fetchSubjects()
  }

  useEffect(() => { fetchSubjects() }, [])

  return (
    <>
      <div className="topbar">
        <div className="topbar-logo">mark<span>track</span></div>
        <div className="topbar-actions">
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 4 }}>
            {session.user.email}
          </span>
          <button className="btn-ghost btn-sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>

      <div className="dashboard">
        <div className="page-title">My Subjects</div>
        <div className="page-subtitle">Track assessments and predict your final marks.</div>

        <h2>Add a subject</h2>
        <form onSubmit={addSubject} className="add-subject-form">
          <input
            type="text"
            placeholder="e.g. Database Management"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            required
          />
          <button type="submit" className="btn-sm" style={{ width: 'auto' }}>
            + Add subject
          </button>
        </form>

        {subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div>No subjects yet — add one above to get started.</div>
          </div>
        ) : (
          <>
            <h2>Your subjects</h2>
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                session={session}
                onDeleted={fetchSubjects}
              />
            ))}
          </>
        )}
      </div>
    </>
  )
}
