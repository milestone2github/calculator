import { useState } from "react";

const RangeInput = ({
  id,
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange = () => {},
  errmsg,
  isRequired = false,
}) => {
  const getBackground = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #397FFF ${percentage}%, #e5e7eb ${percentage}%)`;
  };

  return (
    <div className="flex flex-col w-full gap-y-2">
      {/* Label */}
      <div className="flex justify-between w-full">
        <label className="text-base font-medium text-cool-gray">{label}</label>
        <span className="text-sm text-gray-400">
          {value} {unit}
        </span>
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
          onChange={onChange}
          required={isRequired}
          className="custom-slider"
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
        <span>
          {max} {unit}
        </span>
      </div>
      {errmsg && <p className="text-red-500 text-sm -mt-1">{errmsg}</p>}
    </div>
  );
};

export default RangeInput;
