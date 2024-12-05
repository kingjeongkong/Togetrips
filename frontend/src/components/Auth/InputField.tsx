import React from 'react';

interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  error
}: InputFieldProps) => {
  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`block p-2 w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
          error ? 'border-red-500' : 'border-gray-400 mb-2'
        }`}
      />
      {error && <p className="text-red-500 text-sm mb-1 pl-1">{error}</p>}
    </>
  );
};

export default InputField;
