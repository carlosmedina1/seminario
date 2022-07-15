import React from "react"
import { StyleSheet, View, Modal} from "react-native"

const styles = StyleSheet.create({
center: {
    flex: 1,
    backgroundColor: 'rgba(52, 52, 52, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 100,
},

modalView: {
    width: '85%',
    backgroundColor: '#fff',
    elevation: 10,
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
}
})

export default ({ children, visibility }) => {
return(
    <Modal
        animationType="fade"
        transparent={true}
        visible={ visibility }
    >
    
        <View style = { styles.center }>
            
            <View style = { styles.modalView }>
                {children}
            </View>

        </View>

    </Modal>
)

}
