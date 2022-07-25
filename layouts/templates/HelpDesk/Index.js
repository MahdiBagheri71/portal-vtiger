import  { Component } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

import ListHelpDesk  from './List'
import DetailHelpDesk  from './Detail'


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
                <DetailHelpDesk investmentHandler={this.loadRecord}/>
            )
        }else{
            return (
                <ListHelpDesk investmentHandler={this.loadRecord}/>
            )
        }
    }
}

export default Index
