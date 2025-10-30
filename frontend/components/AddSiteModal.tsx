import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, MapPin, User, Users, Calendar, X } from 'lucide-react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectItem } from '../ui/select';
import Toast from 'react-native-toast-message';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSite: (site: NewSiteData) => void;
  initialData?: any;
  isEditing?: boolean;
}

export interface NewSiteData {
  name: string;
  location: string;
  manager?: string;
  numberOfWorkers?: number;
  startDate: string;
}

const managerOptions: SelectItem[] = [
  { label: 'John Smith', value: 'John Smith' },
  { label: 'Sarah Johnson', value: 'Sarah Johnson' },
  { label: 'Mike Wilson', value: 'Mike Wilson' },
  { label: 'Lisa Anderson', value: 'Lisa Anderson' },
  { label: 'David Brown', value: 'David Brown' },
];

export function AddSiteModal({ isOpen, onClose, onAddSite, initialData, isEditing = false }: AddSiteModalProps) {
  const [formData, setFormData] = useState<NewSiteData>({
    name: '',
    location: '',
    manager: undefined,
    numberOfWorkers: undefined,
    startDate: '',
  });

  // Update form data when initialData changes (for editing)
  React.useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        name: initialData.name || '',
        location: initialData.location || '',
        manager: initialData.manager || undefined,
        numberOfWorkers: initialData.totalWorkers || undefined,
        startDate: initialData.startDate || '',
      });
    } else if (!isEditing) {
      setFormData({
        name: '',
        location: '',
        manager: undefined,
        numberOfWorkers: 0,
        startDate: '',
      });
    }
  }, [initialData, isEditing]);

  const [errors, setErrors] = useState<Partial<NewSiteData>>({});

  const handleInputChange = (field: keyof NewSiteData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewSiteData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Site name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Number of workers is now optional

    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onAddSite(formData);
      Toast.show({
        type: 'success',
        text1: 'New site added successfully!',
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
      location: '',
      manager: undefined,
      numberOfWorkers: undefined,
      startDate: '',
    });
    setErrors({});
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleCancel}>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Plus size={20} color="#2E7D32" style={styles.plusIcon} />
              <DialogTitle>{isEditing ? 'Edit Site' : 'Add New Site'}</DialogTitle>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <DialogDescription>
            Fill in the details below to create a new construction site.
          </DialogDescription>
        </DialogHeader>

        <View style={styles.form}>
          {/* Site Name */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <MapPin size={16} color="#6B7280" />
              <Label style={styles.label}>Site Name *</Label>
            </View>
            <Input
              placeholder="Enter site name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              style={errors.name ? [styles.input, styles.inputError] : styles.input}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Location/Address */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <MapPin size={16} color="#6B7280" />
              <Label style={styles.label}>Location/Address *</Label>
            </View>
            <Input
              placeholder="Enter location or address"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              style={errors.location ? [styles.input, styles.inputError] : styles.input}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Manager */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <User size={16} color="#6B7280" />
              <Label style={styles.label}>Manager (Optional)</Label>
            </View>
            <Select
              value={formData.manager || ''}
              onValueChange={(value) => handleInputChange('manager', value)}
              items={managerOptions}
              placeholder="Select a manager"
              style={styles.select}
            />
          </View>

          {/* Number of Workers */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Users size={16} color="#6B7280" />
              <Label style={styles.label}>Number of Workers (Optional)</Label>
            </View>
            <Input
              placeholder="Enter number of workers"
              value={formData.numberOfWorkers?.toString() || ''}
              onChangeText={(value) => {
                const num = value === '' ? undefined : parseInt(value) || undefined;
                handleInputChange('numberOfWorkers', num);
              }}
              keyboardType="numeric"
              style={errors.numberOfWorkers ? [styles.input, styles.inputError] : styles.input}
            />
            {errors.numberOfWorkers && <Text style={styles.errorText}>{errors.numberOfWorkers}</Text>}
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
              style={errors.startDate ? [styles.input, styles.inputError] : styles.input}
            />
            {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button variant="outline" onPress={handleCancel} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} style={styles.saveButton}>
            {isEditing ? 'Update Site' : 'Save Site'}
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
  plusIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
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
  select: {
    marginTop: 0,
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