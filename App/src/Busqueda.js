import React, { useState, useEffect, useCallback, useReducer } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, Alert, StatusBar, TouchableOpacity, FlatList, TextInput, Image, Dimensions, } from 'react-native'
import Modal from '../components/customModal'

import * as Animatable from 'react-native-animatable'
import { LinearGradient } from 'expo-linear-gradient'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import * as SQLite from 'expo-sqlite'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ruta from '../hooks/routes'

const windowHeight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        minHeight: Math.round(windowHeight)
    },

    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        opacity: 0.3,
    },

    header: {
        flex: 0.5,
        width: '100%',
        height: '100%',
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
        borderWidth: 1,
        borderColor: 'lightgray',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },

    body: {
        flex: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'red',
    },

    card: {
        backgroundColor: '#fff',
        width: '100%',
    },

    itemContainer: {
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        justifyContent: 'center',

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

const bd = SQLite.openDatabase('localhost.db', '1.0')

export default function busqueda({ navigation }) {
    const [productos, setProductos] = useState([])
    const [filterProductos, setFilterProductos] = useState([])

    const [busqueda, setBusqueda] = useState('')
    const [loading, setLoading] = useState(true)

    const filtrarProducto = (text) => {
        if (text) {
            const newData = productos.filter((item) => {
                const itemData = item.nombre_producto
                const textData = text.toUpperCase();

                return itemData.indexOf(textData) > -1;
            })

            setFilterProductos(newData)
            setBusqueda(text)
        }
        else {
            setFilterProductos(productos)
            setBusqueda(text)
        }
    }

    const goProducto = (item) => {
        navigation.navigate('Producto', {
            idProducto: item.id_producto
        })
    }

    const getProductos = async () => {
        bd.transaction(tx => {
            tx.executeSql(
                "select id_producto,nombre_producto,likes,nombre_subcategoria from producto;",
                [],
                (tx, res) => {
                    const array = res.rows._array
                    console.log(array)
                    const noDuplicate = array.filter((value, index, self) =>
                        index === self.findIndex((item) => (
                            item.id_producto === value.id_producto &&
                            item.nombre_producto === item.nombre_producto
                        ))
                    )
                    setProductos(noDuplicate)
                    setFilterProductos(noDuplicate)
                    setLoading(false)
                },
                (tx, e) => {
                    console.error(e)
                }
            )
        })
    }
    const createTables = () => {
        
        bd.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS producto (id_producto INTEGER, nombre_producto VARCHAR(100),likes INTEGER, nombre_subcategoria VARCHAR(100));', [],
                (tx, res) => {
                    console.log('tabla producto creada')
                    getProductosAPI()
                },
                (tx, error) => {
                    console.error(error.message)
                },
            )
        })


    }
    const getProductosAPI = async () => {
        console.log('se obtienen productos desde API')
        try {
            const response = await fetch('http://192.168.0.22:3000/seminario/sync/producto', { method: 'POST' })
            const data = await response.json()
            if (await data.length != 0) {
                console.log('exito')
                insertarProductos(data)
            }
        }
        catch (e) {
            console.log('fallo desastrozamente')
            console.error(e)
        }
    }

    const insertarProductos = (data) => {
        bd.transaction(tx => {
            tx.executeSql(
                'select * from producto', [],
                (tx, res) => {
                    const localProducto = res.rows

                    for (let i = 0; i < data.length; i++) {
                        if (localProducto.length == 0) {
                            bd.transaction(tr => {
                                tr.executeSql(
                                    'insert into producto(id_producto, nombre_producto,likes,nombre_subcategoria) values(?,?,?,?)',
                                    [data[i].id_producto, data[i].nombre_producto,data[i].likes,data[i].nombre_subcategoria],
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
                    getProductos()
                },
                (tx, e) => {
                    console.log(e)
                })
        })
    }
    

    const deleteTablas = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'drop table producto;', [],
                (tx, res) => {
                    console.log('reiniciando tabla producto')
                    createTables()
                },
                (tx, error) => {
                    console.error(error.message)
                },
            )
        })
    }
    useEffect(() => {
        deleteTablas()
        //createTables()
    }, [])


    return (
        <View style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor="transparent" />

            <View style={styles.header} />

            <Animatable.View animation={'fadeInUpBig'} style={styles.body}>
                <View style={styles.card}>
                    <View style={{ paddingLeft: 20, paddingRight: 20, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#000', marginBottom: 10, }}>PRODUCTOS</Text>
                        <View style={styles.action}>
                            <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                            <TextInput
                                placeholder="Buscar Producto"
                                style={{ width: '100%', flex: 10 }}
                                onChangeText={(text) => filtrarProducto(text)}
                                value={busqueda} />
                        </View>

                        {loading ? (
                            <ActivityIndicator size={'large'} color='#000' style={{ alignSelf: 'center', flex: 1 }} />
                        ) : (
                            <FlatList
                                data={filterProductos}
                                key={(x) => filterProductos.indexOf(x)}
                                keyExtractor={(x) => filterProductos.indexOf(x)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity name={'fadeInUpBig'} style={styles.itemContainer}>
                                        <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5, }}>
                                            <MaterialIcons name="fiber-manual-record" color="#5dd069" size={10} style={{ alignSelf: 'center', marginRight: 5 }} />
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_producto}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5, }}>
                                            <MaterialIcons name="thumb-up" color="#5dd069" size={10} style={{ alignSelf: 'center', marginRight: 5 }} />
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.likes}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5, }}>
                                            <MaterialIcons name="fiber-manual-record" color="#5dd069" size={10} style={{ alignSelf: 'center', marginRight: 5 }} />
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_subcategoria}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                style={{ height: '85%' }}
                            />
                        )}
                    </View>
                </View>
            </Animatable.View>
        </View>
    )
}