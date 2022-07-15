import React from "react";
import {View, StyleSheet, Modal} from "react-native"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(52, 52, 52, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalView: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default function messageComponent({visibility, children}) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visibility}
        >
            <View style={styles.container}>
                <View style={styles.modalView}>
                    {children}
                </View>
            </View>
        </Modal>
    )
}