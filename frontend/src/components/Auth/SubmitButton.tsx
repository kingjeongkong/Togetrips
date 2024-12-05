interface SubmitButtonProps {
  title: string;
}

const SubmitButton = ({ title }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
    >
      {title}
    </button>
  );
};

export default SubmitButton;
