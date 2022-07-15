import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Alert, StatusBar, TouchableOpacity, FlatList, TextInput } from 'react-native'

import * as Animatable from 'react-native-animatable'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import ruta from '../hooks/routes'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SQLite from 'expo-sqlite'

import Modal from '../components/customModal'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    header: {
        flex: 1,
        width: '100%',
    },

    searchBar: {
        width: '80%',
        height: '30%',
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        flexDirection: 'row',
    },

    body: {
        flex: 10,
    },

    footer: {
        flex: 1,
    },
})

const bd = SQLite.openDatabase('localhost.db', '1.0')

export default function faenas({ navigation }) {
    const [loading, setLoading] = useState(false)
    const [retry, setRetry] = useState(false)
    const [mensaje, setMensaje] = useState('')

    const createTables = () => {
        
        bd.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS producto (id_producto INTEGER, nombre_producto VARCHAR(100));', [],
                (tx, res) => {
                    console.log('tabla producto creada')
                },
                (tx, error) => {
                    console.error(error.message)
                },
            )
        })


    }
    const selectProducto = (data) => {
        bd.transaction(tx => {
            tx.executeSql(
                'select * from producto', [],
                (tx, res) => {
                    const localProducto = res.rows

                    for (let i = 0; i < data.length; i++) {
                        if (localProducto.length == 0) {
                            bd.transaction(tr => {
                                tr.executeSql(
                                    'insert into producto(id_producto, nombre_producto) values(?,?)',
                                    [data[i].id_producto, data[i].nombre_producto],
                                    (tr, res) => {
                                        console.log('producto insertado: ' + data[i].nombre_producto)
                                    },
                                    (tr, e) => {
                                        console.error(e)
                                    }
                                )
                            })
                        }

                        else if (localProducto._array[i].id_producto != data[i].id_producto) {
                            bd.transaction(tr => {
                                tr.executeSql(
                                    'insert into producto(id_producto, nombre_producto) values(?,?)',
                                    [data[i].id_producto, data[i].nombre_producto],
                                    (tr, res) => {
                                        console.log('producto insertado: ' + data[i].nombre_producto)
                                    },
                                    (tr, e) => {
                                        console.error(e)
                                    }
                                )
                            })
                        }

                        else {
                            null
                        }
                    }
                },
                (tx, e) => {
                    console.log(e)
                })
        })
    }



    const getProductos = async () => {
        try {
            const response = await fetch(ruta + 'functions/producto', { method: 'POST' })
            const data = await response.json()
            if (await data.length != 0) {
                selectProducto(data)
            }
        }
        catch (e) {
            console.error(e)
        }
    }

    

    const deleteTablas = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'drop table producto;', [],
                (tx, res) => {
                    console.log('reiniciando tabla producto')
                },
                (tx, error) => {
                    console.error(error.message)
                },
            )
        })
    }

    const cerrarSesion = async () => {
        await AsyncStorage.removeItem('user')
        await AsyncStorage.removeItem('isLoged')
        navigation.replace('Login')
    }

    const sincronizar = () => {
        setLoading(true)
        deleteTablas()
        createTables()
        getUsuario()
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor="transparent" />

            <View style={{ flex: 1, }} />

            <Animatable.View animation={'fadeInUpBig'} style={{ alignItems: 'center', justifyContent: 'center', flex: 8 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold' }}>miSupervisor</Text>

                {loading ? (
                    <Animatable.View animation="tada" easing="ease-out" iterationCount="infinite">
                        <MaterialCommunityIcons name='dump-truck' size={40} color='#000' />
                    </Animatable.View>
                ) : (
                    retry ? (
                        <View>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 5 }}>{mensaje}</Text>
                        </View>
                    ) : (
                        <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" style={{ margin: 20, }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', width: 200, height: 50, borderRadius: 10, }}
                                onPress={() => sincronizar()}>

                                <MaterialIcons name="cloud-download" color='#fff' size={20} />
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }}>Sincronizar</Text>

                            </TouchableOpacity>
                        </Animatable.View>
                    )
                )}

            </Animatable.View>

            <View style={{ flex: 1 }}>
                {retry ? (
                    <TouchableOpacity onPress={() => getUsuario()} style={{ backgroundColor: '#000', width: 100, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Reintentar</Text>
                    </TouchableOpacity>
                ) : (
                    loading ? (
                        <View>
                            <ActivityIndicator size="small" color="#000" />
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 5 }}>Importando Datos...</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => cerrarSesion()}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 5 }}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    )
                )}
            </View>

        </View>
    )
}

