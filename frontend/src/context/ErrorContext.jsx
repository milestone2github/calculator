import React, { createContext, useContext, useState } from "react";

const ErrorContext = createContext();

const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState({});

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearError = (field) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  return (
    <ErrorContext.Provider value={{ errors, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

const useError = () => useContext(ErrorContext);

export { ErrorProvider, useError };
