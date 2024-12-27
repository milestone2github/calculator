import React, { useEffect, useRef } from 'react'
import ResultItem from './ResultItem'
import InvestmentMixSlider from './InvestmentMixSlider'

function RetirementResult({result, investmentMix, handleInvestmentMixChange}) {
  const {totalCorpusNeeded, totalSipRequired, lumpSumRequired, monthlyPensionAmount, monthlyExpenseAtRetirement, yearsToRetirement} = result;
  const investmentMixRef = useRef(null);

  useEffect(() => {
    investmentMixRef.current.scrollIntoView();
  }, [])

  return (
    <>
    <ul className='grid grid-cols-12 gap-1 '>
      <li className='col-span-5'>
        <ResultItem label='Years to Retirement' value={yearsToRetirement} />
      </li>
      <li className="col-span-7">
        <ResultItem label='Total SIP Required' value={totalSipRequired} unit='₹' />
      </li>
      <li className="col-span-12 md:col-span-6">
        <ResultItem label='Total Corpus Needed' value={totalCorpusNeeded} unit='₹' />
      </li>
      <li className="col-span-12 md:col-span-6">
        <ResultItem label='Total Lumpsum Required' value={lumpSumRequired} unit='₹' />
      </li>
      <li className="col-span-12 md:col-span-6">
        <ResultItem label='Monthly Pension Amount' value={monthlyPensionAmount} unit='₹' />
      </li>
      <li className="col-span-12 md:col-span-6">
        <ResultItem label='Monthly Expense at Retirement' value={monthlyExpenseAtRetirement} unit='₹' />
      </li>
    </ul>
    <div ref={investmentMixRef} className='my-6'>
      <InvestmentMixSlider 
        id={'investmentMix'}
        label={'Investment Mix'}
        value={investmentMix}
        onChange={handleInvestmentMixChange}
        min={0}
        max={100}
        step={1}
        unit={'%'}
      />
    </div>
    </>
  )
}

export default RetirementResult