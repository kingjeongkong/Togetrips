import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  fieldError?: string;
  authError?: string;
  isLast?: boolean;
}

const InputField = ({ fieldError, authError, isLast, ...props }: InputFieldProps) => {
  const getInputMarginClass = () => {
    if (fieldError) return;
    if (isLast && authError) return;
    return 'mb-4';
  };

  return (
    <div>
      <input
        {...props}
        className={`w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-900 ${getInputMarginClass()} ${
          fieldError || authError ? 'border-red-500' : 'border-gray-400'
        }`}
      />
      {fieldError && <p className="text-red-500 text-sm mt-1 mb-2 pl-1">{fieldError}</p>}
      {isLast && authError && <p className="text-red-500 text-sm mt-1 mb-1 pl-1">{authError}</p>}
    </div>
  );
};

export default InputField;
