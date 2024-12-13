import { Link } from 'react-router-dom';
import googleLogo from '../../../../../assets/google-logo.png';
import { useEffect, useState } from 'react';

const MainProfile = () => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [maxLength, setMaxLength] = useState(200);
  const description =
    'I love hiking and exploring places!I love hiking and exploring places!I love hiking and exploring places!I love hiking and exploring places!I love hiking and exploring places!I love hiking and exploring places!I love hiking and exploring places!';

  useEffect(() => {
    const updateMaxLength = () => {
      if (window.innerWidth > 786) setMaxLength(200);
      else setMaxLength(50);
    };

    updateMaxLength();
    window.addEventListener('resize', updateMaxLength);

    return () => window.removeEventListener('resize', updateMaxLength);
  }, []);

  return (
    <div className="flex justify-between items-center w-full px-6">
      <img src={googleLogo} className="w-12 h-12 md:w-24 md:h-24 rounded-sm" />

      <div className="flex flex-col justify-center ml-6 flex-grow">
        <h1 className="text-lg font-medium md:text-2xl">Mike</h1>
        <p className="text-sm md:text-base text-orange-400">
          #Hiking #FoodTravel
        </p>
        <p className="text-sm md:text-base">
          {showFullDescription
            ? description
            : `${description.slice(0, maxLength)}...`}

          {description.length > maxLength && (
            <button
              onClick={() => setShowFullDescription((prev) => !prev)}
              className="ml-2 text-blue-500 hover:underline"
            >
              {showFullDescription ? 'less' : 'more'}
            </button>
          )}
        </p>
      </div>

      <Link
        to="/profile"
        className="flex-shrink-0 ml-3 border border-gray-500 shadow-sm rounded-2xl  hover:bg-sky-100 hover:shadow-md bg-white
        text-xs px-2 py-1
        md:text-base md:px-4 md:py-2"
      >
        Profile Edit
      </Link>
    </div>
  );
};

export default MainProfile;
