import  { Component } from 'react'
import {View, Text, StyleSheet,TouchableOpacity  } from 'react-native'
import { Button, Divider } from 'react-native-paper';
import {vtranslate,uploadAttachment} from '../../../Functions/Portal' ;
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import '../../../global.js' 
class Add extends Component {

    state = {
        singleFile : null,
        nameFile : '',
        email: '',
        password: '',
        disableButton : false
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

    }

    close = () => {
        this.props.investmentHandler();
    }

    uploadFile = async () => {
        if (this.state.singleFile != null) {
            
            this.setState({ disableButton : true });
            let email =this.state.email
            let pass = this.state.password;
            const fileToUpload = this.state.singleFile;
            const data = new FormData();
            data.append('file', {
                name: fileToUpload.name,
                type: fileToUpload.mimeType,
                uri: fileToUpload.uri
            });
            data.append("_operation", "SaveRecord");
            data.append("module", "Documents");
            data.append("parentId", "");
            data.append("filename", fileToUpload.name);
            data.append("username", email);
            data.append("password", pass);
    
    
            var result = await uploadAttachment(email,pass,data);
            
            this.setState({ disableButton : false });
            if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
                alert(vtranslate(result['error']['message']));
                return false;
            }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
                
                if(result['result']["record"] && result['result']["record"]['id']){
                    AsyncStorage.setItem('record_id', result['result']["record"]['id']);
                }
                AsyncStorage.setItem('module', "Documents");
                this.props.investmentHandler();
                return result['result'];
            } else {
                alert(JSON.stringify(result));
                return false;
            }
        } else {
            
            this.setState({ disableButton : false });
             // If no file selected the show alert
            alert(vtranslate('Please Select File first'));
        }
      };
    
      selectFile = async () => {
        // Opening Document Picker to select one file
        try {
          const res = await DocumentPicker.getDocumentAsync({});
          // Printing the log realted to the file
        //   alert(JSON.stringify(res.name));
    
          if(res.size && (res.size/1024/1024) > 25){
            alert(vtranslate("Maximum size for file upload is 25 MB"));
            this.setState({ singleFile : null });
            this.setState({ nameFile : '' });
            return ;
          }
        
          // Setting the state to show single file attributes
          this.setState({ singleFile : res });
          this.setState({ nameFile : res.name });
        } catch (err) {
            alert(err);
        }
        
        return ;
      };

    render() {
        return (
            <View style = {styles.Modal}>
                <Text style = {styles.HeaderText}>
                    {vtranslate('Add New Document')}
                </Text>
                
                <Divider style = {styles.Divider} /> 
                
                <View style={styles.mainBody}>
                    <Text style={styles.textStyle}>
                        {this.state.nameFile}
                    </Text>

                    <TouchableOpacity
                        style={styles.buttonStyle}
                        activeOpacity={0.5}
                        onPress={this.selectFile}>
                        <Text style={styles.buttonTextStyle}>{vtranslate('Browse')}</Text>
                    </TouchableOpacity>

                </View>

                <Divider style = {styles.Divider} /> 
                                 
                <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.state.disableButton? {} : this.uploadFile()}>
                    <Text style = {styles.submitButtonText}>{ this.state.disableButton ? vtranslate("Loading"): vtranslate("Save")}</Text>
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
    buttonStyle: {
        backgroundColor: '#307ecc',
        borderWidth: 0,
        color: '#FFFFFF',
        borderColor: '#307ecc',
        height: 40,
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 15,
    },
    buttonTextStyle: {
        color: '#FFFFFF',
        paddingVertical: 10,
        fontSize: 16,
    },
    textStyle: {
        fontSize: 15,
        marginTop: 16,
        marginLeft: 35,
        marginRight: 35,
        textAlign: 'center',
    },
});