"use client"

import { useState } from "react"
import axios from "axios"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native"

// Steps in the forgot password flow
const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  NEW_PASSWORD: "new_password",
  SUCCESS: "success",
}

export default function ForgotPasswordScreen({ navigation }) {
  // State for the current step in the flow
  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL)

  // Form state
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Request OTP by submitting email
  const handleRequestOTP = async () => {
    // Basic validation
    if (!email) {
      Alert.alert("Error", "Please enter your email address.")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:5001/auth/forgot-password", {
        email,
      })

      if (response.status === 200) {
        Alert.alert(
          "OTP Sent",
          "A verification code has been sent to your email. Please check your inbox and enter the code.",
          [{ text: "OK", onPress: () => setCurrentStep(STEPS.OTP) }],
        )
      }
    } catch (error) {
      console.error("Error requesting OTP:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the verification code.")
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:5001/auth/verify-otp", {
        email,
        otp,
      })

      if (response.status === 200) {
        setCurrentStep(STEPS.NEW_PASSWORD)
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      Alert.alert("Error", error.response?.data?.message || "Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password
  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter and confirm your new password.")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:5001/auth/reset-password", {
        email,
        otp,
        newPassword,
      })

      if (response.status === 200) {
        setCurrentStep(STEPS.SUCCESS)
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Render the email input step
  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Forgot Password</Text>
      <Text style={styles.stepDescription}>
        Enter your email address and we'll send you a verification code to reset your password.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(val) => setEmail(val.trim())}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRequestOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>Send Verification Code</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()} disabled={isLoading}>
        <Text style={styles.linkButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  )

  // Render the OTP verification step
  const renderOTPStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verify Code</Text>
      <Text style={styles.stepDescription}>Enter the verification code sent to {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>

      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.linkButton} onPress={() => setCurrentStep(STEPS.EMAIL)} disabled={isLoading}>
          <Text style={styles.linkButtonText}>Change Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleRequestOTP} disabled={isLoading}>
          <Text style={styles.linkButtonText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // Render the new password step
  const renderNewPasswordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <Text style={styles.stepDescription}>Create a new password for your account</Text>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  )

  // Render the success step
  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Password Reset Successful</Text>
      <Text style={styles.stepDescription}>
        Your password has been reset successfully. You can now log in with your new password.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  )

  // Render the appropriate step based on current state
  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.EMAIL:
        return renderEmailStep()
      case STEPS.OTP:
        return renderOTPStep()
      case STEPS.NEW_PASSWORD:
        return renderNewPasswordStep()
      case STEPS.SUCCESS:
        return renderSuccessStep()
      default:
        return renderEmailStep()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>{renderCurrentStep()}</ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  stepContainer: {
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#666666",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#000000",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
})
