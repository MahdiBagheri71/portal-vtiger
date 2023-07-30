import React, { Component } from 'react'
import { Modal, Text,View, StyleSheet,Image,ScrollView ,Dimensions,TextInput} from 'react-native'

import {color_bg} from '../../global.js'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {vtranslate,updateLang,fetchModules,changePassword,searchRecords} from '../../Functions/Portal' ;
import { Appbar,Searchbar } from 'react-native-paper';


import Home from './Portal/Home.js'
import HelpDesk from './HelpDesk/Index'
import Project from './Project/Index'
import Faq from './Faq/List'
import Documents from './Documents/Index'
import Login from './Portal/Login.js'
import IndexPortal from './Portal/Index'
import Footer from './Footer.js'
import Profile from './Portal/Profile';

import { Button, Divider, Provider } from 'react-native-paper';

class Header extends Component {
   state = {
      email: '',
      password: '',
      lang: 'en_us',
      module: 'null',
      fetch_modules:{},
      company_detail :{},
      modules_header:{},
      visible : false ,
      visibleSearch : false,
      header_no_show : ['Contacts','Accounts','ProjectTask','ProjectMilestone'],
      loginView : 'false',
      heightHome : Dimensions.get('window').height-158,
      visibleChangePass : false,
      currentPassword : '',
      newPassword : '',
      confirmPassword : '',
      searchQuery : '',
      searchRecordsAll : {},
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

   openSearch = ()=>{
      this.setState({ visibleSearch: true })
   }

   setModule = async(module) => {      
      
      this.setState({ module: 'null' });
      
      await AsyncStorage.setItem('module', module);
      
      this.setState({ visible: false });
      
      await AsyncStorage.setItem('record_id', 'false');
      
      await AsyncStorage.setItem('parent_id', '');

      this.setState({ module: module });
   }

   setModuleRecord = async(record_id,module) => {      
      
      this.setState({ module: 'null' });
      
      await AsyncStorage.setItem('module', module);
      
      this.setState({ 'visibleSearch':false,'searchQuery' : '','searchRecordsAll':{} });
      
      await AsyncStorage.setItem('record_id', record_id);
      
      await AsyncStorage.setItem('parent_id', '');

      this.setState({ module: module });
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
            let email =this.state.email
            let pass = this.state.password;
            fetch_modules = await fetchModules(email,pass);
            if(fetch_modules){
               AsyncStorage.setItem('fetch_modules', JSON.stringify(fetch_modules));
               
               AsyncStorage.setItem('email', email);
               AsyncStorage.setItem('password', pass);
               AsyncStorage.setItem('loginView', "false");
               this.setState({ loginView: 'false' });
               this.setState({ currentPassword: '' });
               this.setState({ newPassword: '' });
               this.setState({ confirmPassword: '' });
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
      // return <Text> {module}</Text>;
      
      switch(module) {
         case 'HelpDesk':
            return <HelpDesk investmentHandler={this.loadModule}/>;
         case 'Project':
            return <Project investmentHandler={this.loadModule}/>;
         case 'Faq':
            return <Faq investmentHandler={this.loadModule}/>;
         case 'Documents':
            return <Documents investmentHandler={this.loadModule}/>;
         case 'Home':
            return <Home investmentHandler={this.loadModule}/>;
         case 'Profile':
            return <Profile investmentHandler={this.loadModule}/>;
         case 'null':
               return null;
         default:
           return <IndexPortal investmentHandler={this.loadModule}/>;
      }
   }

   componentWillUnmount() {
       this._isMounted = false;
   }

   changePassWordModal = async() => {
      
      let email =this.state.email
      let pass = this.state.password;
      var res = await changePassword(email,pass,this.state.currentPassword,this.state.newPassword);
      if(res){
         await this.setState({'visibleChangePass':false});
         alert(vtranslate(res));
         await this.logout();
      }
   }

   onChangeSearch = async (query ) => {
      this.setState({'searchQuery':query,'searchRecordsAll':{}});

      if(query.length > 2){
         let email =this.state.email
         let pass = this.state.password;
         var res = await searchRecords(email,pass,this.state.searchQuery);
         if(res){
            this.setState({'searchRecordsAll':res});
         }
      }

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
                     <Appbar.Action icon="magnify"  onPress={this.openSearch}/>
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
                                 <Button style = {this.state.module == 'Profile'?styles.selectSubmitButton:styles.submitButton} onPress={() => this.setModule('Profile')} ><Text style = {this.state.module == 'Profile'?styles.selectButtonText: styles.submitButtonText}>{vtranslate("Profile")}</Text></Button>
                                 <Button style = {styles.submitButton} onPress={() => this.setState({'visibleChangePass':true})} ><Text style = {styles.submitButtonText}>{vtranslate("Change Password")}</Text></Button>
                                 <Button style = {styles.submitButton} onPress={() => this.logout()}><Text style = {styles.submitButtonText}>{vtranslate("Logout")}</Text></Button>
                                 <Divider style = {styles.Divider} /> 
                                 
                                 <Button style = {styles.submitButton} onPress={() => this.closeMenu()}><Text style = {styles.submitButtonText}>{vtranslate("Cancel")}</Text></Button>
                              </View>
                        </ScrollView>
                     </Modal>
                     <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.visibleChangePass}>
                        <ScrollView>
                           <View>
                              <Text style={{fontSize : 25 , textAlign : 'center' , width:'100%' ,padding : 5}}>
                                 {vtranslate('Change Password')}
                              </Text>
                              <Divider style = {styles.Divider} /> 
                              <View>
                                 <Text style={{fontSize : 16 , textAlign : 'center' , width:'100%' ,padding : 5}}>{vtranslate('Current Password')}</Text>
                                 <TextInput style = {styles.inputTextArea} secureTextEntry={true}  onChangeText={(val) => this.setState({currentPassword : val})} />
                              </View>
                              <View>
                                 <Text style={{fontSize : 16 , textAlign : 'center' , width:'100%' ,padding : 5}}>{vtranslate('New Password')}</Text>
                                 <TextInput style = {styles.inputTextArea} secureTextEntry={true}  onChangeText={(val) => this.setState({newPassword : val})} />
                              </View>
                              <View>
                                 <Text style={{fontSize : 16 , textAlign : 'center' , width:'100%' ,padding : 5}}>{vtranslate('Confirm Password')}</Text>
                                 <TextInput style = {styles.inputTextArea} secureTextEntry={true}  onChangeText={(val) => this.setState({confirmPassword : val})} />
                              </View>
                           </View>
                           <View>
                              {(this.state.currentPassword && this.state.currentPassword == this.state.newPassword)?<Text  style={{fontSize : 25 , textAlign : 'center' , width:'100%' ,padding : 5 ,color:'#a94442'}}>
                                 {vtranslate('New password cannot be same as current password.')}
                              </Text>:null}
                              {(this.state.newPassword && this.state.newPassword != this.state.confirmPassword)?<Text  style={{fontSize : 25 , textAlign : 'center' , width:'100%' ,padding : 5 ,color:'#a94442'}}>
                                 {vtranslate('Re-confirm your password')}
                              </Text>:null}
                           </View>
                           {(this.state.currentPassword.length>0 && this.state.newPassword.length>0 && this.state.confirmPassword.length>0
                              && this.state.currentPassword != this.state.newPassword && this.state.newPassword == this.state.confirmPassword)?
                              <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.changePassWordModal()}>
                                    <Text style = {styles.submitButtonTextCancel}>{ vtranslate("Save")}</Text>
                              </Button>
                           :null}
                           <Button style = {styles.submitButtonCancel} color={"#000"} onPress={() => this.setState({'visibleChangePass':false})} ><Text style = {styles.submitButtonTextCancel}>{vtranslate("Cancel")}</Text></Button>
                        </ScrollView>
                     </Modal>
                     
                     <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.visibleSearch}>
                        <ScrollView>
                           <View>
                              <Text style={{fontSize : 25 , textAlign : 'center' , width:'100%' ,padding : 5}}>
                                 {vtranslate('Search')}
                              </Text>
                              <Divider style = {styles.Divider} /> 
                              <Searchbar
                                 style = {styles.Searchbar}
                                 placeholder={vtranslate('Search')}
                                 onChangeText={this.onChangeSearch}
                                 value={this.state.searchQuery}
                              />
                              <Divider style = {styles.Divider} /> 
                              <View>
                                 {Object.entries(this.state.searchRecordsAll).map((row) => {
                                       let module = row[1].uiLabel?row[1].uiLabel:false;
                                       let records = row[1];
                                       if (module){
                                          return (
                                             Object.entries(records).map((record) => {
                                                if(Number(record[0])>= 0){
                                                   return (
                                                      <View key={record[0]} style = {styles.SearchRecord}>
                                                         <Button color='#000' onPress={()=>this.setModuleRecord(record[1].id,row[0])}  style = {styles.SearchRecordBody}>
                                                            <Text style = {styles.SearchRecordModule}>
                                                                 {"    "+module+"   "}  
                                                            </Text>
                                                         </Button>
                                                         <Button color='#000' onPress={()=>this.setModuleRecord(record[1].id,row[0])}  style = {styles.SearchRecordBody}>
                                                            {"    "+record[1].label+"   "}
                                                         </Button>
                                                      </View>
                                                   );
                                                }
                                             })
                                          )
                                       }
                                       return null;
                                    }
                                 )}  
                              </View>
                           </View>
                           <Button style = {styles.submitButtonCancel} color={"#000"} onPress={() => this.setState({'visibleSearch':false,'searchQuery' : '','searchRecordsAll':{}})} ><Text style = {styles.submitButtonTextCancel}>{vtranslate("Cancel")}</Text></Button>
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
      }else if(this.state.loginView == 'true'){
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
      }else{
         return null;
      }
   }
}
export default Header

const styles = StyleSheet.create({
   Searchbar :{
      marginRight : 25,
      marginLeft : 25
   },
   SearchRecord : {
      width : '90%',
      marginRight : 25,
      marginLeft : 25,
      padding : 10,
      borderBottomWidth : 5,
      borderBottomColor : '#428bca',
   },
   SearchRecordBody :{
      marginRight : 25,
      marginLeft : 25,
      backgroundColor : '#ededed',
      textAlign : 'center'
   },
   SearchRecordModule :{
      color : '#fff',
      backgroundColor : '#5bc0de',
      textAlign : 'center'
   },
   container: {
      // paddingTop: 23,
      // marginTop : 40,
      backgroundColor : color_bg,
      height : 70,
      left : 0 ,
      right : 0,
      top : 0
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