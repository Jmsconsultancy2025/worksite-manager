import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// TypeScript Interfaces
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  reminder: boolean;
  createdAt: string;
}

interface Note {
  id: string;
  type: 'note' | 'task';
  title: string;
  description: string;
  category: 'Work' | 'Personal' | 'Important' | 'Meeting' | 'Idea';
  priority: 'High' | 'Medium' | 'Low';
  date: string;
  createdAt: string;
  // Task specific fields
  completed?: boolean;
  dueDate?: string;
  reminder?: boolean;
}

export default function NotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | 'entry' | 'due' | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  // Form state
  const [formType, setFormType] = useState<'note' | 'task'>('note');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Note['category']>('Work');
  const [formPriority, setFormPriority] = useState<Note['priority']>('Medium');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReminder, setFormReminder] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const loadNotes = () => {
      try {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        } else {
          // Initialize with sample data
          const sampleNotes: Note[] = [
            {
              id: '1',
              type: 'task',
              title: 'Review site safety protocols',
              description: 'Check all safety equipment and update protocols',
              category: 'Work',
              priority: 'High',
              date: '2025-06-15',
              createdAt: '2025-06-15T10:00:00',
              completed: false,
              dueDate: '2025-06-20',
              reminder: true,
            },
            {
              id: '2',
              type: 'note',
              title: 'Meeting with contractor',
              description: 'Discussed project timeline and material requirements. Need to order cement by Friday.',
              category: 'Meeting',
              priority: 'Medium',
              date: '2025-06-14',
              createdAt: '2025-06-14T14:30:00',
            },
            {
              id: '3',
              type: 'note',
              title: 'Material cost optimization',
              description: 'Research alternative suppliers for steel. Current supplier quoted 15% higher than market rate.',
              category: 'Idea',
              priority: 'Low',
              date: '2025-06-13',
              createdAt: '2025-06-13T09:15:00',
            },
          ];
          setNotes(sampleNotes);
          localStorage.setItem('notes', JSON.stringify(sampleNotes));
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    loadNotes();
  }, []);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    try {
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
      showToast('Error saving notes');
    }
  };

  // Show toast notification
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    const noteDate = new Date(note.date);
    const matchesFromDate = !fromDate || noteDate >= new Date(fromDate);
    const matchesToDate = !toDate || noteDate <= new Date(toDate);
    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const tasks = filteredNotes.filter((n) => n.type === 'task');
  const regularNotes = filteredNotes.filter((n) => n.type === 'note');

  // Open modal for adding/editing
  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormType(note.type);
      setFormTitle(note.title);
      setFormDescription(note.description);
      setFormCategory(note.category);
      setFormPriority(note.priority);
      setFormDate(note.date);
      setFormDueDate(note.dueDate || new Date().toISOString().split('T')[0]);
      setFormReminder(note.reminder || false);
      setFormCompleted(note.completed || false);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingNote(null);
    setFormType('note');
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Work');
    setFormPriority('Medium');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormReminder(false);
    setFormCompleted(false);
  };

  // Save note
  const saveNote = () => {
    if (!formTitle.trim()) {
      showToast('Please enter a title');
      return;
    }

    const noteData: Note = {
      id: editingNote ? editingNote.id : Date.now().toString(),
      type: formType,
      title: formTitle,
      description: formDescription,
      category: formCategory,
      priority: formPriority,
      date: formDate,
      createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
    };

    if (formType === 'task') {
      noteData.completed = formCompleted;
      noteData.dueDate = formDueDate;
      noteData.reminder = formReminder;
    }

    let updatedNotes;
    if (editingNote) {
      updatedNotes = notes.map((n) => (n.id === editingNote.id ? noteData : n));
      showToast('Note updated successfully');
    } else {
      updatedNotes = [noteData, ...notes];
      showToast('Note added successfully');
    }

    saveNotes(updatedNotes);
    setShowModal(false);
    resetForm();
  };

  // Delete note
  const deleteNote = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedNotes = notes.filter((n) => n.id !== id);
            saveNotes(updatedNotes);
            showToast('Note deleted successfully');
          },
        },
      ]
    );
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    const updatedNotes = notes.map((n) => {
      if (n.id === id && n.type === 'task') {
        return { ...n, completed: !n.completed };
      }
      return n;
    });
    saveNotes(updatedNotes);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
  };

  // Get category color
  const getCategoryColor = (category: Note['category']) => {
    const colors = {
      Work: '#4A90E2',
      Personal: '#F39C12',
      Important: '#E74C3C',
      Meeting: '#9B59B6',
      Idea: '#1ABC9C',
    };
    return colors[category];
  };

  // Get priority color
  const getPriorityColor = (priority: Note['priority']) => {
    const colors = {
      High: '#E74C3C',
      Medium: '#F39C12',
      Low: '#95A5A6',
    };
    return colors[priority];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>📝 Notes</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <MaterialIcons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
        </View>
        <Text style={styles.siteName}>Zonuam Site</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search & Filter Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#95A5A6" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#95A5A6"
            />
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dateFilter}
              onPress={() => setShowDatePicker('from')}
            >
              <Text style={styles.dateFilterLabel}>From:</Text>
              <Text style={styles.dateFilterValue}>
                {fromDate || 'Select'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateFilter}
              onPress={() => setShowDatePicker('to')}
            >
              <Text style={styles.dateFilterLabel}>To:</Text>
              <Text style={styles.dateFilterValue}>
                {toDate || 'Select'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Tasks Section */}
        {tasks.length > 0 && (
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Quick Tasks</Text>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <TouchableOpacity
                  onPress={() => toggleTaskCompletion(task.id)}
                  style={styles.checkbox}
                >
                  <MaterialIcons
                    name={task.completed ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={task.completed ? '#27AE60' : '#95A5A6'}
                  />
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskDueDate}>Due: {task.dueDate}</Text>
                </View>
                <View style={styles.taskActions}>
                  <TouchableOpacity onPress={() => openModal(task)}>
                    <MaterialIcons name="edit" size={20} color="#3498DB" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteNote(task.id)}>
                    <MaterialIcons name="delete" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {regularNotes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    onPress={() => openModal(note)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="edit" size={20} color="#3498DB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteNote(note.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.noteDescription}>{note.description}</Text>
              <View style={styles.noteFooter}>
                <View style={styles.noteTags}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(note.category) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{note.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(note.priority) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{note.priority}</Text>
                  </View>
                </View>
                <Text style={styles.noteDate}>{note.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Entry' : 'Add New Entry'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialIcons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Type Toggle */}
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formType === 'note' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setFormType('note')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      formType === 'note' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Note
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formType === 'task' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setFormType('task')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      formType === 'task' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Task
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formTitle}
                  onChangeText={setFormTitle}
                  placeholder="Enter title"
                  placeholderTextColor="#95A5A6"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Enter description"
                  placeholderTextColor="#95A5A6"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryButtons}>
                  {(['Work', 'Personal', 'Important', 'Meeting', 'Idea'] as const).map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryButton,
                          formCategory === cat && {
                            backgroundColor: getCategoryColor(cat),
                          },
                        ]}
                        onPress={() => setFormCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            formCategory === cat && styles.categoryButtonTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              {/* Priority */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {(['High', 'Medium', 'Low'] as const).map((pri) => (
                    <TouchableOpacity
                      key={pri}
                      style={[
                        styles.priorityButton,
                        formPriority === pri && {
                          backgroundColor: getPriorityColor(pri),
                        },
                      ]}
                      onPress={() => setFormPriority(pri)}
                    >
                      <Text
                        style={[
                          styles.priorityButtonText,
                          formPriority === pri && styles.priorityButtonTextActive,
                        ]}
                      >
                        {pri}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker('entry')}
                >
                  <Text style={styles.dateInputText}>{formDate}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#3498DB" />
                </TouchableOpacity>
              </View>

              {/* Task-specific fields */}
              {formType === 'task' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Due Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowDatePicker('due')}
                    >
                      <Text style={styles.dateInputText}>{formDueDate}</Text>
                      <MaterialIcons name="calendar-today" size={20} color="#3498DB" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => setFormReminder(!formReminder)}
                    >
                      <MaterialIcons
                        name={formReminder ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={formReminder ? '#27AE60' : '#95A5A6'}
                      />
                      <Text style={styles.checkboxLabel}>Set Reminder</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                <Text style={styles.saveButtonText}>
                  {editingNote ? 'Update' : 'Add'} {formType === 'task' ? 'Task' : 'Note'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDatePicker(null)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TextInput
                style={styles.datePickerInput}
                value={
                  showDatePicker === 'from'
                    ? fromDate
                    : showDatePicker === 'to'
                    ? toDate
                    : showDatePicker === 'entry'
                    ? formDate
                    : formDueDate
                }
                onChangeText={(text) => {
                  if (showDatePicker === 'from') setFromDate(text);
                  else if (showDatePicker === 'to') setToDate(text);
                  else if (showDatePicker === 'entry') setFormDate(text);
                  else setFormDueDate(text);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#95A5A6"
              />
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(null)}
                >
                  <Text style={styles.datePickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                  onPress={() => setShowDatePicker(null)}
                >
                  <Text style={styles.datePickerButtonTextPrimary}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <MaterialIcons name="home" size={24} color="#95A5A6" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/workers')}>
          <MaterialIcons name="people" size={24} color="#95A5A6" />
          <Text style={styles.navText}>Workers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cashbook')}>
          <MaterialIcons name="account-balance-wallet" size={24} color="#95A5A6" />
          <Text style={styles.navText}>Cashbook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <MaterialIcons name="note" size={24} color="#27AE60" />
          <Text style={[styles.navText, styles.navTextActive]}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="bar-chart" size={24} color="#95A5A6" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  siteName: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateFilter: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 8,
  },
  dateFilterLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  dateFilterValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tasksSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#95A5A6',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notesSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  noteDescription: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTags: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalScroll: {
    padding: 16,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#27AE60',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: '#FFFFFF',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
  },
  dateInputText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  saveButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  datePickerInput: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#27AE60',
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  datePickerButtonTextPrimary: {
    color: '#FFFFFF',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {},
  navText: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
  navTextActive: {
    color: '#27AE60',
    fontWeight: '600',
  },
});
