import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TextInput, StatusBar, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import Modal from '../components/customModal'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from "moment";

import * as Animatable from 'react-native-animatable'
import * as SQLite from 'expo-sqlite'
import * as Location from 'expo-location';
import Route from '../hooks/routes'

const bd = SQLite.openDatabase('localhost.db', '1.0')
const windowHeight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        minHeight: Math.round(windowHeight),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        opacity: 0.3,
    },

    header: {
        flex: 0.5,
    },

    action: {
        padding: 10,
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    descAction: {
        padding: 10,
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    body: {
        flex: 10,
        width: '100%',
        height: '100%',
        //backgroundColor: 'red',
    },

    card: {
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
    },

    itemContainer: {
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    timeAction: {
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        width: 30,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },

    labor: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    footer: {
        flex: 0.5,
        width: '100%',
        height: '100%',
        //backgroundColor: 'red'
    },
})

export default function detalleVehiculo({ navigation }) {
    const vehiculo = navigation.getParam('vehiculo', '0')
    const [faenaVehiculo, setFaenaVehiculo] = useState({})
    const [user, setUser] = useState(0)

    const [iniciarModal, setIniciarModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingCerrar, setLoadingCerrar] = useState(false)

    const [btnIniciar, setBtnIniciar] = useState(true)
    const [btnDetencion, setBtnDetener] = useState(false)
    const [myLocation, setLocation] = useState({})

    const handleCambiarEstado = (text) => {
        if (text === 'iniciar') {
            if (btnIniciar) {
                navigation.navigate('IniciarForm', {
                    latitude: myLocation != null ? myLocation.coords.latitude : 0,
                    longitude: myLocation != null ? myLocation.coords.longitude : 0,
                    idUsuario: user,
                    idFaenaVehiculo: faenaVehiculo.id_faena_vehiculo,
                })
            }
        }
        else {
            if (btnDetencion) {
                navigation.navigate('DetenerForm', {
                    latitude: myLocation.coords.latitude != null ? myLocation.coords.latitude : 0,
                    longitude: myLocation.coords.longitude != null ? myLocation.coords.longitude : 0,
                    idUsuario: user,
                    idFaenaVehiculo: faenaVehiculo.id_faena_vehiculo,
                })
            }
        }
    }

    const cerrarReport = async () => {
        setLoadingCerrar(true)
        const json = JSON.stringify({ idFaenaVehiculo: faenaVehiculo.id_faena_vehiculo, })
        await fetch(Route + 'verificar-cierre-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                var abierto
                if (data.length == 0) {
                    Alert.alert(
                        "Cerrar Report",
                        "Aún no se a abierto ningún Report.",
                        [
                            {
                                text: "Entendido",
                                style: "cancel"
                            },
                        ]
                    );
                }

                else {
                    const length = data.length
                    for (let i = 0; i < length; i++) {
                        if (data[i].cerrado == false) {
                            navigation.navigate('CerrarReport', {
                                latitude: myLocation.coords.latitude != null ? myLocation.coords.latitude : 0,
                                longitude: myLocation.coords.longitude != null ? myLocation.coords.longitude : 0,
                                idUsuario: user,
                                idFaenaVehiculo: faenaVehiculo.id_faena_vehiculo,
                            })

                            abierto = true
                        }
                        else {
                            abierto = false
                        }
                    }

                    if (!abierto) {
                        Alert.alert(
                            "Cerrar Report",
                            "Aún no se a abierto ningún Report.",
                            [
                                {
                                    text: "Entendido",
                                    style: "cancel"
                                },
                            ]
                        );
                    }
                }
                setLoadingCerrar(false)
            })
            .catch((e) => {
                setLoadingCerrar(false)
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al enviar los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => navigation.pop(1),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => cerrarReport(json)
                        }
                    ]
                );
            })
    }

    const getIdUsuario = (usuario) => {
        bd.transaction(tx => {
            tx.executeSql(
                'select id_usuario from usuario where nombre_usuario = ?;',
                [usuario],
                (tx, res) => {
                    setUser(res.rows._array[0].id_usuario)
                },
                (tx, error) => {
                    console.error(error.message)
                },
            )
        })
    }

    const getFaenaVehiculo = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM faena_vehiculo WHERE id_vehiculo = ?;', [vehiculo.id_vehiculo],
                (tx, res) => {
                    setFaenaVehiculo(res.rows._array[0])
                    verificarFuncionamiento(res.rows._array[0].id_faena_vehiculo)
                },
                (tx, error) => {
                    console.error(error.message)
                },
            )
        })
    }

    const verificarFuncionamiento = async (id) => {
        const json = JSON.stringify({ idFaenaVehiculo: id })

        await fetch(Route + 'verificar-funcionamiento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                if (data.length > 0) {
                    validarBotones(data)
                }
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
                console.log(e)
            })
    }

    const validarBotones = (data) => {
        if (data[0].iniciado) {
            setBtnDetener(true)
            setBtnIniciar(false)
        }
        else {
            setBtnDetener(false)
            setBtnIniciar(true)
        }
    }

    const goCargarCombustible = () => {
        navigation.navigate('CargarCombustible', { vehiculo: vehiculo })
    }

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permisos Denegados', 'Es necesario saber su ubicación para que la Aplicación funcione.', [{
                    text: "Entendido",
                    onPress: () => navigation.replace('Sync')
                }])
            }
            else {
                let location = await Location.getCurrentPositionAsync({})
                setLocation(location)
            }
        })()
        getFaenaVehiculo()
        _loadUser()
    }, [])

    const _loadUser = async () => {
        try {
            const user = await AsyncStorage.getItem('user')
            getIdUsuario(user)
        }
        catch (e) {
            console.error('Error al traer los datos para el inicio de sesión: ')
            console.error(e)

            Alert.alert(
                'Error al Iniciar Sesión',
                'Hemos tenido un inconveniente recuperar los datos del Usuario',
                [{ text: 'Entendido', }]
            )
        }
    }

    return (
        <View animation={'fadeInUpBig'} style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor="transparent" />
            {!loading ? (
                <ScrollView style={styles.body}>
                    <View style={styles.card}>
                        <View style={{ paddingTop: 20, paddingLeft: 20, paddingRight: 20, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#000', marginBottom: 10, }}>Detalle del Vehículo:</Text>

                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'gray', marginTop: 10, }}>Información General:</Text>
                            <View style={styles.itemContainer}>
                                <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>Tipo de Vehiculo: </Text>
                                    <Text style={{ fontSize: 14, }}>{vehiculo.nombre_tipo_vehiculo}</Text>
                                </View>

                                <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>Patente: </Text>
                                    <Text style={{ fontSize: 14, }}>{vehiculo.patente}</Text>
                                </View>

                                <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>Proveedor: </Text>
                                    <Text style={{ fontSize: 14, }}>{vehiculo.nombre_proveedor}</Text>
                                </View>

                            </View>

                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'gray', marginTop: 10, }}>Procesos: </Text>

                            <View style={styles.itemContainer}>
                                <View style={{ alignItems: 'center', justifyContent: 'center', }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', marginLeft: 5, }}>Maquina en Funcionamiento:</Text>

                                    <View style={{ flexDirection: 'row', marginTop: 10, }}>
                                        <TouchableOpacity
                                            onPress={() => handleCambiarEstado('iniciar')}
                                            style={{ backgroundColor: btnIniciar ? 'green' : 'gray', width: 100, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10, }}>

                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>Iniciar</Text>

                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleCambiarEstado('detener')}
                                            style={{ backgroundColor: btnDetencion ? 'red' : 'gray', width: 100, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
                                        >

                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>Detener</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>

                            {loadingCerrar ? (
                                <View>
                                    <View style={{ flexDirection: 'column', marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator size="small" color="#000" />
                                        <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 5 }}>Cargando...</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.itemContainer}>
                                    <TouchableOpacity onPress={() => cerrarReport()}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <View style={{ flex: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                                                <MaterialIcons name="error" color="red" size={20} />
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', marginLeft: 10 }}>Cerrar Report</Text>
                                            </View>

                                            <View style={{ flex: 1, }}>
                                                <MaterialIcons name='keyboard-arrow-right' color='lightgray' size={20} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                        </View>
                    </View>
                </ScrollView>
            ) : (
                <Animatable.View animation={'fadeInUpBig'} style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Cargando...</Text>

                    <Animatable.View animation="tada" easing="ease-out" iterationCount="infinite">
                        <MaterialCommunityIcons name='dump-truck' size={40} color='#000' />
                    </Animatable.View>
                </Animatable.View>
            )}

        </View>
    )
}


/* <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => goCargarCombustible()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flex: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <MaterialCommunityIcons name='gas-station' color='green' size={20} />
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', marginLeft: 10 }}>Cargar Combustible</Text>
                </View>

                <View style={{ flex: 1, }}>
                    <MaterialIcons name='keyboard-arrow-right' color='lightgray' size={20} />
                </View>
            </View>
        </TouchableOpacity>
    </View>

    <View style={styles.itemContainer}>
        <TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flex: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                    <MaterialIcons name='report-problem' color='orange' size={20} />
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', marginLeft: 10 }}>Reportar Problema</Text>
                </View>

                <View style={{ flex: 1, }}>
                    <MaterialIcons name='keyboard-arrow-right' color='lightgray' size={20} />
                </View>
            </View>
        </TouchableOpacity>
    </View> */