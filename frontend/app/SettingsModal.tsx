import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { User, Bell, Clock, DollarSign, BookOpen, Info, LogOut, ChevronRight, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent } from '../ui/select';
import { SelectItem } from '../ui/select';
import { Separator } from '../ui/separator';

type SettingsView = 'main' | 'profile' | 'preferences' | 'attendance' | 'salary' | 'cashbook' | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const settingsItems = [
  {
    id: 'profile',
    icon: User,
    title: 'Profile & Account',
    description: 'Manage your personal information',
    view: 'profile' as SettingsView
  },
  {
    id: 'preferences',
    icon: Bell,
    title: 'App Preferences',
    description: 'Notifications and display settings',
    view: 'preferences' as SettingsView
  },
  {
    id: 'attendance',
    icon: Clock,
    title: 'Attendance Settings',
    description: 'Configure attendance rules',
    view: 'attendance' as SettingsView
  },
  {
    id: 'salary',
    icon: DollarSign,
    title: 'Salary Settings',
    description: 'Payroll and working hours',
    view: 'salary' as SettingsView
  },
  {
    id: 'cashbook',
    icon: BookOpen,
    title: 'Cashbook Settings',
    description: 'Default categories and preferences',
    view: 'cashbook' as SettingsView
  },
  {
    id: 'about',
    icon: Info,
    title: 'About',
    description: 'App version and support',
    view: 'about' as SettingsView
  }
];

const payrollCycleItems = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' }
];

