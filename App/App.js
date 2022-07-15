import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import Busqueda from './src/Busqueda'
import Categoria from './src/Categoria'
import Login from './src/Login'
import Principal from './src/Principal'
import Producto from './src/Producto'
import Busqueda from './src/Busqueda'

const AppNavigator = createStackNavigator({
  

  Busqueda: {
    screen: Busqueda,

    navigationOptions: {
      title: 'Busqueda',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Categoria: {
    screen: 'Categoria',

    navigationOptions: {
      title: 'Categoria',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Principal: {
    screen: 'Principal',

    navigationOptions: {
      title: 'Principal',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Producto: {
    screen: 'Producto',

    navigationOptions: {
      title: 'Producto',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Registro: {
    screen: 'Registro',

    navigationOptions: {
      title: 'Registro',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },

  Reportar: {
    screen: 'Reportar',

    navigationOptions: {
      title: 'Reportar',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Reportes: {
    screen: 'Reportes',

    navigationOptions: {
      title: 'Reportes',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Subcategoria: {
    screen: 'Subcategoria',

    navigationOptions: {
      title: 'Subcategoria',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },
  Login: {
    screen: 'Login',

    navigationOptions: {
      title: 'Login',
      headerTintColor: '#fff',
      headerShown: false,
      headerBackTitleVisible: false,
    },
  },


  //* render de otra pantalla.
},{
  initialRouteName: 'Busqueda',
  defaultNavigationOptions: {
    headerStyle:{
      backgroundColor: '#fff',
    },
    headerTintColor: '#fff',
  }
})

export default createAppContainer(AppNavigator)