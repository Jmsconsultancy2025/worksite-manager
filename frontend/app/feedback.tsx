import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Picker,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Star,
  MessageSquare,
  Mail,
  Phone,
  User,
} from 'lucide-react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';

const categoryOptions = [
  { value: '', label: 'Select category' },
  { value: 'ui-ux', label: 'User Interface/Experience' },
  { value: 'general', label: 'General Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'features', label: 'Features & functionalities' },
  { value: 'performance', label: 'Performance' },
  { value: 'suggestion', label: 'Feature suggestion' },
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

export default function FeedbackPage() {
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
      Alert.alert('Error', 'Please fill in all required fields and provide a rating');
      return;
    }

    // Simulate feedback submission
    Alert.alert('Success', 'Thank you for your feedback! We appreciate your input.');

    // Reset form
    setRating(0);
    setFeedback('');
    setName('');
    setEmail('');
    setCategory('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.mainCard}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <MessageSquare size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Feedback</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Feedback Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <MessageSquare size={20} color="#2E7D32" />
                <Text style={styles.cardTitleText}>Share Your Experience</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              {/* Name Field */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelContainer}>
                  <User size={16} color="#2E7D32" />
                  <Text style={styles.labelText}>Name *</Text>
                </View>
                <Input
                  placeholder="Your full name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelContainer}>
                  <Mail size={16} color="#2E7D32" />
                  <Text style={styles.labelText}>Email (Optional)</Text>
                </View>
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
                <Text style={styles.labelText}>Rate Your Experience *</Text>
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
                        fill={star <= rating ? '#FBBF24' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                  {rating > 0 && (
                    <Text style={styles.ratingLabel}>
                      {getRatingLabel(rating)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Category Dropdown */}
              <View style={styles.fieldContainer}>
                <Label>Feedback Category</Label>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                    style={styles.picker}
                  >
                    {categoryOptions.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Feedback Text */}
              <View style={styles.fieldContainer}>
                <Label>Your Feedback *</Label>
                <Textarea
                  placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
                  value={feedback}
                  onChangeText={setFeedback}
                  style={styles.textarea}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Information Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Need Direct Support?</Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Mail size={16} color="#2E7D32" />
                  <Text style={styles.contactText}>contact@miztech.in</Text>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={16} color="#2E7D32" />
                  <Text style={styles.contactText}>+91 76828 35586</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flexGrow: 1,
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  picker: {
    height: 40,
  },
  textarea: {
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactContent: {
    padding: 20,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
});
