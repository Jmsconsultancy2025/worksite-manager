import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  Star,
  MessageSquare,
  Mail,
  Phone,
  User,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Toast from 'react-native-toast-message';

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
  const router = useRouter();
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
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields and provide a rating',
      });
      return;
    }

    // Simulate feedback submission
    Toast.show({
      type: 'success',
      text1: 'Thank you!',
      text2: 'Thank you for your feedback! We appreciate your input.',
    });

    // Reset form
    setRating(0);
    setFeedback('');
    setName('');
    setEmail('');
    setCategory('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <MessageSquare size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Feedback</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Feedback Form Card */}
          <Card style={styles.formCard}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <MessageSquare size={20} color="#2E7D32" />
                <Text style={styles.cardTitleText}>Share Your Experience</Text>
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.formContent}>
              {/* Name Field */}
              <View style={styles.fieldContainer}>
                <Label style={styles.label}>
                  <User size={16} color="#2E7D32" />
                  <Text style={styles.labelText}>Name *</Text>
                </Label>
                <Input
                  placeholder="Your full name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Label style={styles.label}>
                  <Mail size={16} color="#2E7D32" />
                  <Text style={styles.labelText}>Email (Optional)</Text>
                </Label>
                <Input
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Star Rating */}
              <View style={styles.fieldContainer}>
                <Label style={styles.label}>
                  <Text style={styles.labelText}>Rate Your Experience *</Text>
                </Label>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      style={styles.starButton}
                      onPress={() => handleStarClick(star)}
                    >
                      <Star
                        size={32}
                        color={star <= rating ? '#FBBF24' : '#D1D5DB'}
                        fill={star <= rating ? '#FBBF24' : 'none'}
                      />
                    </TouchableOpacity>
                  ))}
                  {rating > 0 && (
                    <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
                  )}
                </View>
              </View>

              {/* Category Dropdown */}
              <View style={styles.fieldContainer}>
                <Label style={styles.label}>
                  <Text style={styles.labelText}>Feedback Category</Text>
                </Label>
                <View style={styles.selectContainer}>
                  <select
                    style={styles.select}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </View>
              </View>

              {/* Feedback Text */}
              <View style={styles.fieldContainer}>
                <Label style={styles.label}>
                  <Text style={styles.labelText}>Your Feedback *</Text>
                </Label>
                <Textarea
                  placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
                  value={feedback}
                  onChangeText={setFeedback}
                  numberOfLines={5}
                  multiline
                  style={styles.textarea}
                />
              </View>

              {/* Submit Button */}
              <View style={styles.submitButtonContainer}>
                <Button
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Send size={16} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card style={styles.contactCard}>
            <CardContent style={styles.contactContent}>
              <Text style={styles.contactTitle}>Need Direct Support?</Text>
              <View style={styles.contactContainer}>
                <View style={styles.contactItem}>
                  <Mail size={20} color="#6B7280" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactValue}>support@worksite.com</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={20} color="#6B7280" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactValue}>+91 98765 43210</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    maxWidth: 393,
    alignSelf: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flexGrow: 1,
  },
  // Header
  header: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Content
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
    maxWidth: 393,
    alignSelf: 'center',
    width: '100%',
  },
  formCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  formContent: {
    gap: 16,
    paddingBottom: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  // Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  // Select
  selectContainer: {
    width: '100%',
  },
  select: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  selectFocus: {
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  // Textarea
  textarea: {
    resize: 'none',
  },
  // Submit Button
  submitButtonContainer: {
    width: '100%',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Contact Card
  contactCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactValue: {
    fontSize: 14,
    color: '#6B7280',
  },
});