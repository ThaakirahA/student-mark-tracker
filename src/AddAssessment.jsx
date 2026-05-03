import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AddAssessment({ subject, session, onAssessmentAdded }) {
  const [title, setTitle] = useState('')
  const [mark, setMark] = useState('')
  const [total, setTotal] = useState('')
  const [weight, setWeight] = useState('')

  async function handleAdd(e) {
    e.preventDefault()

    if (Number(weight) > 100) {
      alert('Weight cannot be more than 100%')
      return
    }

    if (Number(mark) > Number(total)) {
      alert('Mark cannot be greater than total')
      return
    }

    const { error } = await supabase.from('assessments').insert([
      {
        subject_id: subject.id,
        user_id: session.user.id,
        title,
        mark_obtained: Number(mark),
        total_mark: Number(total),
        weight: Number(weight),
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    setTitle('')
    setMark('')
    setTotal('')
    setWeight('')

    if (onAssessmentAdded) {
      onAssessmentAdded()
    }
  }

  return (
    <form onSubmit={handleAdd}>
      <input
        placeholder="Test / Assignment / Exam name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Mark obtained"
        value={mark}
        onChange={(e) => setMark(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Total mark"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Weight %"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        required
      />

      <button type="submit">Add Assessment</button>
    </form>
  )
}

