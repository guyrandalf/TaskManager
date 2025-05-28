import { Stack } from "expo-router"

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerBackVisible: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens/task-list"
        options={{
          title: "Tasks",
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="screens/add-task"
        options={{
          title: "Add Task",
          presentation: "card",
        }}
      />
    </Stack>
  )
}
