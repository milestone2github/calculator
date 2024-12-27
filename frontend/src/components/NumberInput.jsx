import React, { useState } from 'react'

function NumberInput({
  label,
  value,
  onChange = () => {},
  icon,
  placeholder,
  id,
  minValue = 0,
  maxValue = Number.MAX_VALUE,
  isRequired = false,
  iconPosition = 'left',
  validate = () => {}
}) {
  const [errmsg, setErrmsg] = useState('');

  function handleChange(e) {
    const { value } = e.target;
    if (value >= minValue && value <= maxValue) {
      onChange(e);
    }
  }

  const handleBlur = (e) => {
    const error = validate(e.target.value); 
    setErrmsg(error);
  };

  return (
    <div>
      <label htmlFor={id} className='text-cool-gray text-base font-medium'>{label}</label>
      <div className='relative mt-1 rounded'>
        <input
          type="text"
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={minValue}
          max={maxValue}
          placeholder={placeholder}
          required={isRequired}
          className={`text-lg w-full shadow-input text-dark-blue font-roboto font-medium bg-flash-white shadow-md py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-azure-blue ${iconPosition === 'left' ? 'ps-8' : ''}`}
        />
        {icon && (<i className={`absolute top-2 font-normal font-roboto text-cool-gray text-lg ${iconPosition === 'left' ? 'left-3' : 'right-3'}`}>{icon}</i>)}
      </div>
      {errmsg && <p className='text-red-500 text-sm'>{errmsg}</p>}
    </div>
  )
}

export default NumberInput