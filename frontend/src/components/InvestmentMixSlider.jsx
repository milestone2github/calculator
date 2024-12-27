import React, { useState } from 'react'

function InvestmentMixSlider({
  id,
  value,
  label,
  onChange = ()=>{},
  min,
  max,
  step,
  unit,
  isRequired = false
}) {
  const [sipAndLumpsum, setSipAndLumpsum] = useState({sip: 50, lumpsum: 50});

  const getBackground = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, rgba(27, 153, 139, .8) ${percentage}%, #e5e7eb ${percentage}%)`;
  };

  function handleSliderChange(e) {
    let mixValue = e.target.value;
    setSipAndLumpsum({sip: mixValue, lumpsum: 100 - mixValue});
    onChange(mixValue);
  }

  return (
    <div className="flex flex-col items-center w-full space-y-2">
      {/* Label */}
      <div className="flex justify-between w-full">
        <div className='flex gap-1 items-center'>
          <span className="text-sm font-medium text-cool-gray">SIP</span>
          <span className="text-xl font-tomorrow font-medium text-dark-blue">{sipAndLumpsum.sip}</span>
        </div>
        <div className='flex gap-1 items-center'>
          <span className="text-sm font-medium text-cool-gray">Lumpsum</span>
          <span className="text-xl font-tomorrow font-medium text-dark-blue">{sipAndLumpsum.lumpsum}</span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative w-full flex items-center">
        <input
          type="range"
          id={id}
          name={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          required={isRequired}
          className="custom-slider green-slider"
          style={{
            background: getBackground(),
          }}
        />

        {/* Value Box */}
        <div
          className="absolute top-[-48px] -translate-x-1/2 flex items-center justify-center rounded-sm bg-sec-white text-dark-blue text-lg font-semibold w-14 h-9 shadow-light"
          style={{
            left: `calc(${((value - min) / (max - min)) * 94}%)`,
            marginLeft: '8px'
          }}
        >
          {value}
        </div>
      </div>

      {/* Min and Max Labels */}
      <div className="flex justify-between w-full text-sm text-gray-400">
        <span>
          {min} {unit}
        </span>
        <label className='text-base font-medium text-cool-gray'>{label}</label>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}

export default InvestmentMixSlider