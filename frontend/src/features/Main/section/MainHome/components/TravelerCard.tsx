import googleLogo from '../../../../../assets/google-logo.png';

const TravelerCard = () => {
  return (
    <div className="flex flex-col px-5 py-4 w-96 bg-white rounded-lg">
      <div className="flex">
        <img src={googleLogo} className="w-12 h-12 rounded-full mr-4" />
        <div className="flex flex-col justify-center">
          <span className="">John Smith</span>
          <span className="text-sm text-orange-400">#NaturalLover</span>
        </div>
      </div>

      <p className="mt-3 mb-5">
        I love hiking and exploring places!I love hiking and exploring places!I
        love hiking and exploring places!
      </p>

      <button className="w-full py-2 text-white bg-orange-500 rounded-3xl shadow-sm hover:bg-orange-600 hover:shadow-md">
        Send Request
      </button>
    </div>
  );
};

export default TravelerCard;
