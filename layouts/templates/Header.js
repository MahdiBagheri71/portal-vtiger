import React, { Component } from 'react'
import { Modal, Text,View, StyleSheet,Image,ScrollView ,Dimensions} from 'react-native'
import '../../global.js' 
import AsyncStorage from '@react-native-async-storage/async-storage';
import {vtranslate,updateLang,fetchModules} from '../../Functions/Portal' ;
import { Appbar } from 'react-native-paper';


import Home from './Portal/Home.js'
import HelpDesk from './HelpDesk/Index'
import Login from './Portal/Login.js'
import Footer from './Footer.js'

import { Button, Divider, Provider } from 'react-native-paper';

class Header extends Component {
   state = {
      email: '',
      password: '',
      lang: 'en_us',
      module: 'Home',
      fetch_modules:{},
      company_detail :{},
      modules_header:{},
      visible : false ,
      header_no_show : ['Contacts','Accounts','ProjectTask','ProjectMilestone'],
      loginView : 'false',
      heightHome : Dimensions.get('window').height-158
   }

   componentDidMount = async () => {

         await AsyncStorage.getItem('loginView').then((value) => this.setState({ 'loginView': value == 'false'?'false':'true' }))
      
         await AsyncStorage.getItem('lang').then((value) => {
            if(value){
                updateLang(value);
                this.setState({ 'lang': value })
            }
        })
        await AsyncStorage.getItem('module').then((value) => {
            if(value){
                this.setState({ 'module': value })
            }else{
                AsyncStorage.setItem('module', 'Home');
                this.setState({ 'module': 'Home' })
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
            await AsyncStorage.getItem('fetch_modules').then(async(value) => {
                var fetch_modules ='';
                try{
                    if(value){
                        fetch_modules = JSON.parse(value);
                        this.setState({ 'fetch_modules': fetch_modules });
                    }
                }catch(error){
                    fetch_modules ='';
                }
                if(fetch_modules == ''){
                     fetch_modules = await fetchModules(email,pass);
                     if(fetch_modules){
                        AsyncStorage.setItem('fetch_modules', JSON.stringify(fetch_modules));
                        
                        AsyncStorage.setItem('email', email);
                        AsyncStorage.setItem('password', pass);
                        AsyncStorage.setItem('loginView', "false");
                        this.setState({ loginView: 'false' });
                        this.setState({ fetch_modules: fetch_modules });
                     }else{
                        this.logout();
                     }
                }

            
            })
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
        }
    
    }

   logout = () => {
      AsyncStorage.setItem('email', '');
      AsyncStorage.setItem('password', '');
      AsyncStorage.setItem('loginView', "true");
      AsyncStorage.setItem('fetch_modules', '');
      AsyncStorage.setItem('module', 'Login');
      this.setState({ module: 'Login' });
      
      
      this.setState({ email: '' })
      this.setState({ password: '' })
      this.setState({ loginView: 'true' });
      this.setState({ visible: false });
      this.setState({ fetch_modules: {} });
   }

   openMenu = ()=>{
      this.setState({ visible: true })
   }

   closeMenu = ()=>{
      this.setState({ visible: false })
   }

   setModule = (module) => {
      this.setState({ module: module })
      
      AsyncStorage.setItem('module', module);
      
      this.setState({ visible: false });
      
      AsyncStorage.setItem('record_id', 'false');
   }

   
   handleEmail = (text) => {
      this.setState({ email: text })
   }

   handlePassword = (text) => {
      this.setState({ password: text })
   }

   loadModule = () => {
      
      AsyncStorage.getItem('module').then((value) => {
         if(value){
             this.setState({ 'module': value })
         }else{
             AsyncStorage.setItem('module', 'Home');
             this.setState({ 'module': 'Home' })
         }
     });

   }

   loadLogin = () => {
      
      AsyncStorage.getItem('loginView').then((value) => this.setState({ 'loginView': value == 'false'?'false':'true' }));
      AsyncStorage.getItem('fetch_modules').then(async(value) => {
         var fetch_modules ='';
         try{
             if(value){
                 fetch_modules = JSON.parse(value);
                 this.setState({ 'fetch_modules': fetch_modules });
             }
         }catch(error){
             fetch_modules ='';
         }
         if(fetch_modules == ''){
              fetch_modules = await fetchModules(email,pass);
              if(fetch_modules){
                 AsyncStorage.setItem('fetch_modules', JSON.stringify(fetch_modules));
                 
                 AsyncStorage.setItem('email', email);
                 AsyncStorage.setItem('password', pass);
                 AsyncStorage.setItem('loginView', "false");
                 this.setState({ loginView: 'false' });
                 this.setState({ fetch_modules: fetch_modules });
              }else{
                 this.logout();
              }
         }


     })

      AsyncStorage.getItem('module').then((value) => {
         if(value){
            this.setState({ 'module': value })
         }else{
            AsyncStorage.setItem('module', 'Home');
            this.setState({ 'module': 'Home' })
         }
      });

   }
   
   loadPage = (module) =>{
      
      switch(module) {
         case 'HelpDesk':
           return <HelpDesk investmentHandler={this.loadModule}/>;
         case 'Documents':
             return <Text> Documents</Text>;
         default:
           return <Home investmentHandler={this.loadModule}/>;
      }
   }

   componentWillUnmount() {
       this._isMounted = false;
   }
    
   render() {
      if (this.state.loginView == 'false' && this.state.fetch_modules['modules'] ){
         // alert(JSON.stringify(this.state.fetch_modules['modules']['types']))
         return (
            <View>
               <View>
                  <Appbar.Header style = {styles.container}>
                     <Image style ={styles.imagHeader} source={require('../../assets/favicon.png')} />
                     <Appbar.Content title={this.state.company_detail['organizationname']} />
                     <Appbar.Action icon="magnify"/>
                     <Appbar.Action icon="dots-vertical" onPress={this.openMenu} />
                  </Appbar.Header>
                  {/* <Image style ={styles.imagHeader} source={require('../../assets/favicon.png')} /> */}
                  <Provider>
                     {/* <View style = {styles.menuHeader}>
                        <Button color="#fff" icon="menu" onPress={this.openMenu} ></Button>
                     </View>    */}
                  
                     <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.visible}>
                        <ScrollView>
                              <View style ={styles.menuScroll}>
                                 <Button style = {this.state.module == 'Home'?styles.selectSubmitButton:styles.submitButton} onPress={() => this.setModule('Home')} ><Text style = {this.state.module == 'Home'?styles.selectButtonText: styles.submitButtonText}>{vtranslate("Home")}</Text></Button>
                                 {Object.entries(this.state.fetch_modules['modules']['information']).sort((a, b) => Number(a[1].order) > Number(b[1].order) ? 1 : -1).map((row,index3 ) => {
                                       if (!this.state.header_no_show.includes(row[0])){
                                          return (
                                             <Button key={row[0]} onPress={() => this.setModule(row[0])} style = {this.state.module == row[0]?styles.selectSubmitButton:styles.submitButton}><Text style = {this.state.module == row[0]?styles.selectButtonText: styles.submitButtonText}>{row[1]['uiLabel']}</Text></Button>
                                          )
                                       }
                                       return null;
                                    }
                                 )}   
                                 <Divider style = {styles.Divider} />
                                 <Button style = {styles.submitButton} onPress={() => {}} ><Text style = {styles.submitButtonText}>{vtranslate("Profile")}</Text></Button>
                                 <Button style = {styles.submitButton} onPress={() => {}} ><Text style = {styles.submitButtonText}>{vtranslate("Change Password")}</Text></Button>
                                 <Button style = {styles.submitButton} onPress={() => this.logout()}><Text style = {styles.submitButtonText}>{vtranslate("Logout")}</Text></Button>
                                 <Divider style = {styles.Divider} /> 
                                 
                                 <Button style = {styles.submitButton} onPress={() => this.closeMenu()}><Text style = {styles.submitButtonText}>{vtranslate("Cancel")}</Text></Button>
                              </View>
                        </ScrollView>
                     </Modal>
                  </Provider>
               </View>

                  
               <ScrollView style={{ height : this.state.heightHome ,maxHeight: this.state.heightHome ,marginTop : 15 , paddingBottom : 25 }}>
                  {this.loadPage(this.state.module)}
               </ScrollView>

               <Footer/>
            </View>
         )
      }else{
         return (
            <View>
               <Appbar.Header style = {styles.container}>
                  {/* <Appbar.Content title={this.state.company_detail['organizationname']} />*/}
                  <Image style ={styles.imagHeader} source={require('../../assets/favicon.png')} />
                  {/* <Appbar.Action icon="magnify"/> */}
                  {/* <Appbar.Action icon="dots-vertical" onPress={this.openMenu} /> */}
               </Appbar.Header>

               <ScrollView style={{ height : this.state.heightHome , maxHeight: this.state.heightHome , marginTop : 15 , paddingBottom : 25 }}>
                  <Login investmentHandler={this.loadLogin}/>
               </ScrollView>

               <Footer/>
            </View>
               
         )
      }
   }
}
export default Header

const styles = StyleSheet.create({
   container: {
      // paddingTop: 23,
      // marginTop : 40,
      backgroundColor : color_bg,
      height : 70,
      left : 0 ,
      right : 0,
      top : 0
   },
   imagHeader :{
      width : 180,
      height : 42,
      marginLeft : 15
   },
   menuHeader:{
      marginTop: -40,
      position : 'absolute',
      right : 0
   },
   menuScroll:{
      padding: 50,
   },
   menu :{
      flex: 1,
      height: 500,
      overflow : 'scroll'
   },
   submitButton: {
      backgroundColor: color_bg,
      padding: 5,
      margin: 5,
      borderBottomWidth : 5,
      borderColor: '#428bca'
   },
   selectSubmitButton: {
      backgroundColor: color_bg,
      padding: 5,
      margin: 5,
      borderBottomWidth : 5,
      borderColor: '#d9534f'
   },
   submitButtonText:{
      color: '#999',
      textAlign: 'center'
   },
   selectButtonText :{
      color: '#fff',
      textAlign: 'center'
   },
   Divider:{
      padding : 1 ,
      margin : 25
   }
})