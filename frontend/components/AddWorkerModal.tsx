import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Phone, Briefcase, DollarSign, MapPin, Calendar, FileText, X } from 'lucide-react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';
import Toast from 'react-native-toast-message';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorker: (worker: NewWorkerData) => void;
  currentSiteName: string;
}

export interface NewWorkerData {
  name: string;
  phone: string;
  role: string;
  dailyRate: number;
  startDate: string;
  notes?: string;
}

const jobRoles: SelectItem[] = [
  { label: 'Mason', value: 'Mason' },
  { label: 'Carpenter', value: 'Carpenter' },
  { label: 'Helper', value: 'Helper' },
  { label: 'Electrician', value: 'Electrician' },
  { label: 'Painter', value: 'Painter' },
  { label: 'Plumber', value: 'Plumber' },
  { label: 'Mistri', value: 'Mistri' },
  { label: 'Welder', value: 'Welder' },
  { label: 'Driver', value: 'Driver' },
  { label: 'Security Guard', value: 'Security Guard' },
  { label: 'Supervisor', value: 'Supervisor' },
  { label: 'Other', value: 'Other' },
];

export function AddWorkerModal({ isOpen, onClose, onAddWorker, currentSiteName }: AddWorkerModalProps) {
  const [formData, setFormData] = useState<NewWorkerData>({
    name: '',
    phone: '',
    role: '',
    dailyRate: 0,
    startDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<NewWorkerData>>({});

  const handleInputChange = (field: keyof NewWorkerData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length <= 10 ? digitsOnly : digitsOnly.slice(-10);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewWorkerData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.role) {
      newErrors.role = 'Job role is required';
    }

    if (formData.dailyRate <= 0) {
      newErrors.dailyRate = 'Daily rate must be greater than 0';
    } else if (typeof formData.dailyRate !== 'number') {
      newErrors.dailyRate = 'Daily rate must be a valid number';
    }

    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onAddWorker(formData);
      Toast.show({
        type: 'success',
        text1: 'Worker added successfully!',
      });
      handleReset();
      onClose();
    }
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      role: '',
      dailyRate: 0,
      startDate: '',
      notes: '',
    });
    setErrors({});
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel}>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <User size={20} color="#2E7D32" style={styles.userIcon} />
              <DialogTitle>Add New Worker</DialogTitle>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <DialogDescription>
            Fill in the worker details to add them to your workforce.
          </DialogDescription>
        </DialogHeader>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <User size={16} color="#6B7280" />
              <Label style={styles.label}>Full Name *</Label>
            </View>
            <Input
              placeholder="Enter worker's full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              style={errors.name ? { ...styles.input, ...styles.inputError } : styles.input}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone Number */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Phone size={16} color="#6B7280" />
              <Label style={styles.label}>Phone Number *</Label>
            </View>
            <View style={styles.phoneContainer}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+91</Text>
              </View>
              <Input
                placeholder="9876543210"
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                maxLength={10}
                style={errors.phone ? { ...styles.phoneInput, ...styles.inputError } : styles.phoneInput}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Role/Job Title */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Briefcase size={16} color="#6B7280" />
              <Label style={styles.label}>Role/Job Title *</Label>
            </View>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              items={jobRoles}
              placeholder="Select job role"
              style={errors.role ? { ...styles.select, ...styles.inputError } : styles.select}
            />
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
          </View>

          {/* Daily Rate */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <DollarSign size={16} color="#6B7280" />
              <Label style={styles.label}>Daily Rate (₹) *</Label>
            </View>
            <Input
              placeholder="Enter daily wage"
              value={formData.dailyRate.toString()}
              onChangeText={(value) => {
                const num = parseFloat(value) || 0;
                handleInputChange('dailyRate', num);
              }}
              keyboardType="numeric"
              style={errors.dailyRate ? { ...styles.input, ...styles.inputError } : styles.input}
            />
            {errors.dailyRate && <Text style={styles.errorText}>{errors.dailyRate}</Text>}
          </View>

          {/* Site Assignment */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <MapPin size={16} color="#6B7280" />
              <Label style={styles.label}>Will be assigned to</Label>
            </View>
            <View style={styles.siteAssignment}>
              <View style={styles.siteAssignmentContent}>
                <MapPin size={16} color="#16A34A" />
                <Text style={styles.siteName}>{currentSiteName}</Text>
              </View>
            </View>
            <Text style={styles.siteHelpText}>
              This worker will be automatically assigned to the current site.
            </Text>
          </View>

          {/* Start Date */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Calendar size={16} color="#6B7280" />
              <Label style={styles.label}>Start Date *</Label>
            </View>
            <Input
              placeholder="YYYY-MM-DD"
              value={formData.startDate}
              onChangeText={(value) => handleInputChange('startDate', value)}
              style={errors.startDate ? { ...styles.input, ...styles.inputError } : styles.input}
            />
            {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <FileText size={16} color="#6B7280" />
              <Label style={styles.label}>Notes (Optional)</Label>
            </View>
            <Textarea
              placeholder="Additional notes about the worker..."
              value={formData.notes || ''}
              onChangeText={(value) => handleInputChange('notes', value)}
              numberOfLines={3}
              style={styles.textarea}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button variant="outline" onPress={handleCancel} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} style={styles.saveButton}>
            Save Worker
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    maxWidth: 400,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  inputError: {
    borderColor: '#EF4444',
  },
  phoneContainer: {
    flexDirection: 'row',
  },
  phonePrefix: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 14,
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  select: {
    marginTop: 0,
  },
  siteAssignment: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
  },
  siteAssignmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  siteName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  siteHelpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
});