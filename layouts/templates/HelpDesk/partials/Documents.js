import  { Component } from 'react'
import {View, Text,Dimensions,StyleSheet,Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator,Button } from 'react-native-paper';
import {updateLang,vtranslate,fetchRelatedRecords,downloadFile,fetchRecord} from '../../../../Functions/Portal' ;
import * as FileSystem from 'expo-file-system';
const { StorageAccessFramework } = FileSystem;

import DocumentsAdd from './../../Documents/Add.js'

class Documents extends Component {
    state = {
        email : '',
        password : '',
        record_id : 'false',
        documents : false ,
        module : 'HelpDesk',
        relatedModule : 'Documents',
        show_documens_add : false,
        record : {}
    }

    componentDidMount = async () => {
        await AsyncStorage.getItem('lang').then((value) => {
            if(value){
                updateLang(value);
                this.setState({ 'lang': value })
            }
        })
        await AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
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
        let record_id = this.state.record_id;
        if(email && pass && record_id){
            this.setState({ 'documents': await fetchRelatedRecords(email,pass,this.state.relatedModule,this.state.relatedModule,record_id,0, 0,50,this.state.module)});
            this.setState({ 'record': await fetchRecord(email,pass,record_id,this.state.module,'')});
        }
    }

    componentWillUnmount() {
         this._isMounted = false;
    }
    
    downloadFileMe = async (fileString, fileName ,fileType) => {
        try {
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                alert(vtranslate("Not Permissions"));
                return;
            }
    
            try {
                await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, fileType)
                .then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, fileString, { encoding: FileSystem.EncodingType.Base64 });
                    alert(vtranslate('Downloaded Successfully'));
                })
                .catch((e) => {
                    alert(e)
                });
            } catch (e) {
                alert(e)
                throw new Error(e);
            }
        
        } catch (err) {
            alert(err)
        }
    }

    downloadDocumentFile = async(id) => {
        let email =this.state.email
        let pass = this.state.password;
        var  file = await downloadFile(email,pass,'Documents', id, 0, 0, '');
        if(file && file.filecontents){
            this.downloadFileMe(file.filecontents,file.filename,file.filetype);
        }else{
            alert(vtranslate("No file!"))
        }
	}

    loadAddModal = async() => {
        let email =this.state.email
        let pass = this.state.password;
        let record_id = this.state.record_id;
        if(email && pass && record_id){
            this.setState({ 'documents': await fetchRelatedRecords(email,pass,this.state.relatedModule,this.state.relatedModule,record_id,0, 0,50,this.state.module)});
        }
        this.setState({ show_documens_add : false });
    }

    loadAddModule = () => {
        AsyncStorage.setItem('parentIdDocuments', this.state.record_id);
        this.setState({ show_documens_add : true });
    }

    render() {
        
        if(this.state.documents){
            return (
                <View style={styles.documentsContent}>
                    {(this.state.record['record'] && this.state.record['record'].ticketstatus != 'Closed')?
                        <View>
                            <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.loadAddModule()}>
                                <Text style = {styles.submitButtonText}>{  vtranslate("Attach document to this ticket")}</Text>
                            </Button>
                            
                            <Modal animationType = {"slide"} transparent = {false}
                                visible = {this.state.show_documens_add}>
                                    <DocumentsAdd investmentHandler={this.loadAddModal}/>
                            </Modal>
                        </View>
                    :null}
                    {this.state.documents.map((document ,key) => {
                        return(
                            <View style={styles.documentsRecord} key={key}>
                                <View style={styles.documentsBullet}></View>
                                <View>
                                    <Text>
                                        <Text style={styles.creator}>
                                            {document.assigned_user_id.label}
                                        </Text>
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.documentscontent}>
                                        {document.notes_title}
                                    </Text>
                                    <Button icon="tray-arrow-down" style={styles.attachment} mode="text" color="#428bca" onPress={() => this.downloadDocumentFile(document.id)}>
                                        {document.filename}
                                    </Button>
                                </View>
                            </View>
                        )
                    })}
                </View> 
            )
        }else{
            return (
                <View style ={{width: Dimensions.get('window').width ,textAlign:'center',padding : 25}}>
                    <Text style ={{textAlign:'center',padding : 25}}>{vtranslate("Loading")}</Text>
                    <ActivityIndicator style ={{textAlign:'center',padding : 25}} animating={true} color='#000' />
                </View> 
            )
        }
    }
}

export default Documents

const styles = StyleSheet.create({
    documentsContent : {
        width: Dimensions.get('window').width-20 ,
        padding : 3 ,
        borderBottomWidth : 1 ,
        borderColor : '#eee',
        margin : 10
    },
    documentsRecord : {
        padding : 10,
        margin : 10
    },
    documentsBullet:{
        width: Dimensions.get('window').width-45 ,
        backgroundColor : '#428bca',
        padding : 3,
        marginBottom : 8
    },
    creator :{
        color : '#009FDA'
    },
    documentscontent : {
        padding : 5,
        margin : 5 ,
        fontSize : 17
    },
    attachment : {
        fontSize : 12
    },
    TextStatusSave:{
        backgroundColor :'#5cb85c',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5,
        marginLeft : 25
    },
    submitButtonText : {
        color : "#fff"
    }
})