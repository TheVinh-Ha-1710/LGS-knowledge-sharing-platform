function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, label: 'Metadata' },
    { number: 2, label: 'Content' },
    { number: 3, label: 'Review' }
  ]

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step.number} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div className="step-item">
            <div className={`step-circle ${
              step.number < currentStep ? 'done' :
              step.number === currentStep ? 'current' : 'upcoming'
            }`}>
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <div className={`step-label ${
              step.number < currentStep ? 'done' :
              step.number === currentStep ? 'current' : ''
            }`}>
              {step.label}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${step.number < currentStep ? 'done' : 'upcoming'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default StepIndicator
