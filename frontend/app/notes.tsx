import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
interface Note {
  id: string;
  title: string;
  content: string;
  category: 'Work Notes' | 'General';
  date: string; // "02 May 2025"
  time: string; // "10:30 AM"
  image?: string; // Optional image URL
}

interface Task {
  id: string;
  description: string;
  category: 'Not initiated' | 'Processing' | 'Urgent';
  completed: boolean;
  createdAt: string; // ISO timestamp
}

// Sample data
const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Material Delivery Update',
    content: 'The cement delivery was delayed by 2 hours today. Need to inform the team about the revised schedule. The supplier mentioned heavy traffic on the highway.',
    category: 'Work Notes',
    date: '02 May 2025',
    time: '10:30 AM',
    image: 'https://example.com/image.jpg',
  },
  {
    id: '2',
    title: 'Site Safety Meeting',
    content: 'Discussed new safety protocols for working at heights. All workers must wear harnesses when working above 2 meters.',
    category: 'Work Notes',
    date: '01 May 2025',
    time: '2:15 PM',
  },
  {
    id: '3',
    title: 'Weather Conditions',
    content: 'Heavy rain expected tomorrow. Need to cover materials and ensure proper drainage at the site.',
    category: 'General',
    date: '30 Apr 2025',
    time: '4:45 PM',
  },
];

const sampleTasks: Task[] = [
  {
    id: '1',
    description: 'Follow up with supplier about delayed delivery',
    category: 'Urgent',
    completed: false,
    createdAt: '2025-05-02T10:30:00Z',
  },
  {
    id: '2',
    description: 'Schedule safety training for new workers',
    category: 'Processing',
    completed: false,
    createdAt: '2025-05-01T14:20:00Z',
  },
  {
    id: '3',
    description: 'Order additional safety equipment',
    category: 'Not initiated',
    completed: false,
    createdAt: '2025-04-30T16:00:00Z',
  },
];

