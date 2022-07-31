import  { Component } from 'react'
import {View, Text,Dimensions,StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import {updateLang,vtranslate,fetchRelatedRecords} from '../../../../Functions/Portal' ;

class ProjectTask extends Component {
    state = {
        email : '',
        password : '',
        record_id : 'false',
        records : false ,
        module : '',
        relatedModule : 'ProjectTask',
        relatedModuleLabel : 'Project Tasks'
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
            this.setState({ 'records': await fetchRelatedRecords(email,pass,this.state.relatedModule,this.state.relatedModuleLabel,record_id,0, 0,50,this.state.module)});
        }
    }

    componentWillUnmount() {
         this._isMounted = false;
    }
    
    

    setModuleID = (record_id) => {
        AsyncStorage.setItem( 'module', 'ProjectTask' );
        AsyncStorage.setItem('record_id', record_id);
        AsyncStorage.setItem('parent_id', this.state.record_id);
        this.props.investmentHandler();
    }

    render() {
        
        if(this.state.records){
            return (
                <View style={styles.Content}>
                    {this.state.records.map((record ,key) => {
                        return(
                            <View style={styles.Record} key={key}>
                                <View style={styles.Bullet}></View>
                                <View>
                                    <Text>
                                        <Text style={styles.creator} onPress={() => this.setModuleID(record['id'])}>
                                            {record.assigned_user_id.label}
                                        </Text>
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.content} onPress={() => this.setModuleID(record['id'])}>
                                        {record.projecttaskname}
                                    </Text>
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

export default ProjectTask

const styles = StyleSheet.create({
    Content : {
        width: Dimensions.get('window').width-20 ,
        padding : 3 ,
        borderBottomWidth : 1 ,
        borderColor : '#eee',
        margin : 10
    },
    Record : {
        padding : 10,
        margin : 10
    },
    Bullet:{
        width: Dimensions.get('window').width-45 ,
        backgroundColor : '#428bca',
        padding : 3,
        marginBottom : 8
    },
    creator :{
        color : '#009FDA'
    },
    content : {
        padding : 5,
        margin : 5 ,
        fontSize : 17
    }
})