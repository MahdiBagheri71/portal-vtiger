import  { Component } from 'react'
import {View, Text, StyleSheet  } from 'react-native'
import { Button, Divider } from 'react-native-paper';
import {vtranslate,describeModule} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';

import '../../../global.js' 
class Add extends Component {

    state = {
        email: '',
        password: '',
        disableButton : false,
        describeModule : {}
    }
    

    componentDidMount = async () => {

        await AsyncStorage.getItem('email').then((value) => {
            if(value){
                this.setState({ 'email': value })
            }
        })
        await AsyncStorage.getItem('password').then((value) => {
            if(value){
                this.setState({ 'password': value })
            }
        })

        let email =this.state.email
        let pass = this.state.password;
        if(email && pass ){
            this.setState({ 'describeModule': await describeModule(email,pass,"HelpDesk") });
        }

    }
    describeModuleShow = () =>{
        var describeModule = this.state.describeModule;
        if(describeModule['describe'] && describeModule['describe']['fields']){
            alert(JSON.stringify(describeModule['describe'] ))
        }
        return null;
    }

    close = () => {
        this.props.investmentHandler();
    }

    render() {
        return (
            <View style = {styles.Modal}>
                <Text style = {styles.HeaderText}>
                    {vtranslate('Add New Ticket')}
                </Text>
                
                <Divider style = {styles.Divider} /> 
                
                <View style={styles.mainBody}>
                    
                    {this.describeModuleShow()}

                </View>

                <Divider style = {styles.Divider} /> 
                                 
                <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.state.disableButton? {} : this.close()}>
                    <Text style = {styles.submitButtonText}>{vtranslate("Save")}</Text>
                </Button>
                <Button style = {styles.submitButtonCancel} color={"#000"} onPress={() => this.close()}><Text style = {styles.submitButtonText}>{vtranslate("Cancel")}</Text></Button>
            </View> 
        )
    }
}

export default Add

const styles = StyleSheet.create({
    Modal:{
        padding : 15,
        marginTop : 25
    },
    HeaderText:{
        textAlign : 'center',
        color : "#000",
        fontSize : 20
    },
    Divider:{
       padding : 1 ,
       margin : 5
    },
    submitButtonCancel : {
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#333',
        padding : 5,
        margin : 5,
        borderWidth :1 ,
        borderColor : '#adadad'
    },
    TextStatusSave:{
        backgroundColor :'#5cb85c',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5
    },
    mainBody: {
        justifyContent: 'center',
        padding: 25,
        color : '#000'
    },
});