// Category colors mapping
const noteCategoryColors: { [key: string]: { bg: string; text: string; border: string } } = {
  'Work Notes': { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  'General': { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' },
};

const taskCategoryColors: { [key: string]: { bg: string; text: string; border: string; dot: string } } = {
  'Not initiated': { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', dot: '#9CA3AF' },
  'Processing': { bg: '#FEF3C7', text: '#A16207', border: '#FDE68A', dot: '#F59E0B' },
  'Urgent': { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5', dot: '#EF4444' },
};

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Work Notes' | 'Tasks'>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Note | Task | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isNoteMode, setIsNoteMode] = useState(true);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formNoteCategory, setFormNoteCategory] = useState<'Work Notes' | 'General'>('Work Notes');
  const [formTaskDescription, setFormTaskDescription] = useState('');
  const [formTaskCategory, setFormTaskCategory] = useState<'Not initiated' | 'Processing' | 'Urgent'>('Not initiated');
  const [formImage, setFormImage] = useState('');

  // Animated values
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Load animations
  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        delay: 300,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(fabRotation, {
        toValue: 1,
        delay: 300,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fabRotate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  // Filter items
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || note.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || activeFilter === 'Tasks';
    return matchesSearch && matchesFilter;
  });

  const handleTaskToggle = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      showToastMessage('✅ Task completed and removed!');
      // Remove completed task after animation
      setTimeout(() => {
        setTasks(tasks.filter(t => t.id !== id));
      }, 500);
    }
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotes(notes.filter(n => n.id !== id));
            showToastMessage('🗑️ Note deleted successfully!');
          },
        },
      ]
    );
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTasks(tasks.filter(t => t.id !== id));
            showToastMessage('🗑️ Task deleted successfully!');
          },
        },
      ]
    );
  };

  // Show toast
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingItem(null);
    setIsNoteMode(true);
    setFormTitle('');
    setFormContent('');
    setFormNoteCategory('Work Notes');
    setFormTaskDescription('');
    setFormTaskCategory('Not initiated');
    setFormImage('');
    setModalVisible(true);
  };

  // Open modal for editing
  const openEditModal = (item: Note | Task) => {
    setEditingItem(item);
    if ('title' in item) {
      // It's a note
      setIsNoteMode(true);
      setFormTitle(item.title);
      setFormContent(item.content);
      setFormNoteCategory(item.category);
      setFormImage(item.image || '');
    } else {
      // It's a task
      setIsNoteMode(false);
      setFormTaskDescription(item.description);
      setFormTaskCategory(item.category);
    }
    setModalVisible(true);
  };

  // Save item
  const handleSaveItem = () => {
    if (isNoteMode) {
      if (!formTitle || !formContent) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const now = new Date();
      const newNote: Note = {
        id: editingItem?.id || Date.now().toString(),
        title: formTitle,
        content: formContent,
        category: formNoteCategory,
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        image: formImage || undefined,
      };

      if (editingItem) {
        setNotes(notes.map(n => n.id === editingItem.id ? newNote : n));
        showToastMessage('✏️ Note updated successfully!');
      } else {
        setNotes([newNote, ...notes]);
        showToastMessage('✨ Note added successfully!');
      }
    } else {
      if (!formTaskDescription) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const newTask: Task = {
        id: editingItem?.id || Date.now().toString(),
        description: formTaskDescription,
        category: formTaskCategory,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      if (editingItem) {
        setTasks(tasks.map(t => t.id === editingItem.id ? newTask : t));
        showToastMessage('✏️ Task updated successfully!');
      } else {
        setTasks([newTask, ...tasks]);
        showToastMessage('✅ Task added successfully!');
      }
    }

    setModalVisible(false);
  };

  const handleCamera = () => {
    showToastMessage('📸 Camera functionality would open device camera here');
  };

  const handleGallery = () => {
    showToastMessage('🖼️ Gallery functionality would open device gallery here');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#1A237E" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>📝 Notes & Tasks</Text>
              <Text style={styles.headerSubtitle}>Zonuam Site</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes or tasks..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['All', 'Work Notes', 'Tasks'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
            <MaterialIcons name="camera-alt" size={16} color="#16A34A" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {/* Tasks Section */}
          {(activeFilter === 'All' || activeFilter === 'Tasks') && (
            <View style={styles.section}>
              {activeFilter === 'All' && (
                <Text style={styles.sectionTitle}>Tasks</Text>
              )}

              {filteredTasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <MaterialIcons name="checklist" size={32} color="#9CA3AF" />
                  </View>
                  <Text style={styles.emptyTitle}>No tasks found</Text>
                  <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
                </View>
              ) : (
                filteredTasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleTaskToggle(task.id)}
                    >
                      <MaterialIcons
                        name={task.completed ? "check-box" : "check-box-outline-blank"}
                        size={20}
                        color={task.completed ? "#16A34A" : "#D1D5DB"}
                      />
                    </TouchableOpacity>

                    <View style={styles.taskContent}>
                      <Text style={[styles.taskDescription, task.completed && styles.taskCompleted]}>
                        {task.description}
                      </Text>
                      <View style={styles.taskBadge}>
                        <View style={[styles.categoryDot, { backgroundColor: taskCategoryColors[task.category].dot }]} />
                        <Text style={[styles.taskBadgeText, { color: taskCategoryColors[task.category].text }]}>
                          {task.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal(task)}
                      >
                        <MaterialIcons name="edit" size={12} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(task.id)}
                      >
                        <MaterialIcons name="delete" size={12} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Notes Section */}
          {(activeFilter === 'All' || activeFilter === 'Work Notes') && (
            <View style={styles.section}>
              {activeFilter === 'All' && (
                <Text style={styles.sectionTitle}>Notes</Text>
              )}

              {filteredNotes.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <MaterialIcons name="note" size={32} color="#9CA3AF" />
                  </View>
                  <Text style={styles.emptyTitle}>No notes found</Text>
                  <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
                </View>
              ) : (
                filteredNotes.map((note) => (
                  <View key={note.id} style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      {note.image && (
                        <View style={styles.noteImage}>
                          <MaterialIcons name="image" size={24} color="#9CA3AF" />
                        </View>
                      )}
                    </View>

                    <Text style={styles.noteDateTime}>{note.date} — {note.time}</Text>

                    <Text style={styles.noteContent} numberOfLines={2}>
                      {note.content}
                    </Text>

                    <View style={[styles.categoryBadge, { backgroundColor: noteCategoryColors[note.category].bg, borderColor: noteCategoryColors[note.category].border }]}>
                      <Text style={[styles.categoryBadgeText, { color: noteCategoryColors[note.category].text }]}>
                        {note.category === 'Work Notes' ? '📋' : '📄'} {note.category}
                      </Text>
                    </View>

                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal(note)}
                      >
                        <MaterialIcons name="edit" size={12} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteNote(note.id)}
                      >
                        <MaterialIcons name="delete" size={12} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* First Time Empty State */}
          {notes.length === 0 && tasks.length === 0 && (
            <View style={styles.firstTimeEmpty}>
              <View style={styles.firstTimeIcon}>
                <MaterialIcons name="add" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.firstTimeTitle}>No Notes or Tasks Yet</Text>
              <Text style={styles.firstTimeSubtitle}>Create your first note or task to get started</Text>
              <TouchableOpacity style={styles.firstTimeButton} onPress={openAddModal}>
                <MaterialIcons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.firstTimeButtonText}>Create First Item</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              { scale: fabScale },
              { rotate: fabRotate },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={openAddModal}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingItem ? (isNoteMode ? '✏️ Edit Note' : '✏️ Edit Task') : '✨ Add New Entry'}
              </Text>

              {/* Tab Navigation */}
              {!editingItem && (
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, isNoteMode && styles.tabActive]}
                    onPress={() => setIsNoteMode(true)}
                  >
                    <Text style={[styles.tabText, isNoteMode && styles.tabTextActive]}>New Note</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, !isNoteMode && styles.tabActive]}
                    onPress={() => setIsNoteMode(false)}
                  >
                    <Text style={[styles.tabText, !isNoteMode && styles.tabTextActive]}>New Task</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isNoteMode ? (
                // Note Form
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Title *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={formTitle}
                      onChangeText={setFormTitle}
                      placeholder="Enter note title"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Content *</Text>
                    <TextInput
                      style={[styles.formInput, { minHeight: 100 }]}
                      value={formContent}
                      onChangeText={setFormContent}
                      placeholder="Enter note content"
                      multiline
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category</Text>
                    <View style={styles.categoryButtons}>
                      {(['Work Notes', 'General'] as const).map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.categoryButton, formNoteCategory === cat && styles.categoryButtonActive]}
                          onPress={() => setFormNoteCategory(cat)}
                        >
                          <Text style={[styles.categoryButtonText, formNoteCategory === cat && styles.categoryButtonTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Add Photo</Text>
                    <View style={styles.photoButtons}>
                      <TouchableOpacity style={styles.photoButton} onPress={handleCamera}>
                        <MaterialIcons name="camera-alt" size={16} color="#16A34A" />
                        <Text style={styles.photoButtonText}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.photoButton} onPress={handleGallery}>
                        <MaterialIcons name="photo-library" size={16} color="#16A34A" />
                        <Text style={styles.photoButtonText}>Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                // Task Form
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Task Description *</Text>
                    <TextInput
                      style={[styles.formInput, { minHeight: 80 }]}
                      value={formTaskDescription}
                      onChangeText={setFormTaskDescription}
                      placeholder="Enter task description"
                      multiline
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Priority Status</Text>
                    <View style={styles.priorityButtons}>
                      {(['Not initiated', 'Processing', 'Urgent'] as const).map((priority) => (
                        <TouchableOpacity
                          key={priority}
                          style={[styles.priorityButton, formTaskCategory === priority && styles.priorityButtonActive]}
                          onPress={() => setFormTaskCategory(priority)}
                        >
                          <View style={[styles.priorityDot, { backgroundColor: taskCategoryColors[priority].dot }]} />
                          <Text style={[styles.priorityButtonText, formTaskCategory === priority && styles.priorityButtonTextActive]}>
                            {priority}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                  <Text style={styles.saveButtonText}>
                    {editingItem ? 'Update' : isNoteMode ? 'Save Note' : 'Add Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Toast */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Bottom Navigation */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  // Search
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  // Filter
  filterSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#16A34A',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  cameraButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  // Content
  contentSection: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Task Card
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  checkbox: {
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
    gap: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: '#111827',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  // Note Card
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  noteImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  noteDateTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  // Actions
  editButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  firstTimeEmpty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  firstTimeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  firstTimeTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  firstTimeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  firstTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  firstTimeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 64,
    height: 64,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#1E40AF',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  priorityButtons: {
    gap: 12,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priorityButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    color: '#B91C1C',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
});