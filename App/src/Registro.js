import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput, Alert, } from 'react-native'
import Modal from '../components/customModal'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import * as SQLite from 'expo-sqlite'

import Route from '../hooks/routes'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#fff'
    },

    header: {
        flex: 2,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    body: {
        flex: 10,
        width: '100%',
        padding: 20,
        marginTop: -20,
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },

    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    inputContainer: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        padding: 10,
        width: '100%',
        height: 40,
    },

    items: {
        margin: 10,
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 10,
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
    },
})

const bd = SQLite.openDatabase('localhost.db', '1.0')

export default function cargarCombustible({ navigation }) {
    const [estanque, setEstanque] = useState([])
    const [filteredEstanque, setFilteredEstanque] = useState([])
    const [selectedEstanque, setSelectedEstanque] = useState({'nombre_estanque_combustible' : 'Seleccione un Estanque...'})
    const [modalEstanque, setModalEstanque] = useState(false)

    const vehiculo = navigation.getParam('vehiculo', '0')
    const [litros, setLitros] = useState('0')
    const [stock, setStock] = useState('0')

    const [combustible, setCombustible] = useState([])
    const [selectedCombustible, setSelectedCombustible] = useState({'nombre_tipo_combustible' : 'Seleccione...'})
    const [modalCombustible, setModalCombustible] = useState(false)

    const [operador, setOperador] = useState([])
    const [filteredOperador, setFilteredOperador] = useState([])
    const [selectedOperador, setSelectedOperador] = useState({'nombre_trabajador' : 'Seleccione un Operador...'})
    const [modalOperador, setModalOperador] = useState(false)

    const [busqueda, setBusqueda] = useState('')
    const filtrarEstanque = (text) => {
        if(text){
            const newData = estanque.filter((item) => {
                const itemData = item.nombre_estanque_combustible
                const textData = text.toUpperCase();

                return itemData.indexOf(textData) > -1;
            })
    
            setFilteredEstanque(newData)
            setBusqueda(text)
        }
        else {
            setFilteredEstanque(estanque)
            setBusqueda(text)
        }
    }

    const filtrarOperador = (text) => {
        if(text){
            const newData = operador.filter((item) => {
                const itemData = item.nombre_trabajador
                const textData = text.toUpperCase();

                return itemData.indexOf(textData) > -1;
            })
    
            setFilteredOperador(newData)
            setBusqueda(text)
        }
        else {
            setFilteredOperador(operador)
            setBusqueda(text)
        }
    }

    const handleSelectEstanque = (item) => {
        setSelectedEstanque(item)
        setModalEstanque(false)
        setBusqueda('')
    }

    const handleSelectedCombustible = (item) => {
        setSelectedCombustible(item)
        setBusqueda('')
        setModalCombustible(false)
    }

    const handleSelectOperador = (item) => {
        setSelectedOperador(item)
        setBusqueda('')
        setModalOperador(false)
    }

    const getTrabajador = () => {
        bd.transaction(tx => {
            tx.executeSql(
                'select * from trabajador;',
                [],
                (tx, res) => {
                    console.log(res.rows._array)
                    setOperador(res.rows._array)
                    setFilteredOperador(res.rows._array)
                },
                (tx, e) => {
                    console.error(e)
                }
            )
        })
    }

    const getEstanque = async () => {
        await fetch(Route + 'sync/estanque', {
            method: 'POST',
        })
            .then(response => response.json())
            .then((data) => {
                setEstanque(data)
                setFilteredEstanque(data)
            })
            .catch((e) => {
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al traer los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => navigation.pop(2),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => getEstanque()
                        }
                    ]
                );
            })
    }

    const getCombustible = async () => {
        await fetch(Route + 'sync/combustible', {
            method: 'POST',
        })
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                setCombustible(data)
            })
            .catch((e) => {
                Alert.alert(
                    "¡Ups!",
                    "Hubo un error al traer los datos: " + e.message,
                    [
                        {
                            text: "Cancelar",
                            onPress: () => navigation.pop(2),
                            style: "cancel"
                        },
                        {
                            text: "Reintentar",
                            onPress: () => getCombustible()
                        }
                    ]
                );
            })
    }

    const handleCargarCombustible = () => {
        if( selectedEstanque.id_estanque_combustible != null && 
            selectedCombustible.id_tipo_combustible != null && 
            selectedOperador.id_trabajador != null) {

            console.log(selectedEstanque)
            console.log(selectedCombustible)
            console.log(selectedOperador)
            console.log(vehiculo)
        }
        else{
            console.log('nada seleccionado')
        }
    }

    useEffect(() => {
        getTrabajador()
        getEstanque()
        getCombustible()
    },[])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cargar Combustible</Text>
            </View>

            <View style={styles.body}>
                <View style={{ flexDirection: 'row', marginRight: 20 }}>
                    <View style={{ flexDirection: 'column', marginRight: 20, width: '20%', }}>
                        <Text style={styles.formTitle}>
                            Stock
                        </Text>

                        <View style={[styles.inputContainer, { backgroundColor: '#eee' }]}>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{stock}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'column', width: '80%' }}>
                        <Text style={styles.formTitle}>
                            Estanque
                        </Text>

                        <TouchableOpacity style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center' }]} onPress={() => setModalEstanque(true)}>
                            <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold', flex: 8, }}>{selectedEstanque.nombre_estanque_combustible}</Text>
                            <MaterialIcons name="arrow-drop-down" color="#000" size={20} style={{ flex: 1, }} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginTop: 20, marginBottom: 10, }}>
                    <Text style={styles.formTitle}>
                        Vehiculo
                    </Text>

                    <View style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold', flex: 10, }}>{vehiculo.nombre_tipo_vehiculo}</Text>
                        <MaterialIcons name="check-circle" color="green" size={20} style={{ flex: 1, }} />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', marginRight: 20 }}>
                    <View style={{ flexDirection: 'column', width: '60%', marginRight: 20, }}>
                        <Text style={styles.formTitle}>
                            Combustible
                        </Text>

                        <TouchableOpacity style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center' }]} onPress={() => setModalCombustible(true)}>
                            <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold', flex: 8, }}>{selectedCombustible.nombre_tipo_combustible}</Text>
                            <MaterialIcons name="arrow-drop-down" color="#000" size={20} style={{ flex: 1, }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'column', width: '40%', }}>
                        <Text style={styles.formTitle}>
                            Litros
                        </Text>

                        <View style={[styles.inputContainer, { backgroundColor: '#eee' }]}>
                            <TextInput
                                placeholder="Litros"
                                keyboardType={'numeric'}
                                style={{ width: '100%', }}
                                onChangeText={(text) => setLitros(text)}
                                value={litros}
                            />
                        </View>
                    </View>

                </View>

                <View style={{ marginTop: 20, marginBottom: 10, }}>
                    <Text style={styles.formTitle}>
                        Operador
                    </Text>

                    <TouchableOpacity style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center' }]} onPress={() => setModalOperador(true)}>
                        <Text style={{ fontSize: 15, color: '#000', fontWeight: 'bold', flex: 10, }}>{selectedOperador.nombre_trabajador}</Text>
                        <MaterialIcons name="arrow-drop-down" color="#000" size={20} style={{ flex: 1, }} />
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 20, marginBottom: 10, }}>
                    <Text style={styles.formTitle}>
                        Observaciones
                    </Text>

                    <TouchableOpacity style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center', }]} onPress={() => console.log('a')}>
                        <TextInput
                            placeholder="Observación Corta"
                            style={{ width: '100%', }}
                            onChangeText={(text) => null}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'green', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, }]}
                    onPress={() => handleCargarCombustible()}
                >
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', }}>Cargar Combustible</Text>

                </TouchableOpacity>

            </View>

            <Modal visibility={modalEstanque}>
                <Text style={[styles.formTitle, { alignSelf: 'center' }]}>
                    Estanques
                </Text>

                <View style={styles.action}>
                    <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                    <TextInput
                        placeholder="Buscar"
                        style={{ width: '100%', flex: 10 }}
                        onChangeText={(text) => filtrarEstanque(text)}
                        value={busqueda}
                    />
                </View>

                <FlatList
                    data={filteredEstanque}
                    key={(x) => filteredEstanque.indexOf(x)}
                    keyExtractor={(x) => filteredEstanque.indexOf(x)}
                    renderItem={({ item }) => (
                        <View style={styles.items}>
                            <TouchableOpacity onPress={() => handleSelectEstanque(item)}>
                                <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_estanque_combustible}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, }]}
                    onPress={() => setModalEstanque(false)}
                >
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', }}>Cancelar</Text>

                </TouchableOpacity>

            </Modal>

            <Modal visibility={modalCombustible}>
                <Text style={[styles.formTitle, { alignSelf: 'center' }]}>
                    Combustibles
                </Text>

                <FlatList
                    data={combustible}
                    key={(x) => combustible.indexOf(x)}
                    keyExtractor={(x) => combustible.indexOf(x)}
                    renderItem={({ item }) => (
                        <View style={styles.items}>
                            <TouchableOpacity onPress={() => handleSelectedCombustible(item)}>
                                <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_tipo_combustible}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, }]}
                    onPress={() => setModalCombustible(false)}
                >
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', }}>Cancelar</Text>

                </TouchableOpacity>

            </Modal>

            <Modal visibility={modalOperador}>
                <Text style={[styles.formTitle, { alignSelf: 'center' }]}>
                    Operadores
                </Text>

                <View style={styles.action}>
                    <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                    <TextInput
                        placeholder="Buscar"
                        style={{ width: '100%', flex: 10 }}
                        onChangeText={(text) => filtrarOperador(text)}
                    />
                </View>

                <FlatList
                    data={filteredOperador}
                    key={(x) => filteredOperador.indexOf(x)}
                    keyExtractor={(x) => filteredOperador.indexOf(x)}
                    renderItem={({ item }) => (
                        <View style={styles.items}>
                            <TouchableOpacity onPress={() => handleSelectOperador(item)}>
                                <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_trabajador}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, }]}
                    onPress={() => setModalOperador(false)}
                >
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', }}>Cancelar</Text>

                </TouchableOpacity>

            </Modal>

            <Modal visibility={false}>
                <Text style={[styles.formTitle, { alignSelf: 'center' }]}>
                    Titulo Modal
                </Text>

                <View style={styles.action}>
                    <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                    <TextInput
                        placeholder="Buscar"
                        style={{ width: '100%', flex: 10 }}
                        onChangeText={(text) => null}
                    />
                </View>

                {/* <FlatList
                    data={array}
                    key={(x) => array.indexOf(x)}
                    keyExtractor={(x) => array.indexOf(x)}
                    renderItem={({ item }) => (
                        <View style={styles.items}>
                            <TouchableOpacity onPress={() => null}>
                                <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.item}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                /> */}

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, }]}
                    onPress={() => console.log('hola')}
                >
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', }}>Cancelar</Text>

                </TouchableOpacity>

            </Modal>

        </View>
    )
}