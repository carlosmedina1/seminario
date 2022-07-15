import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Image, StatusBar, TouchableOpacity, Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage'
import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import * as Animatable from 'react-native-animatable'
import Route from '../hooks/routes'
import Message from '../components/message'

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        flex: 4,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        opacity: 0.3,
    },

    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 35,
    },

    body: {
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        flex: 6,
        backgroundColor: '#fff',
        alignItems: 'center',
        marginTop: -20,
        padding: 20,
    },

    formContainer: {
        marginTop: 10,
    },

    action: {
        marginTop: 50,
        marginBottom: 10,
        flexDirection: 'row',
        width: '90%',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },

    ingresarContainer: {
        marginTop: 50,
    },

    btnIngresar: {
        backgroundColor: '#000',
        width: 250,
        height: 50,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },

    footer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default function App({ navigation }) {
    const [user, setUser] = useState('')
    const [pass, setPass] = useState('')
    const [text, setText] = useState('')

    const [logining, setLogining] = useState(false)
    const [message, setMessage] = useState(false)
    const [verificando, setVerificando] = useState(true)

    const handleLogin = async () => {
        setLogining(true)
        if (user !== '' && pass !== '') {
            await fetch(Route + 'login?user=' + user + '&pass=' + pass, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    if (data[0].login == 3) {
                        setText('Nombre de usuario incorrecto')
                        setMessage(true)
                        setLogining(false)
                    }
                    else if (data[0].login == 2) {
                        setText('Contraseña incorrecta')
                        setMessage(true)
                        setLogining(false)
                    }
                    else if (data[0].login == 1) {
                        _storeSession()
                        setLogining(false)
                    }
                })
                .catch((error) => {
                    console.error(error)
                    setLogining(false)
                })
        }
        else {
            setText('Debe ingresar todos los datos solicitados')
            setMessage(true)
        }
    }

    const _storeSession = async () => {
        try {
            await AsyncStorage.setItem('isLoged', 'true')
            await AsyncStorage.setItem('user', user)
            navigation.replace('Sync')
        }
        catch (e) {
            console.error('Error al guardar los datos para el inicio de sesión: ')
            console.error(e)

            Alert.alert(
                'Error al Iniciar Sesión',
                'Hemos tenido un inconveniente al guardar los datos para el inicio de Sesión',
                [{ text: 'Entendido', }]
            )
        }
    }

    const _loadSession = async () => {
        try {
            const session = await AsyncStorage.getItem('isLoged')
            if (session) {
                navigation.replace('Sync')
            }
            else {
                console.log('sin sesión iniciada')
                setVerificando(false)
            }
        }
        catch (e) {
            setVerificando(false)
            console.error('Error al traer los datos para el inicio de sesión: ')
            console.error(e)

            Alert.alert(
                'Error al Iniciar Sesión',
                'Hemos tenido un inconveniente recuperar los datos para el inicio de Sesión',
                [{ text: 'Entendido', }]
            )
        }
    }

    useEffect(() => {
        _loadSession()
    }, [])

    if (verificando) {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold' }}>miSupervisor</Text>
            </View>
        )
    }

    else {
        return (
            <View style={styles.container}>
                <StatusBar barStyle='light-content' translucent backgroundColor="transparent" />

                <View style={styles.header}>
                    <Image source={require('./image/loginBackground.jpeg')} style={styles.image} />
                    <Text style={styles.title}>miSupervisor</Text>
                </View>

                <View style={styles.body}>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 25, color: '#000' }}>Iniciar Sesión</Text>
                    </View>

                    <View style={styles.action}>
                        <FeatherIcon color="gray" name="user" size={20} style={{ marginBottom: 10, marginRight: 10 }} />
                        <TextInput placeholder="Nombre de Usuario" style={{ marginBottom: 10, width: '100%' }} onChangeText={(user) => setUser(user)} />
                    </View>

                    <View style={styles.action}>
                        <FeatherIcon color="gray" name="unlock" size={20} style={{ marginBottom: 10, marginRight: 10 }} />
                        <TextInput secureTextEntry={true} placeholder="Contraseña" style={{ marginBottom: 10, width: '100%' }} onChangeText={(pass) => setPass(pass)} />
                    </View>

                    <View style={styles.ingresarContainer}>
                        {
                            logining ? (
                                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'gray' }}>Ingresando...</Text>
                            ) : (
                                <TouchableOpacity style={styles.btnIngresar} onPress={() => handleLogin()}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#fff' }}>Ingresar</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={{ color: 'lightgray', }}>Desarrollado por DataMaule SpA.</Text>
                </View>

                <Message visibility={message}>
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{text}</Text>
                    </View>

                    <TouchableOpacity onPress={() => setMessage(false)} style={{ backgroundColor: '#000', borderRadius: 10, width: 150, height: 40, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#fff' }}>Aceptar</Text>
                    </TouchableOpacity>
                </Message>
            </View>
        );
    }
}