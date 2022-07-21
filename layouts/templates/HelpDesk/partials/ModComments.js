import  { Component } from 'react'
import {View, Text  } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';

class ModComments extends Component {
    state = {
        record_id : 'false',
    }

    componentDidMount = async () => {
        await AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        })
    }

    loadRecord = () => {
        AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        });
     }

    render() {
        return (
            <View>
                <Text>
                    ModComments :  {this.state.record_id}
                </Text>
            </View> 
        )
    }
}

export default ModComments