const defaultCategories = [
  'Materials',
  'Labor',
  'Equipment',
  'Transport',
  'Miscellaneous'
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [paidLeave, setPaidLeave] = useState(false);
  const [halfdayPercentage, setHalfdayPercentage] = useState("50");
  const [payrollCycle, setPayrollCycle] = useState("monthly");
  const [workingHours, setWorkingHours] = useState("8");
  const [categories, setCategories] = useState(defaultCategories);

  const handleBack = () => {
    setCurrentView('main');
  };

  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'Settings saved successfully!',
    });
    onClose();
  };

  const handleLogout = () => {
    Toast.show({
      type: 'success',
      text1: 'Logged out successfully!',
    });
    onClose();
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'profile': return 'Profile & Account';
      case 'preferences': return 'App Preferences';
      case 'attendance': return 'Attendance Settings';
      case 'salary': return 'Salary Settings';
      case 'cashbook': return 'Cashbook Settings';
      case 'about': return 'About';
      default: return 'Settings';
    }
  };

  const getViewDescription = () => {
    return currentView === 'main'
      ? 'Configure your app preferences and account settings.'
      : 'Modify your settings and preferences.';
  };

  const renderMainView = () => (
    <View style={styles.viewContainer}>
      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.menuContainer}>
        {settingsItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              style={styles.menuItem}
              onPress={() => setCurrentView(item.view)}
            >
              <View style={styles.menuItemContent}>
                <IconComponent size={20} color="#6B7280" />
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </Button>
          );
        })}
      </View>

      <Separator />

      <Button
        variant="ghost"
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <View style={styles.logoutContent}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </Button>
    </View>
  );

  const renderProfileView = () => (
    <View style={styles.viewContainer}>
      <Button variant="ghost" style={styles.backButton} onPress={handleBack}>
        <View style={styles.backContent}>
          <ArrowLeft size={16} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </Button>

      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <Label>Full Name</Label>
          <Input placeholder="John Doe" />
        </View>

        <View style={styles.formField}>
          <Label>Phone Number</Label>
          <Input placeholder="+91 9876543210" keyboardType="phone-pad" />
        </View>

        <View style={styles.formField}>
          <Label>Email Address</Label>
          <Input placeholder="john@example.com" keyboardType="email-address" />
        </View>

        <View style={styles.formField}>
          <Label>Change Password</Label>
          <Input placeholder="New password" secureTextEntry />
        </View>
      </View>

      <Button style={styles.saveButton} onPress={handleSave}>
        Save Changes
      </Button>
    </View>
  );

  const renderPreferencesView = () => (
    <View style={styles.viewContainer}>
      <Button variant="ghost" style={styles.backButton} onPress={handleBack}>
        <View style={styles.backContent}>
          <ArrowLeft size={16} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </Button>

      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.preferencesContainer}>
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Push Notifications</Text>
            <Text style={styles.preferenceDescription}>Receive alerts and updates</Text>
          </View>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Dark Mode</Text>
            <Text style={styles.preferenceDescription}>Switch to dark theme</Text>
          </View>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </View>
      </View>

      <Button style={styles.saveButton} onPress={handleSave}>
        Save Preferences
      </Button>
    </View>
  );

  const renderAttendanceView = () => (
    <View style={styles.viewContainer}>
      <Button variant="ghost" style={styles.backButton} onPress={handleBack}>
        <View style={styles.backContent}>
          <ArrowLeft size={16} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </Button>

      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.attendanceContainer}>
        <View style={styles.formField}>
          <Label>Half-day Percentage</Label>
          <Input
            value={halfdayPercentage}
            onChangeText={setHalfdayPercentage}
            keyboardType="numeric"
            placeholder="50"
          />
          <Text style={styles.fieldDescription}>Percentage of daily rate for half-day attendance</Text>
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Paid Leave</Text>
            <Text style={styles.preferenceDescription}>Enable paid leave functionality</Text>
          </View>
          <Switch checked={paidLeave} onCheckedChange={setPaidLeave} />
        </View>
      </View>

      <Button style={styles.saveButton} onPress={handleSave}>
        Save Settings
      </Button>
    </View>
  );

  const renderSalaryView = () => (
    <View style={styles.viewContainer}>
      <Button variant="ghost" style={styles.backButton} onPress={handleBack}>
        <View style={styles.backContent}>
          <ArrowLeft size={16} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </Button>

      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.salaryContainer}>
        <View style={styles.formField}>
          <Label>Payroll Cycle</Label>
          <Select
            value={payrollCycle}
            onValueChange={setPayrollCycle}
            items={payrollCycleItems}
            placeholder="Select payroll cycle"
          />
        </View>

        <View style={styles.formField}>
          <Label>Daily Working Hours</Label>
          <Input
            value={workingHours}
            onChangeText={setWorkingHours}
            keyboardType="numeric"
            placeholder="8"
          />
          <Text style={styles.fieldDescription}>Standard working hours per day</Text>
        </View>
      </View>

      <Button style={styles.saveButton} onPress={handleSave}>
        Save Settings
      </Button>
    </View>
  );

  const renderCashbookView = () => (
    <View style={styles.viewContainer}>
      <Button variant="ghost" style={styles.backButton} onPress={handleBack}>
        <View style={styles.backContent}>
          <ArrowLeft size={16} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </Button>

      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.cashbookContainer}>
        <Text style={styles.sectionTitle}>Default Categories</Text>
        <Text style={styles.sectionDescription}>Manage your expense categories</Text>

        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryText}>{category}</Text>
              <Button variant="ghost" size="sm" style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </Button>
            </View>
          ))}
        </View>

        <Button variant="outline" style={styles.addButton}>
          Add New Category
        </Button>
      </View>
    </View>
  );

  const renderAboutView = () => (
    <View style={styles.viewContainer}>
      <Button variant="ghost" style={styles.backButton} onPress={handleBack}>
        <View style={styles.backContent}>
          <ArrowLeft size={16} color="#6B7280" />
          <Text style={styles.backText}>Back</Text>
        </View>
      </Button>

      <DialogHeader>
        <DialogTitle>{getViewTitle()}</DialogTitle>
        <DialogDescription>{getViewDescription()}</DialogDescription>
      </DialogHeader>

      <View style={styles.aboutContainer}>
        <View style={styles.appHeader}>
          <Text style={styles.appName}>Worksite</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.aboutButtons}>
          <Button variant="outline" style={styles.aboutButton}>
            Contact Support
          </Button>

          <Button variant="outline" style={styles.aboutButton}>
            Privacy Policy
          </Button>

          <Button variant="outline" style={styles.aboutButton}>
            Terms of Service
          </Button>
        </View>

        <Text style={styles.footerText}>© 2025 MizTech. All rights reserved.</Text>
      </View>
    </View>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile': return renderProfileView();
      case 'preferences': return renderPreferencesView();
      case 'attendance': return renderAttendanceView();
      case 'salary': return renderSalaryView();
      case 'cashbook': return renderCashbookView();
      case 'about': return renderAboutView();
      default: return renderMainView();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent style={styles.dialogContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderCurrentView()}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  dialogContent: {
    maxHeight: '80%',
    padding: 0,
  },
  viewContainer: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 'auto',
  },
  backContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 'auto',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 'auto',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
  },
  formContainer: {
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  fieldDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  preferencesContainer: {
    gap: 24,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  attendanceContainer: {
    gap: 24,
  },
  salaryContainer: {
    gap: 24,
  },
  cashbookContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  categoriesContainer: {
    gap: 8,
    marginTop: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#1F2937',
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 'auto',
  },
  removeText: {
    fontSize: 12,
    color: '#EF4444',
  },
  addButton: {
    marginTop: 12,
  },
  aboutContainer: {
    gap: 24,
    alignItems: 'center',
  },
  appHeader: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E7D32',
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
  },
  aboutButtons: {
    gap: 12,
    width: '100%',
  },
  aboutButton: {
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#2E7D32',
    marginTop: 24,
  },
});