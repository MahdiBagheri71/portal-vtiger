import  { Component } from 'react'
import {View, Text, StyleSheet,Linking  } from 'react-native'

import {color_bg} from '../../global.js'
class Footer extends Component {

    componentWillUnmount() {
        this._isMounted = false;
    }
    render() {
        return (
            <View style = {styles.Footer}>
                <Text style = {styles.FooterText} onPress={() => Linking.openURL('https://mahdibagherivar.ir/')}>
                    Created by Mahdi Bagheri
                </Text>
            </View> 
        )
    }
}

export default Footer

const styles = StyleSheet.create({
    Footer:{
        backgroundColor : color_bg,
        padding : 15,
        // position: 'absolute', 
        // left: 0, 
        // right: 0, 
        // bottom: -11
    },
    FooterText:{
        textAlign : 'center',
        color : "#fff"
    }
});