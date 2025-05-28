import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native"

export default function LoginScreen() {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const router = useRouter()

  const handleLogin = () => {
    if (username === "user" && password === "pass") {
      router.replace("/screens/task-list")
    } else {
      Alert.alert("Error", "Invalid username or password")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Log In" onPress={handleLogin} color="#007AFF" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
})
