import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Redirect, router } from 'expo-router';
import { TextInput, StyleSheet, Modal, Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { login } from '@/services/auth';
import { useState, useRef, useEffect } from 'react';

export default function Index() {

    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showError) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => setShowError(false));
        }
    }, [showError]);

    const handleLogin = async () => {
        const result = await login(secretKey);
        if (result.success) {
            console.log(result.message);
            router.push('/+tabs');
        } else {
            console.log(result.message);
            setError(result.message);
            setShowError(true);
        }
    }
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Login</ThemedText>
            
            <TextInput
                placeholder="Enter your secret key"
                placeholderTextColor="#666"
                style={styles.input}
                value={secretKey}
                onChangeText={setSecretKey}
            />
            
            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
            >
                <ThemedText style={styles.buttonText}>Login</ThemedText>
            </TouchableOpacity>
            
            <Animated.View style={[
                styles.errorToast,
                {
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        })
                    }]
                }
            ]}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            </Animated.View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#f8f9fa',  // Light gray background
    },
    title: {
        fontSize: 36,
        marginBottom: 40,
        fontWeight: '800',
        color: '#2d3436',  // Dark gray, almost black
        letterSpacing: 1,
        fontFamily: 'System',  // You can replace with your preferred font
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#b2bec3',  // Softer border color
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 25,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#2d3436',  // Dark text color
        fontFamily: 'System',  // You can replace with your preferred font
    },
    button: {
        backgroundColor: '#6c5ce7',  // Purple color
        padding: 15,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#6c5ce7',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
        fontFamily: 'System',  // You can replace with your preferred font
    },
    errorToast: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#ff4757',
        padding: 16,
        borderRadius: 12,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});
