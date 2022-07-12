import React, { Component } from 'react'
import {View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import {  Divider } from 'react-native-paper';
import '../../../global.js' 
import {vtranslate,updateLang,ping,fetchModules} from '../../../Functions/Portal' 
class Login extends Component {
   state = {
   }

   componentDidMount = () => {
      AsyncStorage.getItem('loginView').then((value) => {
         if(value == 'false'){
            this.setState({ 'loginView': 'false' })
            this.props.investmentHandler();
         }else{
            this.setState({ 'loginView': 'true' })
         }
      })

      AsyncStorage.getItem('lang').then((value) => {
         if(value){
            updateLang(value);
            this.setState({ 'lang': value })
         }
      })
   }

   handleEmail = (text) => {
      this.setState({ email: text })
   }

   handlePassword = (text) => {
      this.setState({ password: text })
   }

   login = async(email, pass) => {
      var error ='';
      if(email.trim() == ""){
         error = error + '\n'+ vtranslate('Enter your email address.')
      }
      if(pass.trim() == ""){
         error =  error + '\n'+ vtranslate('Enter your password.')
      }
      if(error.trim() != ""){
         alert(error)
      }else{
         var login = await ping(email,pass);
         if(login =='login :) '){
            AsyncStorage.setItem('email', email);
            AsyncStorage.setItem('password', pass);
            AsyncStorage.setItem('loginView', 'false');
            AsyncStorage.setItem('fetch_modules', '');
      
            AsyncStorage.setItem('module', "Home");
            // NativeModules.DevSettings.reload();
            this.setState({ loginView: 'false' });
            this.setState({ module: 'Home' });
            var fetch_modules = await fetchModules(email,pass);
            if(fetch_modules){
               AsyncStorage.setItem('fetch_modules', JSON.stringify(fetch_modules));
               this.setState({ loginView: 'false' });
               this.setState({ fetch_modules: fetch_modules });
               this.props.investmentHandler();
            }
         }
      

         alert(login);
         // alert('ایمیل: ' + email + '\n پسورد: ' + pass)
      }
   }

   updateLanguage = (lang) => {
      updateLang(lang);
      AsyncStorage.setItem('lang', lang);
      this.setState({ lang: lang })
   }

   render() {
      return (
         <View style = {styles.containerLogin}>
               
            <Text style = {styles.headerTextLogin}> {vtranslate('Please provide your portal credentials')}</Text>

            <Divider />
            <TextInput style = {styles.inputLogin}
               underlineColorAndroid = "transparent"
               placeholder = {vtranslate('E-mail')}
               autoCapitalize = "none"
               onChangeText = {this.handleEmail}/>
            
            <TextInput style = {styles.inputLogin}
               underlineColorAndroid = "transparent"
               placeholder = {vtranslate('Password')}
               autoCapitalize = "none"
               secureTextEntry={true}
               onChangeText = {this.handlePassword}/>
            
            <View  style = {styles.langViewLogin}>
               <Text style = {styles.langTextLogin}>{vtranslate('Language')}</Text>
               <Picker selectedValue = {this.state.lang} onValueChange = {this.updateLanguage}>
                  <Picker.Item label = {vtranslate('US English')} value = "en_us" />
                  <Picker.Item label = {vtranslate('فارسی')} value = "fa_ir" />
                  <Picker.Item label = {vtranslate('DE Deutsch')} value = "de_de" />
                  <Picker.Item label = {vtranslate('PT Brasil')} value = "pt_br" />
                  <Picker.Item label = {vtranslate('Francais')} value = "fr_fr" />
                  <Picker.Item label = {vtranslate('Turkce Dil Paketi')} value = "tr_tr" />
                  <Picker.Item label = {vtranslate('ES Spanish')} value = "es_es" />
                  <Picker.Item label = {vtranslate('NL-Dutch')} value = "nl_nl" />
                  <Picker.Item label = {vtranslate('简体中文')} value = "zh_cn" />
                  <Picker.Item label = {vtranslate('繁體中文')} value = "zh_tw" />
               </Picker>
            </View>
            
            <TouchableOpacity
               style = {styles.submitButtonLogin}
               onPress = {
                  () => this.login(this.state.email, this.state.password)
               }>
               <Text style = {styles.submitButtonTextLogin}> {vtranslate('Sign in')} </Text>
            </TouchableOpacity>
         </View>
      )
   }
}
export default Login

const styles = StyleSheet.create({
   containerLogin: {
      paddingTop: 23,
      marginTop : 5,
   },
   headerTextLogin : {
      textAlign :  'center',
      fontSize : 18,
      padding : 15
   },
   langTextLogin:{
      textAlign :  'center',
      fontSize : 14,
      paddingBottom : 15
   },
   langViewLogin :{
      padding: 23,
   },
   inputLogin: {
      textAlign :  'center',
      margin: 20,
      height: 40,
      borderColor: color_bg,
      borderWidth: 1,
      padding : 10
   },
   submitButtonLogin: {
      backgroundColor: btn_success,
      padding: 10,
      margin: 15,
      height: 40
   },
   submitButtonTextLogin:{
      color: 'white',
      textAlign: 'center'
   }
})