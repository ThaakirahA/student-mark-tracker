import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AddAssessment from './AddAssessment'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

export default function SubjectCard({ subject, session }) {
  const [assessments, setAssessments] = useState([])

  async function fetchAssessments() {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setAssessments(data)
  }

  async function deleteAssessment(id) {
    const confirmDelete = confirm('Delete this assessment?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      alert(error.message)
      return
    }

    fetchAssessments()
  }

  useEffect(() => {
    fetchAssessments()
  }, [subject.id])

  const totalWeight = assessments.reduce(
    (sum, item) => sum + Number(item.weight),
    0
  )

  const currentYearMark = assessments.reduce((sum, item) => {
    const percentage =
      (Number(item.mark_obtained) / Number(item.total_mark)) * 100

    const contribution =
      (percentage * Number(item.weight)) / 100

    return sum + contribution
  }, 0)

  const predictedFinal =
    totalWeight > 0 ? (currentYearMark / totalWeight) * 100 : 0

  // ✅ SMART PREDICTION (correct place)
  const targetMark = 50
  const remainingWeight = 100 - totalWeight

  const markNeeded =
    remainingWeight > 0
      ? ((targetMark - currentYearMark) / remainingWeight) * 100
      : 0

  const chartData = assessments.map((item) => {
    const percentage =
      (Number(item.mark_obtained) / Number(item.total_mark)) * 100

    const contribution =
      (percentage * Number(item.weight)) / 100

    return {
      name: item.title,
      contribution: Number(contribution.toFixed(2)),
    }
  })

  return (
    <div className="subject-card">
      <div className="subject-header">
        <div>
          <h3>📘 {subject.name}</h3>
          <p className="muted-text">
            Monitor your progress and predict your final grade
          </p>
        </div>

        <span className="weight-badge">
          {totalWeight}% completed
        </span>
      </div>

      <AddAssessment
        subject={subject}
        session={session}
        onAssessmentAdded={fetchAssessments}
      />

      <div className="progress-wrapper">
        <div className="progress-label">
          <span>Year Weight Progress</span>
          <span>{totalWeight}% / 100%</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          ></div>
        </div>
      </div>

      <h4>📊 Assessments</h4>

      {assessments.length === 0 ? (
        <p className="muted-text">No assessments added yet.</p>
      ) : (
        <>
          <div className="assessment-grid">
            {assessments.map((item) => {
              const percentage =
                (Number(item.mark_obtained) / Number(item.total_mark)) * 100

              const contribution =
                (percentage * Number(item.weight)) / 100

              return (
                <div className="assessment-card" key={item.id}>
                  <div className="assessment-top">
                    <strong>{item.title}</strong>
                    <span>{item.weight}%</span>
                  </div>

                  <p>Mark: {item.mark_obtained}/{item.total_mark}</p>
                  <p>Percentage: {percentage.toFixed(2)}%</p>
                  <p>Contribution: {contribution.toFixed(2)}%</p>

                  <button
                    className="danger-btn"
                    onClick={() => deleteAssessment(item.id)}
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>

          <div className="chart-box">
            <h4>📊 Performance Breakdown</h4>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    color: '#111827'
                  }}
                  labelStyle={{ color: '#111827' }}
                  itemStyle={{ color: '#111827' }}
                />
                <Bar
                  dataKey="contribution"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Completed Weight</span>
          <strong>{totalWeight}%</strong>
        </div>

        <div className="summary-card">
          <span>Current Year Mark</span>
          <strong>{currentYearMark.toFixed(2)}%</strong>
        </div>

        <div className="summary-card">
          <span>Predicted Final</span>
          <strong>{predictedFinal.toFixed(2)}%</strong>
        </div>

        <div className="summary-card">
          <span>Remaining Weight</span>
          <strong>{remainingWeight}%</strong>
        </div>

        <div className="summary-card">
          <span>Needed to Pass 50%</span>
          <strong>
            {remainingWeight > 0
              ? `${markNeeded.toFixed(2)}%`
              : 'Completed'}
          </strong>
        </div>
      </div>
    </div>
  )
}