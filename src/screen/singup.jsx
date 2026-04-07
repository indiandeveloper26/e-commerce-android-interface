import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, Image, Dimensions, ActivityIndicator, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slice';
import api from "../componet/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotify } from '../redux/contextapi';

const { width } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [message, setMessage] = useState("");

    const isDark = false; // Set to false for White/Orange theme
    const dispatch = useDispatch();


    const { showNotify } = useNotify();


    const handleSubmit = async () => {
        // 1. React Native mein 'e' ya 'preventDefault' ki zaroorat nahi
        setMessage("");

        if (!agree) {
            setMessage("You must agree to the Terms & Conditions.");
            return;
        }

        setLoading(true);

        try {
            // 2. Axios Post Request
            // NOTE: Localhost ki jagah apna IP dalo (e.g., 192.168.1.5)
            const response = await api.post("/api/auth/signup", form, {

            });

            const data = response.data;

            console.log('resdta', data)

            // 3. Success Check
            if (data.userId) {
                // Web ka localStorage hata kar AsyncStorage dalo
                await AsyncStorage.setItem("id", String(data.userId));
                console.log('resdta22')
                // Dispatch to Redux
                dispatch(login({ data }));
                showNotify("singup successfully")

                // Navigation (Next.js router ki jagah)
                navigation.replace("MainTabs");
            } else {
                setMessage(data.message || "Error occurred during signup.");
            }

        } catch (err) {
            // 4. Axios Error Handling (Very Important)
            if (err.response) {
                // Server ne error response diya (e.g. 409, 400, 500)
                if (err.response.status === 409) {
                    setMessage("Email already exists. Please login.");
                } else {
                    setMessage(err.response.data.message || "Signup failed.");
                }
            } else if (err.request) {
                // Request gayi par response nahi aaya (Network issue)
                setMessage("Network error. Please check your internet or IP address.");
                console.log("Axios Request Error:", err.request);
            } else {
                // Kuch aur panga ho gaya
                setMessage("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* --- HEADER SECTION --- */}
                <View style={styles.header}>
                    <Text style={styles.brandName}>CORE<Text style={{ color: '#F54D27' }}>CART</Text></Text>

                    <View style={styles.imageCard}>
                        <Image
                            source={require('../assets/login.jpg')}
                            style={styles.heroImg}
                        />
                        <View style={styles.imgOverlay} />
                    </View>

                    <Text style={styles.heroTitle}>Start Your Journey.</Text>
                    <Text style={styles.heroSub}>Create an account to track orders and earn points.</Text>
                </View>

                {/* --- FORM SECTION --- */}
                <View style={styles.formContainer}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Join Us</Text>
                        <Text style={styles.subtitle}>Create your shopping account today.</Text>
                    </View>

                    {message ? (
                        <View style={styles.errorBox}>
                            <Icon name="alert-circle" size={16} color="#ff4444" />
                            <Text style={styles.errorText}>{message}</Text>
                        </View>
                    ) : null}

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="person-outline" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                placeholder="John Doe"
                                placeholderTextColor="#999"
                                style={styles.input}
                                onChangeText={(val) => setForm({ ...form, name: val })}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="mail-outline" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                placeholder="john@example.com"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                                onChangeText={(val) => setForm({ ...form, email: val })}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                style={styles.input}
                                onChangeText={(val) => setForm({ ...form, password: val })}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree(!agree)}>
                        <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                            {agree && <Icon name="checkmark" size={14} color="white" />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I accept the <Text style={{ color: '#F54D27', fontWeight: 'bold' }}>Terms & Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.btn, loading && { backgroundColor: '#FFA089' }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <View style={styles.btnRow}>
                                <Text style={styles.btnText}>CREATE ACCOUNT</Text>
                                <Icon name="arrow-forward" size={18} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('login')}>
                        <Text style={styles.footerText}>
                            Already a member? <Text style={styles.link}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingBottom: 40 },

    header: { paddingVertical: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', backgroundColor: '#FFF9F8' },
    brandName: { color: '#000', fontSize: 28, fontWeight: '900', letterSpacing: -1.5, marginBottom: 25 },

    imageCard: {
        width: width * 0.75,
        height: 180,
        borderRadius: 30,
        backgroundColor: '#000',
        elevation: 10,
        shadowColor: '#F54D27',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    heroImg: { width: '100%', height: '100%' },
    imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(245, 77, 39, 0.05)' },

    heroTitle: { color: '#1a1a1a', fontSize: 24, fontWeight: '900', marginTop: 30 },
    heroSub: { color: '#666', fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 40, fontWeight: '600' },

    formContainer: { paddingHorizontal: 28, marginTop: 20 },
    titleSection: { marginBottom: 25 },
    title: { fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1 },
    subtitle: { color: '#888', fontSize: 14, fontWeight: '600' },

    errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 12, borderRadius: 15, marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#FFE0E0' },
    errorText: { color: '#ff4444', fontWeight: '700', fontSize: 12 },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', color: '#bbb', marginBottom: 8, marginLeft: 5 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderRadius: 18,
        paddingHorizontal: 15,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    input: { flex: 1, fontWeight: '600', fontSize: 15, color: '#000' },
    icon: { marginRight: 12 },

    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#DDD', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: '#F54D27', borderColor: '#F54D27' },
    checkboxText: { fontSize: 13, color: '#666', fontWeight: '600' },

    btn: { backgroundColor: '#F54D27', height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 15, elevation: 5, shadowColor: '#F54D27', shadowOpacity: 0.3, shadowRadius: 8 },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    btnText: { color: '#fff', fontWeight: '800', letterSpacing: 1, fontSize: 14 },

    footer: { marginTop: 30, alignItems: 'center' },
    footerText: { fontSize: 14, fontWeight: '600', color: '#999' },
    link: { color: '#F54D27', fontWeight: '800' }
});