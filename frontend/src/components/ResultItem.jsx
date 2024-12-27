import React from 'react'
import { toIndianNumber } from '../utils/Formats';

export default function ResultItem({value, label, unit}) {
  return (
    <div className='flex flex-col items-center bg-persian-green py-4 px-3 w-full rounded-lg'>
      <p className='text-2xl font-semibold text-sec-white font-tomorrow'>{unit} {unit === '₹' ? toIndianNumber(value): value}</p>
      <span className='text-xs text-flash-white mt-1'>{label}</span>
    </div>
  )
}
