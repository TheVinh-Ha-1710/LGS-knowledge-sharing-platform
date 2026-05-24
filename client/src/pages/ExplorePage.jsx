import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { MaterialCard } from '../utils.jsx'

const FIELDS = [
  { slug: 'technology',    label: '💻 Technology' },
  { slug: 'health-medicine', label: '🏥 Health & Medicine' },
  { slug: 'law-policy',   label: '⚖️ Law & Policy' },
  { slug: 'business',     label: '📊 Business' },
  { slug: 'science',      label: '🔬 Science' },
  { slug: 'general',      label: '🌐 General' }
]

const DIFFICULTIES = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' }
]

function ExplorePage() {
  const navigate = useNavigate()

  // Multi-select filter state — sets of selected slugs/values
  const [selectedFields, setSelectedFields] = useState(new Set())
  const [selectedDifficulties, setSelectedDifficulties] = useState(new Set())

  // Fetch all materials — filter client-side for multi-select
  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => api.getMaterials()
  })

  // Toggle a field filter on/off
  function toggleField(slug) {
    setSelectedFields(prev => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  // Toggle a difficulty filter on/off
  function toggleDifficulty(value) {
    setSelectedDifficulties(prev => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  function clearAll() {
    setSelectedFields(new Set())
    setSelectedDifficulties(new Set())
  }

  // Apply filters client-side — no backend call needed
  const filtered = useMemo(() => {
    if (!materials) return []
    return materials.filter(m => {
      const fieldMatch = selectedFields.size === 0 || selectedFields.has(m.field_slug)
      const diffMatch = selectedDifficulties.size === 0 || selectedDifficulties.has(m.difficulty)
      return fieldMatch && diffMatch
    })
  }, [materials, selectedFields, selectedDifficulties])

  const hasFilters = selectedFields.size > 0 || selectedDifficulties.size > 0
  const activeFilterLabels = [
    ...Array.from(selectedFields).map(slug => FIELDS.find(f => f.slug === slug)?.label),
    ...Array.from(selectedDifficulties).map(val => DIFFICULTIES.find(d => d.value === val)?.label)
  ].filter(Boolean)

  if (isLoading) return (
    <div className="app-page">
      <div className="empty-state">// loading...</div>
    </div>
  )

  return (
    <div className="app-page">
      {/* Header */}
      <div className="page-eyebrow">// knowledge base</div>
      <h1 className="page-title">Explore</h1>

      {/* Field filters */}
      <div className="filter-section">
        <div className="filter-section-label">Fields — select one or more</div>
        <div className="filter-row">
          {FIELDS.map(field => (
            <button
              key={field.slug}
              className={`filter-pill ${selectedFields.has(field.slug) ? 'active' : ''}`}
              onClick={() => toggleField(field.slug)}
            >
              {selectedFields.has(field.slug) && <span>✓</span>}
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty filters */}
      <div className="filter-section">
        <div className="filter-section-label">Difficulty — select one or more</div>
        <div className="filter-row">
          {DIFFICULTIES.map(diff => (
            <button
              key={diff.value}
              className={`filter-pill ${selectedDifficulties.has(diff.value) ? 'active' : ''}`}
              onClick={() => toggleDifficulty(diff.value)}
            >
              {selectedDifficulties.has(diff.value) && <span>✓</span>}
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter tags */}
      {hasFilters && (
        <div className="active-filters">
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}>
            Active:
          </span>
          {activeFilterLabels.map(label => (
            <span key={label} className="active-filter-tag">
              {label}
              <span
                className="active-filter-remove"
                onClick={() => {
                  const field = FIELDS.find(f => f.label === label)
                  const diff = DIFFICULTIES.find(d => d.label === label)
                  if (field) toggleField(field.slug)
                  if (diff) toggleDifficulty(diff.value)
                }}
              >×</span>
            </span>
          ))}
          <button className="filter-clear-all" onClick={clearAll}>
            Clear all ×
          </button>
        </div>
      )}

      {/* Result count */}
      <div className="results-count">
        <span>{filtered.length}</span> {filtered.length === 1 ? 'material' : 'materials'}
        {hasFilters ? ' matching your filters' : ' in the knowledge base'}
      </div>

      {/* Materials grid */}
      {filtered.length > 0 ? (
        <div className="materials-grid">
          {filtered.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={() => navigate(`/materials/${material.slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          // no materials match your filters — try removing some
        </div>
      )}
    </div>
  )
}

export default ExplorePage
