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

    if (error) {
      alert(error.message)
      return
    }

    setSubjects(data)
  }

  async function addSubject(e) {
    e.preventDefault()

    const { error } = await supabase.from('subjects').insert([
      {
        name: subjectName,
        user_id: session.user.id,
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    setSubjectName('')
    fetchSubjects()
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return (
    <div className="dashboard">
      <h1>Student Mark Tracker</h1>

      <button onClick={() => supabase.auth.signOut()}>
        Logout
      </button>

      <h2>Add Subject</h2>

      <form onSubmit={addSubject}>
        <input
          type="text"
          placeholder="Example: Database Management"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          required
        />

        <button type="submit">Add Subject</button>
      </form>

      <h2>Your Subjects</h2>

      {subjects.length === 0 ? (
        <p>No subjects added yet.</p>
      ) : (
        subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            session={session}
          />
        ))
      )}
    </div>
  )
}