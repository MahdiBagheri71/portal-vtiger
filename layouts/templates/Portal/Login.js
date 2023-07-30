import React, { Component } from 'react'
import {View, Text, TouchableOpacity, TextInput, StyleSheet,Modal,ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  Divider,Button } from 'react-native-paper';

import {color_bg,btn_success} from '../../../global.js'
import {vtranslate,updateLang,ping,fetchModules,forgotPassword} from '../../../Functions/Portal';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';


const data_lang = [
   { label: vtranslate('US English'), value: 'en_us' },
   { label: vtranslate('فارسی'), value: 'fa_ir' },
   { label: vtranslate('DE Deutsch'), value: 'de_de' },
   { label: vtranslate('PT Brasil'), value: 'pt_br' },
   { label: vtranslate('Francais'), value: 'fr_fr' },
   { label: vtranslate('Turkce Dil Paketi'), value: 'tr_tr' },
   { label: vtranslate('ES Spanish'), value: 'es_es' },
   { label: vtranslate('NL-Dutch'), value: 'nl_nl' },
   { label: vtranslate('简体中文'), value: 'zh_cn' },
   { label: vtranslate('繁體中文'), value: 'zh_tw' }
 ];

class Login extends Component {
   state = {
      email : '',
      password : '',
      lang:"",
      loginView : 'true',
      disableButton : false,
      visiblePass : false,
      emailPassword : ''
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
      if(this.state.disableButton){
         return;
     }
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
         this.state.disableButton = true;
         this.setState({ 'disableButton': true });
         let login = await ping(email,pass);
         if(login =='login :) '){
            AsyncStorage.setItem('email', email);
            AsyncStorage.setItem('password', pass);
            AsyncStorage.setItem('loginView', 'false');
            AsyncStorage.setItem('fetch_modules', '');
      
            AsyncStorage.setItem('module', "Home");
            // NativeModules.DevSettings.reload();
            this.setState({ loginView: 'false' });
            this.setState({ module: 'Home' });
            let fetch_modules = await fetchModules(email,pass);
            if(fetch_modules){
               AsyncStorage.setItem('fetch_modules', JSON.stringify(fetch_modules));
               this.setState({ loginView: 'false' });
               this.setState({ fetch_modules: fetch_modules });
               this.props.investmentHandler();
            }
         }
      

         this.setState({ 'disableButton': false });
         alert(login);
         // alert('ایمیل: ' + email + '\n پسورد: ' + pass)
      }
   }

   updateLanguage = (lang) => {
      updateLang(lang);
      AsyncStorage.setItem('lang', lang);
      this.setState({ lang: lang })
   }

   renderItem = (item) => {
      return (
        <View style={styles.item}>
          <Text style={styles.textItem}>{item.label}</Text>
          {item.value === this.state.lang && (
            <AntDesign
              style={styles.icon}
              color="black"
              name="Safety"
              size={20}
            />
          )}
        </View>
      );
    };

    componentWillUnmount() {
        this._isMounted = false;
    }

    changeForgotPasswordModal = async() => {
       await forgotPassword(this.state.emailPassword);
      this.setState({'visiblePass':false})
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
               <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={data_lang}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={vtranslate("Select item")}
                  searchPlaceholder={vtranslate("Search...")}
                  value={this.state.lang}
                  onChange={item => {
                     this.updateLanguage(item.value);
                  }}
                  renderLeftIcon={() => (
                     <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                  )}
                  renderItem={this.renderItem}
                  />
            </View>
            
            <TouchableOpacity
               onPress = {
                  () => this.setState({visiblePass:true})
               }>
               <Text style = {{color:'#31708f',padding : 10 , marginRight : 50}}> {vtranslate('Forgot Password?')} </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
               style = {styles.submitButtonLogin}
               onPress = {
                  () => this.login(this.state.email, this.state.password)
               }>
               <Text style = {styles.submitButtonTextLogin}> {this.state.disableButton ? vtranslate("Loading"):vtranslate('Sign in')} </Text>
            </TouchableOpacity>
            <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.visiblePass}>
                        <ScrollView>
                           <View>
                              <Text style={{fontSize : 25 , textAlign : 'center' , width:'100%' ,padding : 5}}>
                                 {vtranslate('Forgot Password')}
                              </Text>
                              <Divider style = {styles.Divider} /> 
                              <View>
                                 <Text style={{fontSize : 16 , textAlign : 'center' , width:'100%' ,padding : 5}}>{vtranslate('E-mail')}</Text>
                                 <TextInput style = {styles.inputTextArea}  onChangeText={(val) => this.setState({emailPassword : val})} />
                              </View>
                           </View>
                           <View>
                              {(this.state.emailPassword && !String(this.state.emailPassword)
                                            .toLowerCase()
                                            .match(
                                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                            ))?<Text  style={{fontSize : 25 , textAlign : 'center' , width:'100%' ,padding : 5 ,color:'#a94442'}}>
                                 {vtranslate('Enter a valid email address')}
                              </Text>:null}
                           </View>
                           {(this.state.emailPassword && String(this.state.emailPassword)
                                            .toLowerCase()
                                            .match(
                                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                            ))?
                              <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.changeForgotPasswordModal()}>
                                    <Text style = {styles.submitButtonTextCancel}>{ vtranslate("Submit")}</Text>
                              </Button>
                           :null}
                           <Button style = {styles.submitButtonCancel} color={"#000"} onPress={() => this.setState({'visiblePass':false})} ><Text style = {styles.submitButtonTextCancel}>{vtranslate("Cancel")}</Text></Button>
                        </ScrollView>
                     </Modal>
         </View>
      )
   }
}
export default Login

const styles = StyleSheet.create({
   containerLogin: {
      paddingTop: 23,
      marginTop : 15,
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
   },
   dropdown: {
      margin: 16,
      height: 50,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,

      elevation: 2,
   },
   icon: {
      marginRight: 5,
   },
   item: {
      padding: 17,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   textItem: {
      flex: 1,
      fontSize: 16,
   },
   placeholderStyle: {
      fontSize: 16,
   },
   selectedTextStyle: {
      fontSize: 16,
   },
   iconStyle: {
      width: 20,
      height: 20,
   },
   inputSearchStyle: {
      height: 40,
      fontSize: 16,
   },
   
   inputTextArea:{
      margin: 20,
      borderColor: '#ccc',
      borderWidth: 1,
      padding : 10
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

  submitButtonCancel : {
   borderRadius : 5,
   textAlign : 'center',
   width : 'auto',
   color : '#333',
   padding : 5,
   margin : 5,
   borderWidth :1 ,
   borderColor : '#adadad',
   marginBottom : 25
},
submitButtonTextCancel : {
   color : "#000"
}
})