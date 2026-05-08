function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, label: 'Metadata' },
    { number: 2, label: 'Content' },
    { number: 3, label: 'Review' }
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
      {steps.map((step, index) => (
        <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              border: '2px solid',
              transition: 'all 0.2s',
              ...(step.number < currentStep && {
                background: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: 'var(--bg)'
              }),
              ...(step.number === currentStep && {
                background: 'transparent',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }),
              ...(step.number > currentStep && {
                background: 'transparent',
                borderColor: 'var(--border-2)',
                color: 'var(--text-3)'
              }),
            }}>
              {step.number < currentStep ? '✓' : step.number}
            </div>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              color: step.number === currentStep ? 'var(--accent)' : 'var(--text-3)',
              transition: 'color 0.2s'
            }}>
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div style={{
              width: 80,
              height: 2,
              marginBottom: 22,
              background: step.number < currentStep ? 'var(--accent)' : 'var(--border-2)',
              transition: 'background 0.2s'
            }} />
          )}

        </div>
      ))}
    </div>
  )
}

export default StepIndicator