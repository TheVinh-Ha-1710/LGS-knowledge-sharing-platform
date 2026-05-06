import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { MaterialCard } from '../utils.jsx'

function ExplorePage() {
  const navigate = useNavigate()
  const [selectedField, setSelectedField] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')

  const { data: fields } = useQuery({
    queryKey: ['fields'],
    queryFn: api.getFields
  })

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', selectedField, selectedDifficulty],
    queryFn: () => api.getMaterials({
      field: selectedField,
      difficulty: selectedDifficulty
    })
  })

  if (isLoading) return (
    <div className="app-page">
      <div className="empty-state">// loading materials...</div>
    </div>
  )

  return (
    <div className="app-page">

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          // knowledge base
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Explore
        </h1>
      </div>

      {/* Field chips */}
      <div className="chip-row">
        <button
          className={`chip ${selectedField === '' ? 'active' : ''}`}
          onClick={() => setSelectedField('')}
        >
          All Fields
        </button>
        {fields?.map(field => (
          <button
            key={field.id}
            className={`chip ${selectedField === field.slug ? 'active' : ''}`}
            onClick={() => setSelectedField(field.slug)}
          >
            {field.icon} {field.name}
          </button>
        ))}
      </div>

      {/* Difficulty chips */}
      <div className="chip-row" style={{ marginBottom: 28 }}>
        {[
          { value: '', label: 'All Levels' },
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' }
        ].map(d => (
          <button
            key={d.value}
            className={`chip ${selectedDifficulty === d.value ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty(d.value)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="section-header" style={{ marginBottom: 16 }}>
        <span className="section-title">
          {materials?.length || 0} material{materials?.length !== 1 ? 's' : ''}
          {selectedField && ` in ${fields?.find(f => f.slug === selectedField)?.name}`}
        </span>
      </div>

      {/* Grid */}
      <div className="materials-grid">
        {materials?.map(material => (
          <MaterialCard
            key={material.id}
            material={material}
            onClick={() => navigate(`/materials/${material.slug}`)}
          />
        ))}
      </div>

      {materials?.length === 0 && (
        <div className="empty-state">
          // no materials found for this filter
        </div>
      )}

    </div>
  )
}

export default ExplorePage
