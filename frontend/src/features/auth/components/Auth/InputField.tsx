import React from 'react';

interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldError?: string;
  authError?: string;
  isLast?: boolean;
}

const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  fieldError,
  authError,
  isLast
}: InputFieldProps) => {
  const getInputMarginClass = () => {
    if (fieldError) return;
    if (isLast && authError) return;
    return 'mb-4';
  };

  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`block p-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${getInputMarginClass()} ${
          fieldError || authError ? 'border-red-500' : 'border-gray-400'
        }`}
      />
      {fieldError && (
        <p className="text-red-500 text-sm mb-2 pl-1">{fieldError}</p>
      )}
    </>
  );
};

export default InputField;
