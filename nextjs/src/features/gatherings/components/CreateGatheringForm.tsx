import Image from 'next/image';
import { useState } from 'react';
import { HiCalendar, HiCamera, HiClock, HiLocationMarker, HiMinus, HiPlus } from 'react-icons/hi';
import { CreateGatheringRequest } from '../types/gatheringTypes';
import { isFormValid, removeFieldError, validateGatheringForm } from '../utils/gatheringValidation';

interface CreateGatheringFormProps {
  onSubmit: (data: CreateGatheringRequest) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function CreateGatheringForm({
  onSubmit,
  isLoading = false,
  onCancel,
}: CreateGatheringFormProps) {
  const [formData, setFormData] = useState<CreateGatheringRequest>({
    activity_title: '',
    description: '',
    gathering_time: '',
    location_id: '',
    city: '',
    country: '',
    max_participants: 2,
    cover_image_url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateGatheringForm(formData);
    setErrors(validationErrors);

    if (isFormValid(validationErrors)) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateGatheringRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => removeFieldError(prev, field));
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-2 md:p-4">
      <div className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6 md:py-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Create a Meetup</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8"
        >
          {/* Cover Photo Section */}
          <div className="relative">
            <div className="w-full h-40 md:h-48 lg:h-56 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors duration-200 cursor-pointer">
              {formData.cover_image_url ? (
                <Image
                  src={formData.cover_image_url}
                  alt="Cover preview"
                  fill
                  className="object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center">
                  <HiCamera className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-600 font-medium text-sm md:text-base">
                    Upload Cover Photo
                  </p>
                </div>
              )}
            </div>
            <input
              type="url"
              id="cover_image_url"
              value={formData.cover_image_url}
              onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column */}
            <div className="space-y-4 lg:space-y-6">
              {/* Activity Title */}
              <div>
                <label
                  htmlFor="activity_title"
                  className="block text-sm md:text-base font-semibold text-gray-700 mb-3"
                >
                  Activity Title
                </label>
                <input
                  type="text"
                  id="activity_title"
                  value={formData.activity_title}
                  onChange={(e) => handleInputChange('activity_title', e.target.value)}
                  className={`w-full px-4 py-3 md:py-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm md:text-base ${
                    errors.activity_title ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Weekend Hike & Nature Photography"
                />
                {errors.activity_title && (
                  <p className="mt-1 mr-10 text-sm text-red-500">{errors.activity_title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm md:text-base font-semibold text-gray-700 mb-3"
                >
                  Description (Tell us more about the plan)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full h-52 px-4 py-2 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none text-sm md:text-base ${
                    errors.description ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Join us for a scenic hike through the Redwood National Park, followed by a guided nature photography session. Bring your cameras, comfortable shoes, and a love for the outdoors!"
                />
                {errors.description && (
                  <p className="mt-1 mr-10 text-sm text-red-500">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm md:text-base font-semibold text-gray-700 mb-3"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="date"
                      value={formData.gathering_time.split('T')[0] || ''}
                      onChange={(e) => {
                        const time = formData.gathering_time.split('T')[1] || '';
                        handleInputChange('gathering_time', `${e.target.value}T${time}`);
                      }}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-100 border-0 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm md:text-base ${
                        errors.gathering_time ? 'ring-2 ring-red-500' : ''
                      }`}
                    />
                    <HiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm md:text-base font-semibold text-gray-700 mb-3"
                  >
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      id="time"
                      value={formData.gathering_time.split('T')[1] || ''}
                      onChange={(e) => {
                        const date = formData.gathering_time.split('T')[0] || '';
                        handleInputChange('gathering_time', `${date}T${e.target.value}`);
                      }}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-100 border-0 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm md:text-base ${
                        errors.gathering_time ? 'ring-2 ring-red-500' : ''
                      }`}
                    />
                    <HiClock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.gathering_time && (
                  <p className="col-span-2 mt-1 mr-10 text-sm text-red-500">
                    {errors.gathering_time}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm md:text-base font-semibold text-gray-700 mb-3"
                >
                  Location (City)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 md:py-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm md:text-base ${
                      errors.city ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="San Francisco, CA"
                  />
                  <HiLocationMarker className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.city && <p className="mt-1 mr-10 text-sm text-red-500">{errors.city}</p>}
              </div>

              {/* Max Participants */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 mb-3">
                  Max Participants
                </label>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        'max_participants',
                        Math.max(2, formData.max_participants - 1),
                      )
                    }
                    className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <HiMinus className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1 max-w-20">
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={formData.max_participants}
                      onChange={(e) =>
                        handleInputChange('max_participants', parseInt(e.target.value) || 2)
                      }
                      className={`w-full px-4 py-3 md:py-4 bg-gray-100 border-0 rounded-xl text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm md:text-base ${
                        errors.max_participants ? 'ring-2 ring-red-500' : ''
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange('max_participants', formData.max_participants + 1)
                    }
                    className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <HiPlus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {errors.max_participants && (
                  <p className="mt-1 mr-10 text-sm text-red-500">{errors.max_participants}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hidden fields for location_id */}
          <input type="hidden" name="location_id" value={formData.location_id} />

          {/* Create Button */}
          <div className="pt-2 md:pt-4 lg:pt-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isLoading ? 'Creating...' : 'Create Meetup'}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 md:flex-none md:w-auto text-gray-500 hover:text-gray-700 py-4 px-6 rounded-xl font-medium transition-colors duration-200 border border-gray-300 hover:border-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
