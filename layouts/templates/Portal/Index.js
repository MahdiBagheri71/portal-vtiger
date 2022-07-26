import  { Component } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

import List  from './List'
import Detail  from './Detail'


class Index extends Component {
    state = {
        record_id : 'false',
    }

    componentDidMount = async () => {
        await AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadRecord = () => {
        AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        });
     }

    render() {
        if(this.state.record_id.includes("x")){
            return (
                <Detail investmentHandler={this.loadRecord}/>
            )
        }else{
            return (
                <List investmentHandler={this.loadRecord}/>
            )
        }
    }
}

export default Index
