import { Task } from "@/types/task"
import AsyncStorage from "@react-native-async-storage/async-storage"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

/**
 * AddTask component for creating new tasks
 * Provides a form interface for task name and due date input
 */
export default function AddTask() {
  const [name, setName] = useState<string>("")
  const [dueDate, setDueDate] = useState<Date>(new Date())
  const [showPicker, setShowPicker] = useState<boolean>(Platform.OS === "ios")
  const router = useRouter()

  /**
   * Saves a new task to storage
   * Validates input, creates task object, and updates storage
   */
  const saveTask = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a task name")
      return
    }

    try {
      const storedTasks = await AsyncStorage.getItem("tasks")
      const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : []
      const newTask: Task = {
        id: Date.now().toString(),
        name: name.trim(),
        dueDate: dueDate.toISOString().split("T")[0],
        done: false,
      }
      const updatedTasks = [...tasks, newTask]
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))
      router.back()
    } catch (error) {
      console.error("Failed to save task:", error)
      Alert.alert("Error", "Failed to save task")
    }
  }

  /**
   * Handles date change events from the date picker
   * @param event - The event object from the date picker
   * @param selectedDate - The date selected by the user
   */
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(Platform.OS === "ios")
      return
    }

    const currentDate = selectedDate || dueDate
    setShowPicker(Platform.OS === "ios") // Keep open on iOS, close on Android
    setDueDate(currentDate)
  }

  /**
   * Formats a date for display
   * @param date - Date to format
   * @returns Formatted date string
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Task</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.dateDisplay}>{formatDate(dueDate)}</Text>

          {Platform.OS === "ios" ? (
            <View style={styles.iosPickerContainer}>
              <DateTimePicker
                testID="datePicker"
                value={dueDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor="#000"
                style={styles.datePicker}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateButtonText}>Change Date</Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTask}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 30 : 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  datePickerContainer: {
    marginBottom: 30,
  },
  dateDisplay: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  datePicker: {
    backgroundColor: "transparent",
  },
  dateButton: {
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 20,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#dd3c3c",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  iosPickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
    padding: 10,
  },
})
