import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AddAssessment from './AddAssessment'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

function getGradeClass(pct) {
  if (pct >= 75) return 'pass'
  if (pct >= 50) return 'warn'
  return 'fail'
}

function getGradeLetter(pct) {
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  return 'F'
}

const BAR_COLORS = {
  pass: '#166534',
  warn: '#92400e',
  fail: '#991b1b',
}

export default function SubjectCard({ subject, session, onDeleted }) {
  const [assessments, setAssessments] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  async function fetchAssessments() {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (error) { alert(error.message); return }
    setAssessments(data)
  }

  async function deleteAssessment(id) {
    if (!confirm('Delete this assessment?')) return
    const { error } = await supabase.from('assessments').delete().eq('id', id).eq('user_id', session.user.id)
    if (error) { alert(error.message); return }
    fetchAssessments()
  }

  async function deleteSubject() {
    if (!confirm(`Delete "${subject.name}" and all its assessments?`)) return
    await supabase.from('assessments').delete().eq('subject_id', subject.id)
    const { error } = await supabase.from('subjects').delete().eq('id', subject.id)
    if (error) { alert(error.message); return }
    if (onDeleted) onDeleted()
  }

  useEffect(() => { fetchAssessments() }, [subject.id])

  const totalWeight = assessments.reduce((sum, i) => sum + Number(i.weight), 0)

  const currentYearMark = assessments.reduce((sum, i) => {
    const pct = (Number(i.mark_obtained) / Number(i.total_mark)) * 100
    return sum + (pct * Number(i.weight)) / 100
  }, 0)

  const predictedFinal = totalWeight > 0 ? (currentYearMark / totalWeight) * 100 : 0
  const remainingWeight = 100 - totalWeight
  const markNeeded = remainingWeight > 0 ? ((50 - currentYearMark) / remainingWeight) * 100 : 0

  const chartData = assessments.map((i) => {
    const pct = (Number(i.mark_obtained) / Number(i.total_mark)) * 100
    return { name: i.title, percentage: Number(pct.toFixed(1)) }
  })

  const predictedClass = getGradeClass(predictedFinal)

  return (
    <div className="subject-card">
      {/* Header */}
      <div className="subject-header">
        <div className="subject-header-left">
          <div className="subject-icon">📘</div>
          <div>
            <h3>{subject.name}</h3>
            <p className="muted-text">
              {assessments.length === 0
                ? 'No assessments yet'
                : `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''} · ${totalWeight}% weight logged`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="weight-badge">{totalWeight}% logged</span>
          <button
            className="btn-ghost btn-sm"
            onClick={() => setCollapsed(!collapsed)}
            style={{ padding: '6px 10px' }}
          >
            {collapsed ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Add Assessment */}
          <AddAssessment subject={subject} session={session} onAssessmentAdded={fetchAssessments} />

          {/* Progress */}
          <div className="progress-wrapper">
            <div className="progress-label">
              <span>Year weight progress</span>
              <span>{totalWeight}% / 100%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(totalWeight, 100)}%` }} />
            </div>
          </div>

          {/* Assessments */}
          <h4>Assessments</h4>

          {assessments.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div>Add your first assessment above.</div>
            </div>
          ) : (
            <>
              <div className="assessment-grid">
                {assessments.map((item) => {
                  const pct = (Number(item.mark_obtained) / Number(item.total_mark)) * 100
                  const contribution = (pct * Number(item.weight)) / 100
                  const cls = getGradeClass(pct)

                  return (
                    <div className="assessment-card" key={item.id}>
                      <div className="assessment-top">
                        <strong>{item.title}</strong>
                        <span>{item.weight}%</span>
                      </div>

                      <div className="pct-row">
                        <span className={`pct-badge ${cls}`}>{pct.toFixed(1)}%</span>
                        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                          {getGradeLetter(pct)}
                        </span>
                      </div>

                      <p style={{ marginTop: 8 }}>
                        <strong>{item.mark_obtained}</strong> / {item.total_mark}
                      </p>
                      <p>Contribution: <strong>{contribution.toFixed(2)}%</strong></p>

                      <button className="danger-btn" onClick={() => deleteAssessment(item.id)}>
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Chart */}
              <div className="chart-box">
                <h4>Performance breakdown</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e5de" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b6760' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#a09d97' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e8e5de',
                        borderRadius: 10,
                        fontSize: 13,
                        color: '#1a1916',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                      }}
                      formatter={(val) => [`${val}%`, 'Score']}
                    />
                    <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={BAR_COLORS[getGradeClass(entry.percentage)]}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Summary */}
          <div className="summary-grid">
            <div className="summary-card">
              <span>Completed weight</span>
              <strong>{totalWeight}%</strong>
            </div>
            <div className="summary-card">
              <span>Current year mark</span>
              <strong>{currentYearMark.toFixed(1)}%</strong>
            </div>
            <div className={`summary-card status-${predictedClass}`}>
              <span>Predicted final</span>
              <strong>{predictedFinal.toFixed(1)}%</strong>
            </div>
            <div className="summary-card">
              <span>Remaining weight</span>
              <strong>{remainingWeight}%</strong>
            </div>
            <div className={`summary-card ${markNeeded > 100 ? 'status-fail' : markNeeded > 70 ? 'status-warn' : 'status-pass'}`}>
              <span>Needed to pass</span>
              <strong>
                {remainingWeight > 0 ? `${markNeeded.toFixed(1)}%` : '—'}
              </strong>
            </div>
          </div>

          {/* Delete subject */}
          <div className="divider" />
          <button className="danger-btn btn-sm" onClick={deleteSubject} style={{ width: 'auto' }}>
            Delete subject
          </button>
        </>
      )}
    </div>
  )
}
