import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Eye, EyeOff, Shield, Users } from 'lucide-react';
import heroImage from '../assets/hero-image.jpg';

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
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              LOCALEYES
            </h1>
            <p className="mt-6 text-xl leading-8 text-white/90">
              Empowering communities to report local issues and connect with authorities for swift resolution.
            </p>
            <div className="mt-8">
              <img
                src={heroImage}
                alt="Citizens reporting community issues"
                className="mx-auto rounded-2xl shadow-2xl max-w-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative -mt-20 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to report issues or manage community requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="relative space-y-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials('citizen')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Citizen</div>
                    <Badge variant="secondary" className="text-xs">Demo User</Badge>
                  </div>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials('authority', 'PWD')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-medium">Authority</div>
                    <Badge variant="secondary" className="text-xs">PWD</Badge>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials('authority', 'Water')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-medium">Authority</div>
                    <Badge variant="secondary" className="text-xs">Water</Badge>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials('authority', 'KSEB')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-medium">Authority</div>
                    <Badge variant="secondary" className="text-xs">KSEB</Badge>
                  </div>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials('authority', 'Waste Management')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-medium">Authority</div>
                    <Badge variant="secondary" className="text-xs">Waste Mgmt</Badge>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillDemoCredentials('authority', 'Other')}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-medium">Authority</div>
                    <Badge variant="secondary" className="text-xs">Other</Badge>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}