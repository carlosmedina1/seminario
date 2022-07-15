import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, TextInput, Alert, TouchableOpacity, FlatList, ToastAndroid } from 'react-native'

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
        marginTop: 80,
    },

    timeContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        width: 50,
        height: 50,
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    timeText: {
        fontSize: 25,
        fontWeight: 'bold'
    },

    itemContainer: {
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    laborContainer: {
        marginTop: 10,
        width: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },

    action: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'lightgray',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    btnLabor: {
        width: '90%',
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 10,
        paddingLeft: 10,
        borderColor: 'gray',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
    },

    btn: {
        width: 250,
        height: 50,
        backgroundColor: '#000',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
})

const bd = SQLite.openDatabase('localhost.db', '1.0')

export default function detenerForm({ navigation }) {
    const today = moment().format('YYYY-MM-DD')
    const [hora, setHora] = useState('00')
    const [minutos, setMinutos] = useState('00')

    const refMinutos = useRef()
    const [modalLabor, setModalLabor] = useState(false)
    const [busqueda, setBusqueda] = useState('')

    const [error, setError] = useState(false)
    const [retry, setRetry] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const [labor, setLabor] = useState([])
    const [filteredLabor, setFilteredLabor] = useState([])
    const [selectedLabor, setSelectedLabor] = useState({ nombre_labor: 'Seleccione una Labor...' })

    const idUsuario = navigation.getParam('idUsuario', '0')
    const latitude = navigation.getParam('latitude', '0')
    const longitude = navigation.getParam('longitude', '0')
    const idFaenaVehiculo = navigation.getParam('idFaenaVehiculo', '0')

    const getLabor = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'select * from labor;',
                [],
                (tx, res) => {
                    console.log(res.rows)
                    setLabor(res.rows._array)
                    setFilteredLabor(res.rows._array)
                },
                (tx, e) => {
                    console.error(e)
                }
            )
        })
    }

    const filtrarLabor = (text) => {
        if (text) {
            const newData = labor.filter((item) => {
                const itemData = item.nombre_labor.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            })
            setBusqueda(text)
            setFilteredLabor(newData)
        }
        else {
            setBusqueda(text)
            setFilteredLabor(labor)
        }
    }

    const handleSelectItem = (item) => {
        setSelectedLabor(item)
        setModalLabor(false)
    }

    const handleIniciar = () => {
        if (hora >= 0 && hora < 24 && hora !== '') {
            if (selectedLabor.id_labor != undefined) {
                setLoading(true)

                const json = JSON.stringify({
                    idFaenaVehiculo: idFaenaVehiculo,
                    id_labor: selectedLabor.id_labor,
                    id_usuario: idUsuario,
                    fecha_hora: moment().format('YYYY-MM-DD HH:mm'),
                    fecha_hora_supervisor: today + ' ' + hora + ':' + minutos,
                    latitud: latitude,
                    longitud: longitude,
                    detencion_parcial: true,
                    folio: 0,
                    horometroTermino: 0,
                    idTrabajador: 0,
                })

                console.log(json)
                verificarCierre(json)
            }
            else {
                setError(true)
                setMessage('¡Debe seleccionar una Labor!')
            }
        }
        else {
            setError(true)
            setMessage('¡Debe ingresar un horario válido!')
        }
    }

    const verificarCierre = async (json) => {
        await fetch(Route + 'verificar-cierre', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                setLoading(false)
                ToastAndroid.show('Labor Terminada', ToastAndroid.SHORT)
                navigation.pop(2)

                console.log(data)
            })
            .catch((e) => {
                setLoading(false)
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al enviar los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => navigation.pop(2),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => handleIniciar()
                        }
                    ]
                );
            })
    }

    const handleSetHora = (text) => {
        var result = text.replace('.', '').replace('-', '').replace('/', '').replace(' ', '').replace(',', '')
        setHora(result)
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
        getLabor()
    }, [])

    return (
        <View style={styles.container}>

            <View style={{ flex: 6, }}>
                <Text style={{ fontSize: 30, color: '#000', fontWeight: 'bold', marginLeft: 20, marginBottom: 30 }}>
                    Detención:
                </Text>

                <Text style={{ fontSize: 20, color: '#000', fontWeight: 'bold', marginLeft: 20 }}>
                    Ingrese la Hora de Detención:
                </Text>

                <View style={{ marginLeft: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.timeContainer}>
                        <TextInput
                            placeholder="Hh"
                            style={styles.timeText}
                            onChangeText={(text) => handleSetHora(text)}
                            keyboardType={'numeric'}
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

                <Text style={{ fontSize: 20, color: '#000', fontWeight: 'bold', marginLeft: 20, marginTop: 10 }}>
                    Indique una Labor Realizada:
                </Text>

                <TouchableOpacity style={styles.btnLabor} onPress={() => setModalLabor(true)}>
                    <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold', flex: 8, }}>{selectedLabor.nombre_labor}</Text>
                    <MaterialIcons name="arrow-drop-down" color="#000" size={25} style={{ flex: 1, }} />
                </TouchableOpacity>

                {
                    error ? (
                        <View style={{ alignSelf: 'center', flexDirection: 'row', marginTop: 10 }}>
                            <MaterialIcons name="error" color="red" size={20} />
                            <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{message}</Text>
                        </View>
                    ) : null
                }
            </View>

            {
                loading ? (
                    <View style={{ flex: 1 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, }}>
                            <ActivityIndicator size="large" color="#000" />
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 18, marginBottom: 10, marginTop: 5 }}>Enviando Datos...</Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1, }}>
                        <TouchableOpacity style={styles.btn} onPress={() => handleIniciar()}>
                            <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>Registrar Detención</Text>
                            <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                )
            }

            <Modal visibility={modalLabor}>
                <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold', marginLeft: 20, marginTop: 10 }}>
                    Seleccionar Labor
                </Text>

                <View style={styles.action}>
                    <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                    <TextInput
                        placeholder="Buscar Labor"
                        style={{ width: '100%', flex: 10 }}
                        onChangeText={(text) => filtrarLabor(text)}
                        value={busqueda}
                        contextMenuHidden={true}
                        numberOfLines={1}
                        removeClippedSubviews={true}
                    />
                </View>

                <FlatList
                    data={filteredLabor}
                    key={(x) => filteredLabor.indexOf(x)}
                    keyExtractor={(x) => filteredLabor.indexOf(x)}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectItem(item)}>
                            <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_labor}</Text>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity style={{ backgroundColor: 'red', width: '90%', height: 40, borderRadius: 10, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 10 }} onPress={() => setModalLabor(false)}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                        Cancelar
                    </Text>
                </TouchableOpacity>

            </Modal>

        </View>
    )
}