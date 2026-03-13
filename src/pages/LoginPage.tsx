import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Phone, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, error, phoneNumber, setPhoneNumber, sendOTP, clearError, confirmationResult, verifyOTP } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [recaptchaContainerId] = useState('recaptcha-container');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Initialize reCAPTCHA
  useEffect(() => {
    if (confirmationResult) {
      setStep('otp');
    }
  }, [confirmationResult]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!phoneNumber) {
      return;
    }

    try {
      // Initialize reCAPTCHA if not already done
      if (!(window as any).recaptchaVerifier) {
        // Wait for container to be in DOM
        setTimeout(() => {
          try {
            const verifier = new RecaptchaVerifier(
              auth,
              recaptchaContainerId,
              {
                size: 'invisible',
                callback: () => {
                  console.log('reCAPTCHA verified');
                },
                'expired-callback': () => {
                  console.log('reCAPTCHA expired');
                },
              }
            );
            (window as any).recaptchaVerifier = verifier;
          } catch (err) {
            console.error('reCAPTCHA initialization error:', err);
          }
        }, 100);
      }
      // Small delay to ensure reCAPTCHA is ready
      await new Promise(resolve => setTimeout(resolve, 200));
      await sendOTP(phoneNumber);
    } catch (err: any) {
      console.error('Error setting up reCAPTCHA:', err);
      if (err.code === 'auth/missing-app-check-token') {
        clearError();
        // Error will be shown from context
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!otp) {
      return;
    }

    try {
      await verifyOTP(otp);
      navigate('/');
    } catch (err) {
      console.error('Error verifying OTP:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to YOJNA</CardTitle>
          <CardDescription>
            {step === 'phone' ? 'Enter your phone number to continue' : 'Verify with OTP sent to your number'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !phoneNumber}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>This is a demo. In production, OTP will be sent via SMS.</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength={6}
                  disabled={loading}
                  className="tracking-widest text-center text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  OTP sent to {phoneNumber}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  clearError();
                }}
              >
                Change Number
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>Use 000000 for testing in development mode</p>
              </div>
            </form>
          )}

          <div id={recaptchaContainerId} className="mt-4" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
