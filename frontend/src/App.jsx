import { useState } from 'react'
import './App.css'
import RetirementCalculator from './pages/RetirementCalculator'
import { ErrorProvider } from './context/ErrorContext'

function App() {

  return (
    <>
      <ErrorProvider >
        <RetirementCalculator />
      </ErrorProvider>
    </>
  )
}

export default App
