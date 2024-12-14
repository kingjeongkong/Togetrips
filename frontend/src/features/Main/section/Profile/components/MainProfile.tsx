import { FiEdit, FiSettings } from 'react-icons/fi';
import googleLogo from '../../../../../assets/google-logo.png';

const MainProfile = () => {
  const tagString = '#camping #fishing#hiking#camping';
  const tags = tagString.split('#').filter((tag) => tag.trim() !== '');

  return (
    <div className="flex flex-col gap-4 items-center md:pt-5">
      <img
        src={googleLogo}
        alt="google-logo"
        className="w-40 h-40 md:w-52 md:h-52 rounded-full"
      />

      <button className="absolute top-16 right-4 md:top-7 md:right-7 p-2 rounded-full bg-indigo-500 hover:bg-indigo-600">
        <FiSettings className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </button>

      <p className="text-2xl md:text-3xl font-semibold">Alexander Kurniawan</p>

      <div className="flex flex-wrap justify-center gap-2 w-4/5 md:w-2/5">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-white bg-orange-400 rounded-3xl text-sm md:text-base"
          >
            #{tag.trim()}
          </span>
        ))}
      </div>

      <p className="text-center text-gray-600 w-4/5 text-base md:w-1/2 md:text-lg">
        I love hiking and exploring places!I love hiking and exploring places!I
        love hiking and exploring places! I love hiking and exploring places!I
        love hiking and exploring places!I love hiking and exploring places!
      </p>

      <button className="flex items-center gap-2 mt-6 px-4 py-2 rounded-3xl text-white bg-indigo-500 hover:bg-indigo-600">
        <FiEdit className="w-5 h-5" />
        <span>Edit Profile</span>
      </button>
    </div>
  );
};

export default MainProfile;
