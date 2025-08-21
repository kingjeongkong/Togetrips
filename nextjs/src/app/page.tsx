'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaBell,
  FaComments,
  FaGlobe,
  FaHeart,
  FaMapMarkedAlt,
  FaPlane,
  FaUsers,
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <FaPlane className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Next Trip
              <span className="text-orange-500 block">Find Your Travel Buddy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover travelers nearby and find your next companion with real-time chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-full text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Now (Free)
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full text-lg hover:border-orange-500 hover:text-orange-500 transition-all duration-300"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Background Image */}
        {/* <div className="relative mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="aspect-video bg-gradient-to-r from-blue-400 via-purple-500 to-orange-400 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative text-center text-white z-10">
                  <FaMapMarkedAlt className="w-24 h-24 mx-auto mb-4 opacity-90 animate-pulse" />
                  <p className="text-xl font-semibold">A Place Where Travelers Connect</p>
                  <p className="text-sm opacity-80 mt-2">Find travelers nearby on the map</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Special Journeys with Togetrips
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Traveling alone is great, but traveling together is even more special.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors duration-300">
                <MdLocationOn className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Location-Based Matching</h3>
              <p className="text-gray-600">
                Meet travelers in the same city or within your preferred radius.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <FaComments className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Chat</h3>
              <p className="text-gray-600">
                Send and receive messages instantly with your travel buddy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <FaBell className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Travel Request Management
              </h3>
              <p className="text-gray-600">Request companions and manage responses efficiently.</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <FaUsers className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Building</h3>
              <p className="text-gray-600">Join a growing community of travelers worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-orange-500 mb-2">1,000+</div>
              <div className="text-gray-600">Active Travelers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-500 mb-2">50+</div>
              <div className="text-gray-600">Cities Served</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-500 mb-2">500+</div>
              <div className="text-gray-600">Successful Matches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thousands of Travelers Are Already Here
            </h2>
            <p className="text-xl text-gray-600">
              Over <span className="text-orange-500 font-bold">1,000</span> travelers have found
              companions on Togetrips.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <FaUsers className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Jayden</h4>
                  <p className="text-sm text-gray-500">Sydney, Australia</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Thanks to Togetrips, I had an unforgettable journey! I met a traveler with similar
                interests and had a great time."
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <FaHeart key={i} className="w-4 h-4 text-orange-400" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FaMapMarkedAlt className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Bella</h4>
                  <p className="text-sm text-gray-500">Backpacking Europe</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I was able to explore so much more than when I traveled alone. It was safe and fun
                with a companion!"
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <FaHeart key={i} className="w-4 h-4 text-orange-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your Next Trip, Never Alone Again
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Sign up now and find your new travel companion!
          </p>
          <Link
            href="/auth/signup"
            className="group inline-flex items-center px-8 py-4 bg-white text-orange-500 font-semibold rounded-full text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start for Free
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <FaGlobe className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Togetrips</h3>
            <p className="text-gray-400 mb-6">The best way to connect travelers</p>
            <div className="flex justify-center space-x-6 mb-6">
              <Link
                href="/auth/signin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sign Up
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm">© 2024 Togetrips. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
