import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from '../../constants/LinearGradient';
import { router, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { authService } from '../../services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim() || username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!email.includes('@')) errs.email = 'Enter a valid email address';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register(username.trim(), email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, value, onChange, placeholder, secure, keyboardType, name,
    showToggle, onToggle,
  }: any) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[name] && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={(t) => { onChange(t); setErrors(p => ({ ...p, [name]: undefined })); }}
          secureTextEntry={secure && !showToggle}
          autoCapitalize={name === 'email' ? 'none' : name === 'username' ? 'none' : 'sentences'}
          keyboardType={keyboardType || 'default'}
        />
        {secure && (
          <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
            <Ionicons name={showToggle ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {errors[name] && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );

  return (
    <LinearGradient colors={Colors.gradientHero} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={Colors.gradientPrimary} style={styles.logoGradient}>
                <Ionicons name="trending-up" size={32} color={Colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>WealthLens</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Start tracking your investments</Text>

            <Field
              label="Username" name="username" value={username} onChange={setUsername}
              placeholder="yourname" keyboardType="default"
            />
            <Field
              label="Email" name="email" value={email} onChange={setEmail}
              placeholder="you@example.com" keyboardType="email-address"
            />
            <Field
              label="Password" name="password" value={password} onChange={setPassword}
              placeholder="Min. 6 characters" secure showToggle={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
            <Field
              label="Confirm Password" name="confirmPassword" value={confirmPassword}
              onChange={setConfirmPassword} placeholder="Repeat password" secure
              showToggle={showPassword} onToggle={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={Colors.gradientPrimary} style={styles.registerBtnGradient}>
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.registerBtnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logoContainer: { marginBottom: 12 },
  logoGradient: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.white },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 22 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 7, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: { borderColor: Colors.danger },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4, marginLeft: 4 },
  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 10, marginBottom: 20 },
  registerBtnGradient: { height: 54, justifyContent: 'center', alignItems: 'center' },
  registerBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
