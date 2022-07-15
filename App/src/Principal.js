import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TextInput, StatusBar, FlatList, TouchableOpacity, Dimensions } from 'react-native'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import * as Animatable from 'react-native-animatable'
import * as SQLite from 'expo-sqlite'

const bd = SQLite.openDatabase('localhost.db', '1.0')
const windowHeight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: Math.round(windowHeight),
        backgroundColor: '#fff',
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
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
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

export default function vehiculosFaena({ navigation }) {
    const [vehiculoFaena, setVehiculoFaena] = useState([])
    const [filterVehiculoFaena, setFilterVehiculoFaena] = useState([])

    const [busqueda, setBusqueda] = useState('')
    const idUsuario = navigation.getParam('idFaena', '0')

    const filtrarVehiculo = (text) => {
        if (text) {
            console.log(text)
            const newData = vehiculoFaena.filter((item) => {
                const itemData = item.nombre_tipo_vehiculo + ' ' + item.patente + ' ' + item.nombre_proveedor.toUpperCase();
                const textData = text.toUpperCase();

                console.log(itemData)
                console.log(textData)
                return itemData.indexOf(textData) > -1;
            })
            setBusqueda(text)
            setFilterVehiculoFaena(newData)
        }
        else {
            setBusqueda(text)
            setFilterVehiculoFaena(vehiculoFaena)
        }
    }

    const goDetalleVehiculo = (item) => {
        navigation.navigate('DetalleVehiculo', { vehiculo: item })
    }

    const goSincronizar = () => {
        navigation.replace('Sync')
    }

    const getVehiculoFaena = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'select v.id_vehiculo, v.patente, tv.nombre_tipo_vehiculo, p.nombre_proveedor from faena_vehiculo fv join vehiculo v on v.id_vehiculo = fv.id_vehiculo join proveedor p on p.id_proveedor = v.id_proveedor join tipo_vehiculo tv on v.id_tipo_vehiculo = tv.id_tipo_vehiculo join faena f on f.id_faena = fv.id_faena where f.id_faena = ?;',
                [idUsuario],
                (tx, res) => {
                    setVehiculoFaena(res.rows._array)
                    setFilterVehiculoFaena(res.rows._array)
                },
                (tx, e) => {
                    console.error(e)
                }
            )
        })
    }

    useEffect(() => {
        getVehiculoFaena()
    }, [])

    console.log(vehiculoFaena, filterVehiculoFaena)

    return (
        <View style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor="transparent" />

            <View style={styles.header} />

            <Animatable.View animation={'fadeInUpBig'} style={styles.body}>
                <View style={styles.card}>
                    <View style={{ paddingTop: 20, paddingLeft: 20, paddingRight: 20, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#000', marginBottom: 10, }}>Vehículos</Text>
                        <View style={styles.action}>
                            <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                            <TextInput
                                placeholder="Buscar Vehiculo"
                                style={{ width: '100%', flex: 10 }}
                                onChangeText={(text) => filtrarVehiculo(text)}
                                value={busqueda} />
                        </View>

                        {
                            filterVehiculoFaena.length > 0 ? (
                                <FlatList
                                    data={filterVehiculoFaena}
                                    key={(x) => filterVehiculoFaena.indexOf(x)}
                                    keyExtractor={(x) => filterVehiculoFaena.indexOf(x)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.itemContainer} onPress={() => goDetalleVehiculo(item)}>
                                            <View style={{ flexDirection: 'row', width: '100%', }}>
                                                <MaterialIcons name="fiber-manual-record" color="#5dd069" size={10} style={{ flex: 1, alignSelf: 'center' }} />
                                                <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_tipo_vehiculo}</Text>
                                            </View>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'gray', marginTop: 2, }}>PATENTE: {item.patente}</Text>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'gray', marginTop: 2, }}>PROVEEDOR: {item.nombre_proveedor}</Text>
                                        </TouchableOpacity>
                                    )}
                                    style={{ height: '85%' }}
                                />
                            ) : (
                                <View style={{ width: '100%', height: '90%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Animatable.View animation="tada" easing="ease-out" iterationCount="infinite">
                                        <MaterialCommunityIcons name="dump-truck" color='#000' size={80} />
                                    </Animatable.View>

                                    <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>¡Sin Vehículos en esta Faena!</Text>
                                    <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => goSincronizar()}>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'gray', }}>Puede intentar </Text>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'blue', }}>volver a Sincronizar. </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }

                    </View>
                </View>
            </Animatable.View>

        </View>
    )
}