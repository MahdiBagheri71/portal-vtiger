
import React, {Component} from 'react'
import Header from './layouts/templates/Header.js'
import {AppRegistry, View} from 'react-native'

class portalVtigerApp extends Component {
    render() {
        return (
            <View>
                <Header/>
            </View>
        )
    }
}

export default portalVtigerApp
AppRegistry.registerComponent('portalVtigerApp', () => portalVtigerApp)