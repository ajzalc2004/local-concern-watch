import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Eye, EyeOff, Shield, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'citizen' | 'authority', department?: 'PWD' | 'Water' | 'KSEB' | 'Waste Management' | 'Other') => {
    if (type === 'citizen') {
      setEmail('citizen@example.com');
      setPassword('password123');
      return;
    }
    const emailByDept: Record<'PWD' | 'Water' | 'KSEB' | 'Waste Management' | 'Other', string> = {
      PWD: 'pwd@kseb.localeyes.com',
      Water: 'water@kerala.localeyes.com',
      KSEB: 'kseb@kerala.localeyes.com',
      'Waste Management': 'waste@kerala.localeyes.com',
      'Other': 'other@kerala.localeyes.com',
    };
    const selectedEmail = department ? emailByDept[department] : emailByDept.PWD;
    setEmail(selectedEmail);
    setPassword('authority123');
  };

  

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className="shadow-xl border-0 bg-white overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            {/* Left Section - Illustration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-12 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-wide">
                  LOCALEYES
                </h1>
                <p className="text-xl font-semibold text-gray-700 mb-8">
                  SPOT IT. REPORT IT. FIX IT.
                </p>
                <div className="w-64 h-64 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center p-4">
                  <div className="w-full h-full relative">
                    {/* City Map Background */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg relative overflow-hidden">
                      {/* Grid lines for city blocks */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="border border-blue-300"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* City buildings/areas */}
                      <div className="absolute top-2 left-2 w-8 h-6 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-2 right-2 w-6 h-8 bg-gray-400 rounded-sm"></div>
                      <div className="absolute bottom-2 left-2 w-10 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="absolute bottom-2 right-2 w-7 h-6 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-400 rounded-sm"></div>
                      
                      {/* Issue markers (red dots) */}
                      <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute top-8 right-6 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute bottom-6 left-6 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute bottom-4 right-4 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                      
                      {/* Roads/paths */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">
                    Sign in to report issues or manage community requests
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Log In'}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:text-blue-700 underline">Create an account</Link>
                </div>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('citizen')}
                      className="w-full h-auto p-4 flex items-center justify-center gap-3 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Users className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Citizen Demo</div>
                        <div className="text-xs text-gray-500">Test as a regular user</div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fillDemoCredentials('authority', 'PWD')}
                      className="w-full h-auto p-4 flex items-center justify-center gap-3 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Authority Demo</div>
                        <div className="text-xs text-gray-500">Test as PWD department</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}