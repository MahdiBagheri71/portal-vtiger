import  { Component } from 'react'
import {View, Text, StyleSheet  } from 'react-native'
import {fetchCompanyTitle,updateLang,vtranslate,fetchRecords} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';

import '../../../global.js' 
class Index extends Component {
    state = {
        company_detail:{},
        fetchRecords : {}
    }

    componentDidMount = async () => {
 
        await AsyncStorage.getItem('lang').then((value) => {
            if(value){
                updateLang(value);
                this.setState({ 'lang': value })
            }
        })
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
            await AsyncStorage.getItem('company_detail').then(async(value) => {
                var company_detail ='';
                try{
                    if(value){
                            company_detail = JSON.parse(value);
                            this.setState({ 'company_detail': company_detail });
                    }
                }catch(error){
                        company_detail ='';
                }
                if(company_detail == ''){
                        company_detail = await fetchCompanyTitle(email,pass);
                        if(company_detail){
                        AsyncStorage.setItem('company_detail', JSON.stringify(company_detail));
                        this.setState({ company_detail: company_detail });
                        }
                }
            });
            
            this.setState({ 'fetchRecords': await fetchRecords(email,pass,"HelpDesk", "HelpDesk", false, false , 0, 3, '', '') });
        }

    }
    render() {
        if(this.state.fetchRecords.hasOwnProperty('count')){
            return (
                <View >
                    <Text>
                        {JSON.stringify(this.state.fetchRecords)}
                    </Text>
                </View> 
            )
        }else{
            return (
                <View >
                    <Text>
                        
                    </Text>
                </View> 
            )
        }
    }
}

export default Index

const styles = StyleSheet.create({
    
});