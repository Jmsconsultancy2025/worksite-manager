import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { X, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

interface SignupSigninModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupSigninModal({ isOpen, onClose }: SignupSigninModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation checks
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (isSignup) {
      if (!formData.name || !formData.phone) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isSignup) {
        toast.success("Account created successfully! Welcome to Worksite!");
      } else {
        toast.success("Signed in successfully! Welcome back!");
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });

      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={16} color="#6B7280" />
          </TouchableOpacity>
          <DialogTitle style={styles.title}>
            {isSignup ? "Create Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription style={styles.description}>
            {isSignup
              ? "Join Worksite to manage your construction sites"
              : "Welcome back! Sign in to your account"
            }
          </DialogDescription>
        </DialogHeader>

        <View style={styles.form}>
          {isSignup && (
            <>
              <View style={styles.field}>
                <Label>Full Name *</Label>
                <View style={styles.inputContainer}>
                  <User size={16} color="#9CA3AF" style={styles.iconLeft} />
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    style={styles.inputWithIcon}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Label>Phone Number *</Label>
                <View style={styles.inputContainer}>
                  <Phone size={16} color="#9CA3AF" style={styles.iconLeft} />
                  <Input
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                    style={styles.inputWithIcon}
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.field}>
            <Label>Email Address *</Label>
            <View style={styles.inputContainer}>
              <Mail size={16} color="#9CA3AF" style={styles.iconLeft} />
              <Input
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputWithIcon}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Label>Password *</Label>
            <View style={styles.inputContainer}>
              <Lock size={16} color="#9CA3AF" style={styles.iconLeft} />
              <Input
                placeholder={isSignup ? "Create a password (min 6 characters)" : "Enter your password"}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                style={styles.inputWithIcon}
              />
              <TouchableOpacity
                style={styles.iconRight}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={16} color="#9CA3AF" />
                ) : (
                  <Eye size={16} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {isSignup && (
            <View style={styles.field}>
              <Label>Confirm Password *</Label>
              <View style={styles.inputContainer}>
                <Lock size={16} color="#9CA3AF" style={styles.iconLeft} />
                <Input
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.inputWithIcon}
                />
                <TouchableOpacity
                  style={styles.iconRight}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} color="#9CA3AF" />
                  ) : (
                    <Eye size={16} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isSignup && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <Button
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.loadingText}>
                  {isSignup ? "Creating Account..." : "Signing In..."}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>
                {isSignup ? "Create Account" : "Sign In"}
              </Text>
            )}
          </Button>

          <View style={styles.separatorContainer}>
            <Separator style={styles.separator} />
            <Text style={styles.orText}>OR</Text>
          </View>

          <Button
            variant="outline"
            style={styles.googleButton}
          >
            <View style={styles.googleContent}>
              <svg width="16" height="16" viewBox="0 0 24 24" style={styles.googleIcon}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <Text style={styles.googleText}>Continue with Google</Text>
            </View>
          </Button>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Text style={styles.toggleLink} onPress={toggleMode}>
                {isSignup ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </View>

          {isSignup && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          )}
        </View>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 400,
    marginHorizontal: 16,
  },
  header: {
    position: 'relative',
    paddingRight: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  form: {
    marginTop: 16,
  },
  field: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    height: 44,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  submitButton: {
    height: 44,
    backgroundColor: '#2E7D32',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  separatorContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 16,
  },
  separator: {
    marginVertical: 0,
  },
  orText: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#6B7280',
    top: -8,
  },
  googleButton: {
    height: 44,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 8,
  },
  googleText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  toggleContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleLink: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  termsContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  termsLink: {
    color: '#2E7D32',
    fontWeight: '500',
  },
});