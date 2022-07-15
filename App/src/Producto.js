import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, ActivityIndicator, TextInput, Alert, TouchableOpacity, FlatList, ToastAndroid, ScrollView } from 'react-native'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from "moment";

import Route from '../hooks/routes'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SQLite from 'expo-sqlite'
import Modal from '../components/customModal'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#fff'
    },

    header: {
        flex: 1.5,
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
        height: 50,
        justifyContent: 'center',
    },

    items: {
        margin: 10,
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 10,
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
    },
})

const bd = SQLite.openDatabase('localhost.db', '1.0')

export default function detenerForm({ navigation }) {
    const idUsuario = navigation.getParam('idUsuario', '0')
    const latitude = navigation.getParam('latitude', '0')
    const longitude = navigation.getParam('longitude', '0')
    const idFaenaVehiculo = navigation.getParam('idFaenaVehiculo', '0')

    const today = moment().format('YYYY-MM-DD')
    const [hora, setHora] = useState('')
    const [minutos, setMinutos] = useState('00')

    const [busqueda, setBusqueda] = useState('')
    const [folio, setFolio] = useState('')
    const [horometro, setHorometro] = useState('')

    const [labor, setLabor] = useState([])
    const [filteredLabor, setFilteredLabor] = useState([])
    const [selectedLabor, setSelectedLabor] = useState({ 'nombre_labor': 'Seleccione una Labor...' })
    const [modalLabor, setModalLabor] = useState(false)

    const [operador, setOperador] = useState([])
    const [filteredOperador, setFilteredOperador] = useState([])
    const [selectedOperador, setSelectedOperador] = useState({ 'nombre_trabajador': 'Seleccione un Operador...' })
    const [modalOperador, setModalOperador] = useState(false)

    const [loading, setLoading] = useState(false)
    const [retry, setRetry] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState(false)

    const armarJson = () => {
        setLoading(true)
        if (hora >= 0 && hora < 23 && hora !== '' &&
            selectedLabor.id_labor != undefined && selectedOperador.id_trabajador != undefined && folio != '') {
            const json = JSON.stringify({
                idFaenaVehiculo: idFaenaVehiculo,
                id_labor: selectedLabor.id_labor,
                id_usuario: idUsuario,
                fecha_hora: moment().format('YYYY-MM-DD HH:mm'),
                fecha_hora_supervisor: today + ' ' + hora + ':' + minutos,
                latitud: latitude,
                longitud: longitude,
                detencion_parcial: false,
                folio: folio,
                horometroTermino: horometro == '' ? 0 : parseInt(horometro),
                idTrabajador: selectedOperador.id_trabajador,
            })

            cerrarReport(json)
        }

        else {
            setLoading(false)
            setMessage('Debe ingresar todos los datos obligatorios.')
            setError(true)
        }
    }

    const cerrarReport = async (json) => {
        await fetch(Route + 'cerrar-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json,
        })
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                setLoading(false)
                ToastAndroid.show('Report Cerrado', ToastAndroid.SHORT)
                navigation.pop(2)
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
                            onPress: () => cerrarReport(json),
                        }
                    ]
                );
            })
    }

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

    const filtrarOperador = (text) => {
        if (text) {
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

    const handleMinutos = () => {
        if (minutos === '00') {
            setMinutos('30')
        }
        else {
            setMinutos('00')
        }
    }

    const handleSetHora = (text) => {
        var result = text.replace('.', '').replace('-', '').replace('/', '').replace(' ', '').replace(',', '')
        setHora(result)
    }

    const handleFolio = (text) => {
        var result = text.replace('.', '').replace('-', '').replace('/', '').replace(' ', '').replace(',', '')
        setFolio(result)
    }

    const handleSetHorometro = (text) => {
        var result = text.replace('.', '').replace('-', '').replace('/', '').replace(' ', '').replace(',', '')
        setHorometro(result)
    }

    const handleSelectLabor = (item) => {
        setSelectedLabor(item)
        setBusqueda('')
        setModalLabor(false)
    }

    const handleSelectOperador = (item) => {
        setSelectedOperador(item)
        setBusqueda('')
        setModalOperador(false)
    }

    useEffect(() => {
        const date = new Date()
        setHora(date.getHours() < 9 ? '0' + date.getHours() : date.getHours())
        getLabor()
        getTrabajador()
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cerrar Report</Text>
            </View>

            <View style={styles.body}>
                <View style={{ flexDirection: 'row', marginRight: 20 }}>
                    <View style={{ flexDirection: 'column', marginRight: 20, width: '25%', }}>
                        <Text style={styles.formTitle}>
                            Hora
                        </Text>

                        <View
                            style={[styles.inputContainer, { backgroundColor: '#eee', alignItems: 'center' }]}
                            removeClippedSubviews={true}
                        >
                            <TextInput
                                style={{ fontWeight: 'bold', fontSize: 18 }}
                                value={hora + ''}
                                onChangeText={(text) => handleSetHora(text)}
                                keyboardType={'numeric'}
                                maxLength={2}
                                contextMenuHidden={true}
                                numberOfLines={1}
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'column', marginRight: 20, width: '25%' }}>
                        <Text style={styles.formTitle}>
                            Minutos
                        </Text>

                        <View style={[styles.inputContainer, { backgroundColor: '#eee', }]}>
                            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => handleMinutos()}>
                                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{minutos}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 20, marginBottom: 10, }}>
                    <Text style={styles.formTitle}>
                        Labor Realizada
                    </Text>

                    <TouchableOpacity
                        style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center' }]}
                        onPress={() => setModalLabor(true)}
                    >
                        <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold', flex: 10, }}>{selectedLabor.nombre_labor}</Text>
                        <MaterialIcons name="arrow-drop-down" color="#000" size={20} style={{ flex: 1, }} />
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 10, marginBottom: 10, }}>
                    <Text style={styles.formTitle}>
                        Operador
                    </Text>

                    <TouchableOpacity style={[styles.inputContainer, { backgroundColor: '#eee', flexDirection: 'row', alignItems: 'center' }]} onPress={() => setModalOperador(true)}>
                        <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold', flex: 10, }}>{selectedOperador.nombre_trabajador}</Text>
                        <MaterialIcons name="arrow-drop-down" color="#000" size={20} style={{ flex: 1, }} />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'column', marginTop: 10 }}>
                    <Text style={styles.formTitle}>
                        Folio del Report
                    </Text>

                    <View
                        style={[styles.inputContainer, { backgroundColor: '#eee' }]}
                        removeClippedSubviews={true}
                    >
                        <TextInput
                            placeholder="Folio"
                            keyboardType={'numeric'}
                            onChangeText={(text) => handleFolio(text)}
                            value={folio}
                            style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}
                            numberOfLines={1}
                            contextMenuHidden={true}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'column', marginTop: 10 }}>
                    <Text style={styles.formTitle}>
                        Horometro o Kilometraje (Opcional)
                    </Text>

                    <View
                        style={[styles.inputContainer, { backgroundColor: '#eee' }]}
                        removeClippedSubviews={true}
                    >
                        <TextInput
                            placeholder="Hr/Km"
                            keyboardType={'numeric'}
                            onChangeText={(text) => handleSetHorometro(text)}
                            value={horometro}
                            style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}
                            numberOfLines={1}
                            contextMenuHidden={true}
                        />
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
                        <View style={{ flexDirection: 'column', marginTop: 40, alignItems: 'center', justifyContent: 'center'}}>
                            <ActivityIndicator size="large" color="#000" />
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 18, marginBottom: 10, marginTop: 5 }}>Enviando Datos...</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'column', marginTop: 40 }}>
                            <TouchableOpacity
                                onPress={() => armarJson()}
                                style={[styles.inputContainer, { height: 50, backgroundColor: 'red', alignItems: 'center' }]}
                            >
                                <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold', flex: 10, }}>Cerrar Report</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }

            </View>

            <Modal visibility={modalLabor}>
                <Text style={[styles.formTitle, { alignSelf: 'center' }]}>
                    Seleccione una Labor
                </Text>

                <View style={styles.action}>
                    <MaterialIcons color="gray" name="search" size={20} style={{ flex: 1, marginRight: 10, alignSelf: 'center' }} />
                    <TextInput
                        placeholder="Buscar"
                        style={{ width: '100%', flex: 10 }}
                        onChangeText={(text) => filtrarLabor(text)}
                    />
                </View>

                <FlatList
                    data={filteredLabor}
                    key={(x) => filteredLabor.indexOf(x)}
                    keyExtractor={(x) => filteredLabor.indexOf(x)}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.items} onPress={() => handleSelectLabor(item)}>
                            <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_labor}</Text>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, }]}
                    onPress={() => setModalLabor(false)}
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
                        <TouchableOpacity style={styles.items} onPress={() => handleSelectOperador(item)}>
                            <Text style={{ flex: 15, fontSize: 14, fontWeight: 'bold', color: '#000' }}>{item.nombre_trabajador}</Text>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, }]}
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
                    style={[styles.inputContainer, { marginTop: 20, backgroundColor: 'red', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, }]}
                    onPress={() => console.log('hola')}
                >
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', }}>Cancelar</Text>

                </TouchableOpacity>

            </Modal>

        </View>
    )
}