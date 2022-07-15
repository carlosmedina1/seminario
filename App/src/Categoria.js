import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Alert, StatusBar, TouchableOpacity, TextInput, ToastAndroid, Platform, AlertIOS, } from 'react-native'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from "moment";

import Route from '../hooks/routes'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SQLite from 'expo-sqlite'
import Modal from '../components/customModal'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    timeContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        width: 80,
        height: 80,
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    timeText: {
        fontSize: 30,
        fontWeight: 'bold'
    },

    horometroContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        height: 30,
        margin: 20,
        justifyContent: 'center',
    },

    btn: {
        margin: 20,
        width: 250,
        height: 60,
        backgroundColor: '#000',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

const bd = SQLite.openDatabase('localhost.db', '1.0')

export default function iniciarForm({ navigation }) {
    const today = moment().format('YYYY-MM-DD')
    const [hora, setHora] = useState('')
    const [minutos, setMinutos] = useState('00')

    const [mostrarHorometro, setMostrarHorometro] = useState(false)
    const [horometro, setHorometro] = useState('')
    const [cargandoHorometro, setCargandoHorometro] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [message, setMessage] = useState('')

    const idUsuario = navigation.getParam('idUsuario', '0')
    const latitude = navigation.getParam('latitude', '0')
    const longitude = navigation.getParam('longitude', '0')
    const idFaenaVehiculo = navigation.getParam('idFaenaVehiculo', '0')

    console.log(latitude, longitude)

    const handleIniciar = () => {
        if (hora >= 0 && hora < 24 && hora !== '') {
            setLoading(true)
            console.log(latitude, longitude)
            const json = JSON.stringify({
                idFaenaVehiculo: idFaenaVehiculo,
                idUsuario: idUsuario,
                fecha: today + ' ' + hora + ':' + minutos,
                fechaSupervisor: moment().format('YYYY-MM-DD HH:mm'),
                latitud: latitude,
                longitud: longitude,
            })
            console.log(json)
            verificarReport(json)
        }

        else {
            setError(true)
            setMessage('¡Debe ingresar un horario válido!')
        }
    }

    const verificarReport = async (json) => {
        await fetch(Route + 'verificar-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                const reportJson = JSON.stringify({ idFaenaVehiculo: idFaenaVehiculo })
                verificarHorometro(reportJson)
            })
            .catch((e) => {
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al enviar los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => handleAlert('cancelar'),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => handleAlert('reintentar')
                        }
                    ]
                );
            })
    }

    const verificarHorometro = async (json) => {
        await fetch(Route + 'verificar-horometro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                if (data[0].horometro_ingresado == false) {
                    setMostrarHorometro(true)
                }
                else {
                    setLoading(false)
                    ToastAndroid.show('Labor Iniciada', ToastAndroid.SHORT)
                    navigation.pop(2)
                }
            })
            .catch((e) => {
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al enviar los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => handleAlert('cancelar'),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => verificarHorometro(json)
                        }
                    ]
                );
            })
    }

    const handleMostrarHorometro = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'select horometro_ingresado from horometro where id_faena_vehiculo = ?;',
                [idFaenaVehiculo],
                (tx, res) => {
                    if (res.rows.length == 0) {
                        bd.transaction(tx => {
                            tx.executeSql(
                                'insert into horometro(id_faena_vehiculo, horometro_ingresado) values(?, 1);',
                                [idFaenaVehiculo],
                                (tx, res) => {
                                    setMostrarHorometro(true)
                                },
                                (tx, error) => {
                                    Alert.alert(
                                        "¡Ups!",
                                        "Hubo un error al enviar los datos: " + error.message,
                                        [
                                            {
                                                text: "Cancelar",
                                                onPress: () => handleAlert('cancelar'),
                                                style: "cancel"
                                            },
                                            {
                                                text: "Reintentar",
                                                onPress: () => handleMostrarHorometro()
                                            }
                                        ]
                                    );
                                },
                            )
                        })
                    }
                    else {
                        ToastAndroid.show('Labor Iniciada', ToastAndroid.SHORT)
                        setLoading(false)
                        navigation.pop(2)
                    }
                },
                (tx, error) => {
                    Alert.alert(
                        "¡Ups!",
                        "Hubo un error al enviar los datos: " + error.message,
                        [
                            {
                                text: "Cancelar",
                                onPress: () => handleAlert('cancelar'),
                                style: "cancel"
                            },
                            {
                                text: "Reintentar",
                                onPress: () => handleMostrarHorometro()
                            }
                        ]
                    );
                },
            )
        })
    }

    const ingresarHorometro = async () => {
        setCargandoHorometro(true)

        const json = JSON.stringify({
            idFaenaVehiculo: idFaenaVehiculo,
            horometro: horometro,
        })

        await fetch(Route + 'agregar-horometro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                ToastAndroid.show('Labor Iniciada', ToastAndroid.SHORT)
                setMostrarHorometro(false)
                setLoading(false)
                setCargandoHorometro(false)

                navigation.pop(2)
            })
            .catch((e) => {
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al enviar los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => handleAlert('cancelar'),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => ingresarHorometro()
                        }
                    ]
                );
            })
    }

    const handleSetHora = (text) => {
        var result = text.replace('.', '').replace('-', '').replace('/', '').replace(' ', '').replace(',', '')
        setHora(result)
    }

    const handleAlert = (option) => {
        if (option === 'reintentar') {
            handleIniciar()
        }
        else {
            navigation.pop(2)
        }
    }

    const handleMinutos = () => {
        if (minutos === '00') {
            setMinutos('30')
        }
        else {
            setMinutos('00')
        }
    }

    useEffect(() => {
        const date = new Date()
        setHora(date.getHours() < 9 ? '0' + date.getHours() : date.getHours())
    }, [])

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 25, color: '#000', fontWeight: 'bold', }}>
                Ingrese la Hora de Inicio:
            </Text>

            <View
                style={{ margin: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                removeClippedSubviews={true}
            >

                <View style={styles.timeContainer}>
                    <TextInput
                        placeholder="Hh"
                        keyboardType='numeric'
                        style={styles.timeText}
                        onChangeText={(text) => handleSetHora(text)}
                        maxLength={2}
                        value={hora + ''}
                        contextMenuHidden={true}
                        numberOfLines={1}
                        removeClippedSubviews={true}
                    />
                </View>

                <Text style={styles.timeText}>:</Text>

                <View style={styles.timeContainer}>
                    <TouchableOpacity style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }} onPress={() => handleMinutos()}>
                        <Text style={styles.timeText}>{minutos}</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {
                error ? (
                    <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                        <MaterialIcons name="error" color="red" size={20} />
                        <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{message}</Text>
                    </View>
                ) : null
            }

            {
                loading ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, }}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 18, marginBottom: 10, marginTop: 5 }}>Enviando Datos...</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.btn} onPress={() => handleIniciar()}>
                        <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>Registrar Inicio</Text>
                        <MaterialCommunityIcons name="arrow-right" size={30} color="#fff" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                )
            }

            <Modal visibility={mostrarHorometro}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ marginBottom: 15, fontWeight: 'bold', fontSize: 18 }}>Ingrese el Contador</Text>

                    <View>
                        {cargandoHorometro ? (
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <ActivityIndicator size="large" color="#000" />
                                <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 18, marginBottom: 10, marginTop: 5 }}>Enviando Datos...</Text>
                            </View>
                        ) : (
                            <View style={{width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <View
                                    style={{
                                        borderColor: 'gray',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        height: 40,
                                        width: 250,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 10,
                                    }}
                                    removeClippedSubviews={true}
                                >
                                    <TextInput
                                        placeholder="Hh/Km (opcional)"
                                        keyboardType='numeric'
                                        style={{ fontWeight: 'bold', fontSize: 18, width: '100%', alignItems: 'center', justifyContent: 'center', }}
                                        onChangeText={(text) => setHorometro(text)}
                                        contextMenuHidden={true}
                                        numberOfLines={1}
                                        removeClippedSubviews={true}
                                    />
                                </View>

                                <TouchableOpacity style={{ backgroundColor: '#000', borderRadius: 10, width: 100, height: 40, marginTop: 15, alignItems: 'center', justifyContent: 'center' }} onPress={() => ingresarHorometro()}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, }}>Aceptar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </View>
            </Modal>

        </View>
    )
}