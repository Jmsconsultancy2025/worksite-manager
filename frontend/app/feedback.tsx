import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Star,
  MessageSquare,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface FeedbackPageProps {
  onBack: () => void;
}

const categoryOptions = [
  { value: '', label: 'Select category' },
  { value: 'ui-ux', label: 'User Interface/Experience' },
  { value: 'features', label: 'Features & Functionality' },
  { value: 'performance', label: 'Performance' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'suggestion', label: 'Feature Suggestion' },
  { value: 'general', label: 'General Feedback' },
];

const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 5: return 'Excellent!';
    case 4: return 'Very Good!';
    case 3: return 'Good';
    case 2: return 'Fair';
    case 1: return 'Needs Improvement';
    default: return '';
  }
};

export default function FeedbackPage({ onBack }: FeedbackPageProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = () => {
    // Validation
    if (!name.trim() || !feedback.trim() || rating === 0) {
      toast.error('Please fill in all required fields and provide a rating');
      return;
    }

    // Simulate feedback submission
    toast.success('Thank you for your feedback! We appreciate your input.');

    // Reset form
    setRating(0);
    setFeedback('');
    setName('');
    setEmail('');
    setCategory('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-[#2E7D32] px-4 py-4 flex items-center">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">Feedback</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Feedback Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#2E7D32]">
                <MessageSquare className="h-5 w-5" />
                Share Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name *
                </Label>
                <Input
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email (Optional)
                </Label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <Label>Rate Your Experience *</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="p-1 transition-colors"
                      onClick={() => handleStarClick(star)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      {getRatingLabel(rating)}
                    </span>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="category">Feedback Category</Label>
                <select
                  id="category"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback *</Label>
                <Textarea
                  id="feedback"
                  placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
                onClick={handleSubmit}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Need Direct Support?</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  support@worksite.com
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  +91 98765 43210
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}