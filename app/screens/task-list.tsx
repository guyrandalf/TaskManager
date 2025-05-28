import { Task } from "@/types/task"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export default function TaskList() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const router = useRouter()

  const showTaskNotification = async (task: Task, isDone: boolean) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isDone ? "Task Completed! 🎉" : "Task Reopened ↩️",
        body: isDone
          ? `Great job! You completed "${task.name}"`
          : `You reopened "${task.name}"`,
      },
      trigger: null,
    })
  }

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks")
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks))
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
    } catch (error) {
      console.error("Error saving tasks:", error)
    }
  }

  const toggleTask = async (id: string) => {
    const taskToUpdate = tasks.find((task) => task.id === id)
    if (!taskToUpdate) return

    const newDoneStatus = !taskToUpdate.done
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: newDoneStatus } : task
    )

    await saveTasks(updatedTasks)
    await showTaskNotification(taskToUpdate, newDoneStatus)
  }

  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications to receive task updates"
        )
      }
    }
    setup()
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadTasks()
    }, [])
  )

  const formatDate = (date: string) => {
    const taskDate = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (taskDate.toDateString() === today.toDateString()) {
      return "Today"
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return taskDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year:
          taskDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined,
      })
    }
  }

  const getDueDateColor = (date: string) => {
    const taskDate = new Date(date)
    const today = new Date()
    const timeDiff = taskDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysDiff < 0) return "#ff4444"
    if (daysDiff === 0) return "#ffa500"
    if (daysDiff <= 2) return "#ffd700"
    return "#666"
  }

  const handleLogout = () => {
    router.replace("/")
  }

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => toggleTask(item.id)}
      style={[styles.task, item.done && styles.taskCompleted]}
      activeOpacity={0.7}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskLeft}>
          <View style={[styles.checkbox, item.done && styles.checkboxChecked]}>
            {item.done && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskTextContainer}>
            <Text
              style={[
                item.done ? styles.taskDone : styles.taskText,
                styles.taskName,
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.dueDate, { color: getDueDateColor(item.dueDate) }]}
            >
              {formatDate(item.dueDate)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubText}>
            Add your first task by tapping the + button
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks.sort((a, b) => {
            if (a.done === b.done) {
              return (
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              )
            }
            return a.done ? 1 : -1
          })}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/screens/add-task")}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: Platform.OS === "ios" ? 30 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  task: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCompleted: {
    backgroundColor: "#f8f8f8",
    opacity: 0.8,
  },
  taskContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#007bff",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  taskDone: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "#888",
    marginBottom: 4,
  },
  taskName: {
    flex: 1,
  },
  dueDate: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    paddingBottom: 100,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ff4444",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
})
