import  { Component } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

import List  from './List'
import Detail  from './Detail'


class Index extends Component {
    state = {
        record_id : 'false',
        module : ""
    }

    componentDidMount = async () => {
        await AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        })
        
        await AsyncStorage.getItem('module').then((value) => {
            if(value){
                this.setState({ 'module': value })
            }
            
            if(value != 'Project'){
                this.props.investmentHandler();
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadRecord = async() => {
        await AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        });
        
        await AsyncStorage.getItem('module').then((value) => {
            if(value){
                this.setState({ 'module': value })
            }
            if(value != 'Project'){
                this.props.investmentHandler();
            }
        });
    }

    render() {
        if(this.state.module == 'Project' && this.state.record_id.includes("x")){
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
