import React, { useEffect, useState } from 'react'
import NumberInput from '../components/NumberInput'
import RangeInput from '../components/RangeInput'
import RetirementResult from '../components/RetirementResult';
import OTPModal from '../components/OTPModal';
import StatusModal from '../components/StatusModal';
import { toIndianNumber } from '../utils/Formats';
import { useError } from '../context/ErrorContext';
import Alert from '../components/Alert';
import Cookies from 'js-cookie';

const initialFieldValues = {
  currentAge: 0,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlyExpense: '',
  annualInflation: '',
  accumulationPhaseReturn: '',
  withdrawalPhaseReturn: '',
  existingInvestment: '',
  existingSip: '',
  postRetirementIncome: ''
}

const initialResult = {
  totalCorpusNeeded: null,
  totalSipRequired: null,
  lumpSumRequired: null,
  monthlyPensionAmount: null,
  monthlyExpenseAtRetirement: null,
  yearsToRetirement: null
}

function RetirementCalculator() {
  const [fields, setFields] = React.useState(initialFieldValues);
  const [results, setResults] = useState(initialResult);
  const [investmentMix, setInvestmentMix] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldShowResult, setShouldShowResult] = useState(false);
  const [calcDataError, setCalcDataError] = useState('');
  const [calcDataStatus, setCalcDataStatus] = useState('idle'); // completed | pending | failed

  const [returnedFromGoogleOauth, setReturnedFromGoogleOauth] = useState(false);

  const { errors, setError, clearError } = useError();
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const searchParam = new URLSearchParams(window.location.search);
  const cid = searchParam.get('cid');

  const { currentAge, retirementAge, lifeExpectancy, monthlyExpense, annualInflation, accumulationPhaseReturn, withdrawalPhaseReturn, postRetirementIncome, existingInvestment, existingSip } = fields;

  const [alert, setAlert] = useState({
    type: '',
    message: '',
    visible: false,
  });

  document.title = 'Retirement Savings Calculator';
  
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      closeAlert();
    }, 5000); // Auto-dismiss after 5 seconds
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
    if (searchParam.get('err')) {
      window.history.pushState({}, '', `/`);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (!isNaN(Number(value)) || value === '.') {
      setFields({ ...fields, [name]: value });
    }
  };

  function shouldShowModal() {
    const secretKey = btoa('phoneNumber');
    const phoneInCookies = Cookies.get('phoneNumber');
    const phoneInLocalStorage = localStorage.getItem(secretKey)
    return !(cid || phoneInLocalStorage || phoneInCookies);
  }

  const calculateRetirementSavings = (e) => {
    e?.preventDefault();
    const hasSubmitted = e?.target?.id === 'retirement-calculator-form';

    if (Object.keys(errors).length) {
      return;
    }

    if (
      currentAge == null || currentAge === '' ||
      !retirementAge ||
      !monthlyExpense ||
      !annualInflation ||
      !accumulationPhaseReturn ||
      !withdrawalPhaseReturn ||
      currentAge > retirementAge
    ) {
      return;
    }

    const yearsToRetirement = Number(retirementAge) - Number(currentAge);
    const inflationRate = Number(annualInflation) / 100;
    const accumulationRate = Number(accumulationPhaseReturn) / 100;
    const withdrawalRate = Number(withdrawalPhaseReturn) / 100;
    const postRetirementIncomeAnnual = Number(postRetirementIncome) * 12;

    const monthlyExpenseAtRetirement =
      Number(monthlyExpense) * Math.pow(1 + inflationRate, yearsToRetirement);

    // Set the monthly pension amount equal to the monthly expense at retirement
    let monthlyPensionAmount;
    let totalCorpusNeeded;

    monthlyPensionAmount =
      (monthlyExpenseAtRetirement * 12 - postRetirementIncomeAnnual) / 12;
    totalCorpusNeeded = (monthlyPensionAmount * 12) / withdrawalRate;

    // Calculate the total corpus needed to ensure the monthly pension equals the monthly expense at retirement
    const futureValueOfExistingInvestments =
      Number(existingInvestment) *
      Math.pow(1 + accumulationRate, yearsToRetirement);

    // Calculate the future value of existing SIPs
    const futureValueOfSIP =
      (Number(existingSip) *
        (Math.pow(1 + accumulationRate / 12, yearsToRetirement * 12) - 1)) /
      (accumulationRate / 12);

    // Calculate the additional SIP or lump sum required
    const additionalFundsRequired =
      totalCorpusNeeded - futureValueOfExistingInvestments - futureValueOfSIP;

    const totalSipRequired =
      (additionalFundsRequired * investmentMix) / 100 > 0
        ? (additionalFundsRequired * investmentMix) /
        100 /
        ((Math.pow(1 + accumulationRate / 12, yearsToRetirement * 12) - 1) /
          (accumulationRate / 12))
        : 0;

    const lumpSumRequired =
      (additionalFundsRequired * (100 - investmentMix)) / 100 > 0
        ? (additionalFundsRequired * (100 - investmentMix)) /
        100 /
        Math.pow(1 + accumulationRate, yearsToRetirement)
        : 0;

    // // Calculate the lump sum required based on the investment mix
    // const lumpSumRequired = (additionalFundsRequired * investmentMix) / 100;

    // // Calculate the SIP required based on the investment mix
    // const sipRequired = (additionalFundsRequired * (100 - investmentMix)) / 100;

    setResults({
      totalCorpusNeeded,
      lumpSumRequired,
      totalSipRequired,
      monthlyPensionAmount,
      monthlyExpenseAtRetirement,
      yearsToRetirement
    });

    if (hasSubmitted && shouldShowModal()) { openModal() }
    setShouldShowResult(!shouldShowModal())
  };

  const handleInvestmentMixChange = (value) => {
    setInvestmentMix(Number(value));
  }

  useEffect(() => {
    if (
      currentAge &&
      retirementAge &&
      monthlyExpense &&
      annualInflation &&
      accumulationPhaseReturn &&
      withdrawalPhaseReturn
    ) {
      calculateRetirementSavings();
    }
  }, [investmentMix]);


  // Api call to get calculation data 
  const getCalculationDataById = async (id) => {
    setCalcDataStatus('pending');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/retirement-calculator/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 404) {
        throw new Error('Link has expired')
      }
      if (!response.ok) {
        throw new Error('Failed to get calculation data or Link has expired');
      }
      const responseData = await response.json();
      setFields(responseData?.data);
      setCalcDataStatus('completed');
    } catch (error) {
      setCalcDataError(error.message);
      setCalcDataStatus('failed');
    }
  }

  // side effect to get calculation data if cid is provided
  useEffect(() => {
    if (cid) {
      getCalculationDataById(cid);
    }
    if (searchParam.get('err') === 'oathfailed') {
      showAlert(
        'error',
        'Failed to get Google account details, try again or proceed via phone number option'
      );
    }

    // get form data from session storage if available in case of google redirect
    const savedFormState = sessionStorage.getItem('formState');
    if (savedFormState) {
      const parsedState = JSON.parse(savedFormState);
      if(parsedState && typeof parsedState === 'object') {setFields(parsedState)}
      setReturnedFromGoogleOauth(true);
      sessionStorage.removeItem('formState'); // Clean up storage
    }
  }, [])

  useEffect(() => {
    if(returnedFromGoogleOauth) {
      calculateRetirementSavings();
    }
  }, [returnedFromGoogleOauth])

  // Side effect to calculate savings after retrieving calculation data by id 
  useEffect(() => {
    if (calcDataStatus === 'completed') {
      calculateRetirementSavings()
    }
  }, [calcDataStatus])

  // Side effect to calculate savings on change of input fields 
  useEffect(() => {
    if (shouldShowResult) {
      calculateRetirementSavings()
    }
  }, [fields])

  // side effect to set error or clear error
  useEffect(() => {
    if (retirementAge < currentAge) {
      setError('retirementAge', 'Retirement age should be greater than current age');
    } else {
      clearError('retirementAge');
    }

    if (lifeExpectancy < retirementAge || lifeExpectancy < currentAge) {
      setError('lifeExpectancy', 'Life expectancy should be greater than retirement age and current age');
    } else {
      clearError("lifeExpectancy");
    }
  }, [fields.currentAge, fields.retirementAge, fields.lifeExpectancy])

  // Backend API Routes
  const sendOTP = async (phoneNumber) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }
  };

  const validateOTP = async (phoneNumber, otp) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validate-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp, formData: fields }),
    });
    if (!response.ok) {
      throw new Error('Invalid OTP');
    }
    const responseData = await response.json();
    const secretKey = btoa('phoneNumber');
    const encryptedPhone = btoa(responseData?.data.phoneNumber);
    localStorage.setItem(secretKey, encryptedPhone);
    setShouldShowResult(true);
  };

  const handleGoogleOauth = () => {
    sessionStorage.setItem('formState', JSON.stringify(fields));
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`
  };

  function validateRequiredInputs(value) {
    return value ? '' : 'Please fill out this field.';
  }

  return (
    <div className='flex flex-col items-center justify-center p-3'>
      <h1 className='text-3xl text-left font-extrabold text-dark-blue mb-7'>Retirement Savings Calculator</h1>
      <form action="" id='retirement-calculator-form' className='w-full md:max-w-3xl' onSubmit={calculateRetirementSavings}>
        <fieldset className='w-full flex flex-col gap-y-6'>
          <RangeInput
            id={'currentAge'}
            label={'Current Age'}
            value={fields.currentAge}
            min={0}
            max={120}
            step={1}
            unit={'years'}
            onChange={handleChange}
            isRequired={true}
          />
          <RangeInput
            id={'retirementAge'}
            label={'Retirement Age'}
            value={fields.retirementAge}
            min={0}
            max={120}
            step={1}
            unit={'years'}
            onChange={handleChange}
            isRequired={true}
            errmsg={errors['retirementAge']}
          />
          <RangeInput
            id={'lifeExpectancy'}
            label={'Life Expectancy'}
            value={fields.lifeExpectancy}
            min={0}
            max={120}
            step={1}
            unit={'years'}
            onChange={handleChange}
            errmsg={errors['lifeExpectancy']}
          />
        </fieldset>

        <hr className='w-full border-b border-cool-gray/20 my-7' />

        <fieldset className='w-full grid grid-cols-2 gap-6'>
          <NumberInput
            label={'Monthly Expense'}
            value={fields.monthlyExpense}
            onChange={handleChange}
            id={'monthlyExpense'}
            icon={"₹"}
            isRequired={true}
            validate={validateRequiredInputs}
          />
          <NumberInput
            label={'Annual Inflation'}
            value={fields.annualInflation}
            onChange={handleChange}
            id={'annualInflation'}
            icon={"%"}
            iconPosition='right'
            maxValue={100}
            isRequired={true}
            validate={validateRequiredInputs}
          />
          <NumberInput
            label={'Accumulation Phase Return'}
            value={fields.accumulationPhaseReturn}
            onChange={handleChange}
            id={'accumulationPhaseReturn'}
            icon={"%"}
            iconPosition='right'
            maxValue={100}
            isRequired={true}
            validate={validateRequiredInputs}
          />
          <NumberInput
            label={'Widthdrawal Phase Return'}
            value={fields.withdrawalPhaseReturn}
            onChange={handleChange}
            id={'withdrawalPhaseReturn'}
            icon={"%"}
            iconPosition='right'
            maxValue={100}
            isRequired={true}
            validate={validateRequiredInputs}
          />
        </fieldset>

        <hr className='w-full border-b border-cool-gray/20 my-7' />

        <fieldset className='w-full grid grid-cols-2 gap-6'>
          <NumberInput
            label={'Existing Investements'}
            value={fields.existingInvestment}
            onChange={handleChange}
            id={'existingInvestment'}
            icon={"₹"}
            isRequired={true}
            validate={validateRequiredInputs}
          />
          <NumberInput
            label={'Existing SIP'}
            value={fields.existingSip}
            onChange={handleChange}
            id={'existingSip'}
            icon={"₹"}
          />
          <div className='col-span-2 md:col-span-1'>
            <NumberInput
              label={'Post-Retirement Income'}
              value={fields.postRetirementIncome}
              onChange={handleChange}
              id={'postRetirementIncome'}
              icon={"₹"}
            />
          </div>
        </fieldset>

        <button type='submit' className='bg-azure-blue text-sec-white text-xl font-bold rounded-lg flex items-center justify-center w-full p-2 py-3 mt-9 mb-6 hover:bg-blue-600'>Calculate</button>

        {/* result  */}
        {shouldShowResult && <div className='mt-8'>
          <RetirementResult result={results} investmentMix={investmentMix} handleInvestmentMixChange={handleInvestmentMixChange} />
        </div>}
      </form>

      <OTPModal
        isOpen={isModalOpen}
        onClose={closeModal}
        sendOTP={sendOTP}
        validateOTP={validateOTP}
        handleGoogleOauth={handleGoogleOauth}
      />

      <StatusModal status={calcDataStatus} error={calcDataError} />

      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
        />
      )}

    </div>
  )
}

export default RetirementCalculator