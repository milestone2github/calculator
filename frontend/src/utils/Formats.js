export function toIndianNumber(num) {
  if (num === null || num === undefined || num === '') {
    return ''; // Return empty string for null/undefined/empty
  }

  const parsedNumber = Number(num);
  
  if (isNaN(parsedNumber)) {
    return ''; // Return empty string for invalid number input
  }

  return parsedNumber.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0, 
  });
}
