'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID = "1028953534432-aarvrfrl3h69e16saed41s9qod8q69vc.apps.googleusercontent.com";

const SignInPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [role, setRole] = useState(null);

  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectBasedOnRole = (userRole) => {
    if (userRole === 'wholesaler') {
      router.push('/wholesaler');
    } else if (userRole === 'retailer') {
      router.push('/retailer');
    } else {
      router.push('/');
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential;

      const res = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          role: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Google sign-in failed.");
        return;
      }

      alert("Google sign-in successful!");
      console.log("Google user:", data.user);
      
      // ✅ Store user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // ✅ Redirect based on role
      redirectBasedOnRole(data.user.role);
      
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("Something went wrong with Google sign-in.");
    }
  };

  const initializeGoogleSignIn = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });

    const btn = document.getElementById("google-signin-btn");
    if (btn) {
      window.google.accounts.id.renderButton(btn, {
        type: "standard",
        shape: "pill",
        theme: "outline",
        text: "continue_with",
        size: "large",
        width: 240,
      });
    }
  };

  useEffect(() => {
    // Read selected portfolio when page loads
    const selected = sessionStorage.getItem("selectedPortfolio");
    if (selected) {
      setRole(selected);
    }

    // Load Google script if not already present
    const existingScript = document.getElementById("google-client-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-client-script";
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // LOGIN FLOW
      if (!formData.email || !formData.password) {
        alert("Please enter email and password.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Login failed.");
          setLoading(false);
          return;
        }

        alert("Login successful!");
        console.log("Logged in user:", data.user);
        
        // ✅ Store user data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ Redirect based on role
        redirectBasedOnRole(data.user.role);
        
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
      return;
    }

    // SIGN UP FLOW
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill all fields.");
      setLoading(false);
      return;
    }

    if (!role) {
      alert("Please choose Customer / Retailer / Wholesaler first.");
      setLoading(false);
      return;
    }

  if (!isLogin) {
    // SIGN UP FLOW
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (!role) {
      alert("Please choose Customer / Retailer / Wholesaler first.");
      return;
    }

  
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          location, // { lat, lng } or null
        
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Sign up failed.");
        setLoading(false);
        return;
      }

      alert("Sign up successful! Please check your email for the OTP.");
      router.push(
        `/verify_otp?email=${encodeURIComponent(formData.email)}`
      );
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Please try again.");
    }

    return;
  }

  // LOGIN FLOW (isLogin === true)
  if (!formData.email || !formData.password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || "Login failed.");
      return;
    }

    alert("Login successful!");
    console.log("Logged in user:", data.user);
    router.push(`/verify_otp?email=${encodeURIComponent(formData.email)}`);
    // router.push("/");
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong. Please try again.");
    setLoading(false);
  }
};

     

      

const handleUseMyLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      alert("Location captured successfully.");
    },
    (err) => {
      console.error("Geolocation error:", err);
      if (err.code === 1) {
        alert("Permission denied. Please allow location access or enter address manually.");
      } else {
        alert("Could not get your location. Please enter address manually.");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 100000,
      maximumAge: 0,
    }
  );
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
      
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-5xl mt-8 font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-poppins mb-2">
            OOPMart
          </h1>
          <p className="text-gray-600 text-sm">Everyone's favorite shopping destination!</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-orange-100">
          
          {/* Toggle buttons */}
          <div className="flex mb-6 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setIsLogin(true)}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name field - only for sign up */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 text-black placeholder-gray-600"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 text-black placeholder-gray-600"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 text-black placeholder-gray-600"
                placeholder="Enter Password"
                required
              />
            </div>

            {/* Extra fields - only for sign up */}
            {!isLogin && (
              <>
                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/50 text-black placeholder-gray-600"
                    placeholder="Enter Password"
                    required
                  />
                </div>

                {/* Address line */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / street / area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
                  />
                </div>

                {/* City + State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Pincode + Use my location */}
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="w-full px-3 py-2 border border-orange-400 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors"
                  >
                    Use my location
                  </button>
                </div>

                {location && (
                  <p className="mt-1 text-xs text-green-600">
                    Location captured (lat: {location.lat.toFixed(4)}, lng:{" "}
                    {location.lng.toFixed(4)})
                  </p>
                )}
              </>
            )}


            {/* Forgot password - only for login */}
            {isLogin && (
              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Logging in...' : 'Signing up...'}
                </span>
              ) : (
                isLogin ? 'Log In' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div id="google-signin-btn"></div>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500 mt-6">
            By continuing, you agree to OOPMart's{' '}
            <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            disabled={loading}
            className="text-gray-600 mb-8 hover:text-orange-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors duration-300 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, -80px) scale(1.15);
          }
          50% {
            transform: translate(-60px, 70px) scale(0.85);
          }
          75% {
            transform: translate(80px, 60px) scale(1.1);
          }
        }
        
        .animate-blob {
          animation: blob 15s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-4000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

export default SignInPage;
