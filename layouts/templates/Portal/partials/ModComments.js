import  { Component } from 'react'
import {View, Text,Dimensions,StyleSheet,TextInput } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator,Button } from 'react-native-paper';
import {updateLang,vtranslate,fetchRelatedRecords,downloadFile,addComment,fetchRecord} from '../../../../Functions/Portal' ;
import * as FileSystem from 'expo-file-system';
const { StorageAccessFramework } = FileSystem;

class ModComments extends Component {
    state = {
        email : '',
        password : '',
        record_id : 'false',
        comments : false ,
        module : '',
        relatedModule : 'ModComments',
        commentcontent : '',
        disableButton : false,
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
        
        await AsyncStorage.getItem('module').then((value) => {
            if(value){
                this.setState({ 'module': value })
            }
        })

        let email =this.state.email
        let pass = this.state.password;
        let record_id = this.state.record_id;
        if(email && pass && record_id){
            this.setState({ 'comments': await fetchRelatedRecords(email,pass,this.state.relatedModule,this.state.relatedModule,record_id,0, 0,50,this.state.module)});
            this.setState({ 'record': await fetchRecord(email,pass,record_id,this.state.module,'')});
        }
    }

    loadRecord = () => {
        AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    downloadFileMe = async (fileString, fileName ,fileType) => {
        try {
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                alert("Not Permissions");
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

    downloadCommentFile = async(module, commentId, attachmentId) => {
        let email =this.state.email
        let pass = this.state.password;
        var  file = await downloadFile(email,pass,module, commentId, 0, 0, attachmentId);
        if(file && file.filecontents){
            this.downloadFileMe(file.filecontents,file.filename,file.filetype);
        }
	}

    sendComment = async()=>{
        this.setState({'disableButton' : true});
        if(this.state.commentcontent){
            let email =this.state.email
            let pass = this.state.password;
            let record_id = this.state.record_id;
            var values = {"commentcontent":this.state.commentcontent,"parentId":"","related_to":record_id}
            var commen  = await addComment(email,pass,JSON.stringify(values), '');
            if(commen){
                this.setState({"commentcontent":""});
                this.setState({ 'comments': await fetchRelatedRecords(email,pass,this.state.relatedModule,this.state.relatedModule,record_id,0, 0,50,this.state.module)});
            }
            this.setState({'disableButton' : false});
        }else{
            this.setState({'disableButton' : false});
            alert(vtranslate('The field "{0}" is mandatory.').replace('{0}','commentcontent'));
        }
    }

    render() {
        if(this.state.comments){
            return (
                <View style={styles.commentContent}>
                    {(this.state.record['record'] && this.state.record['record'].ticketstatus != 'Closed')?
                        <View>
                            <TextInput multiline={true} style = {styles.inputTextArea} placeholder={vtranslate('Add your comment here')} onChangeText={(val) => this.setState({commentcontent : val})} value={this.state.commentcontent}/>
                            <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.sendComment()}>
                                <Text style = {styles.submitButtonText}>{ this.state.disableButton ? vtranslate("Loading"): vtranslate("Submit")}</Text>
                            </Button>
                        </View>
                    :null}
                    {this.state.comments.map((comment ,key) => {
                        return(
                            <View style={styles.commentRecord} key={key}>
                                <View style={styles.commentBullet}></View>
                                <View>
                                    <Text>
                                        <Text style={styles.creator}>
                                            {(comment.creator.label!=='' && comment.customer.label)?comment.customer.label:comment.creator.label}
                                        </Text>
                                        <Text style={styles.createdtime}>
                                            {"   "+comment.createdtime}
                                        </Text>
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.commentcontent}>
                                        {comment.commentcontent}
                                    </Text>
                                    {comment.attachments.map((attachment ,key2) => {
                                        if(attachment.filename){
                                            return(
                                                <Button key={key2} icon="tray-arrow-down" style={styles.attachment} mode="text" color="#428bca" onPress={() => this.downloadCommentFile('ModComments',comment.id,attachment.attachmentid)}>
                                                    {attachment.filename}
                                                </Button>
                                            )
                                        }
                                    })}
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

export default ModComments

const styles = StyleSheet.create({
    commentContent : {
        width: Dimensions.get('window').width-20 ,
        padding : 3 ,
        borderBottomWidth : 1 ,
        borderColor : '#eee',
        margin : 10
    },
    commentRecord : {
        padding : 10,
        margin : 10
    },
    commentBullet:{
        width: Dimensions.get('window').width-45 ,
        backgroundColor : '#428bca',
        padding : 3,
        marginBottom : 8
    },
    creator :{
        color : '#009FDA'
    },
    createdtime : {
        color : '#aaa',
        fontSize : 13
    },
    commentcontent : {
        padding : 5,
        margin : 5 ,
        fontSize : 17
    },
    attachment : {
        fontSize : 12
    },
    inputTextArea:{
        width: Dimensions.get('window').width-45 ,
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
        margin : 5,
        marginLeft : 25
    },
    submitButtonText : {
        color : "#fff"
    }
})