interface SubmitButtonProps {
  title: string;
  isLoading?: boolean;
}

const SubmitButton = ({ title, isLoading }: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-base shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
    aria-label={isLoading ? 'Processing sign in' : title}
  >
    {isLoading ? 'Processing...' : title}
  </button>
);

export default SubmitButton;
