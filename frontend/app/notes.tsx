import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  assignedTo?: string;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'material' | 'safety' | 'meeting' | 'issue' | 'general';
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
}

// Sample data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Inspect foundation work',
    description: 'Check concrete curing and rebar placement',
    priority: 'high',
    dueDate: '2025-01-15',
    completed: false,
    assignedTo: 'Sanga',
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    title: 'Order electrical supplies',
    description: 'Wiring, switches, and circuit breakers needed',
    priority: 'medium',
    dueDate: '2025-01-18',
    completed: false,
    assignedTo: 'Joseph',
    createdAt: '2025-01-11',
  },
];

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Material Delivery - Cement',
    content: '50 bags of cement delivered. Quality checked. Stored in dry area near site office.',
    category: 'material',
    createdAt: '2025-01-12T10:30:00',
    updatedAt: '2025-01-12T10:30:00',
    hasImage: false,
  },
];

const categoryColors = {
  material: { bg: '#FED7AA', text: '#C2410C', icon: 'inventory-2' },
  safety: { bg: '#FEE2E2', text: '#B91C1C', icon: 'security' },
  meeting: { bg: '#DBEAFE', text: '#1E40AF', icon: 'event' },
  issue: { bg: '#FEF3C7', text: '#A16207', icon: 'warning' },
  general: { bg: '#E9D5FF', text: '#7C3AED', icon: 'note' },
};

const priorityColors = {
  high: { bg: '#FEE2E2', text: '#B91C1C' },
  medium: { bg: '#FEF3C7', text: '#A16207' },
  low: { bg: '#DBEAFE', text: '#1E40AF' },
};

export default function NotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'task' | 'note'>('task');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowToast(false));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    showToastMessage('✓ Task status updated!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📝 Notes & Tasks</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'tasks' && styles.tabActive]} onPress={() => setActiveTab('tasks')}>
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'notes' && styles.tabActive]} onPress={() => setActiveTab('notes')}>
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>Notes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {activeTab === 'tasks' ? (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)}>
                <MaterialIcons name={task.completed ? 'check-circle' : 'radio-button-unchecked'} size={24} color={task.completed ? '#16A34A' : '#D1D5DB'} />
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
            </View>
          ))
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <MaterialIcons name="home" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/workers')}>
          <MaterialIcons name="people" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Workers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cashbook')}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Cashbook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="note" size={24} color="#16A34A" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="bar-chart" size={24} color="#9E9E9E" />
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  tabContainer: { flexDirection: 'row', margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#E8F5E9' },
  tabText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  tabTextActive: { color: '#16A34A', fontWeight: '600' },
  taskCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  taskDescription: { fontSize: 14, color: '#6B7280' },
  noteCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  noteTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  noteContent: { fontSize: 14, color: '#6B7280' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 64, height: 64, borderRadius: 32, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', elevation: 12 },
  toast: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: '#16A34A', borderRadius: 12, padding: 16 },
  toastText: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingVertical: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navLabel: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  navLabelActive: { color: '#16A34A', fontWeight: '600' },
});
