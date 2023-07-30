import  { Component } from 'react'
import {View, Text,Dimensions,StyleSheet  } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import {updateLang,vtranslate,describeModule,fetchRecord} from '../../../../Functions/Portal' ;

class Detail extends Component {
    state = {
        email : '',
        password : '',
        record_id : 'false',
        parent_id : '',
        describeModule : {} ,
        record : false ,
        module : '',
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
        
        await AsyncStorage.getItem('parent_id').then((value) => {
            if(value){
                this.setState({ 'parent_id': value })
            }else{
                this.setState({ 'parent_id': '' })
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
            var describe = await describeModule(email,pass,this.state.module);
            
            if(describe['describe']['fields']){
                var fields = {};
                Object.entries(describe['describe']['fields']).map( field_obj =>{
                    let field = field_obj[1];
                    fields[field.name]=field;
                })

                this.setState({ 'describeModule': fields});
            }
            
            this.setState({ 'record': await fetchRecord(email,pass,record_id,this.state.module,this.state.parent_id)});
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        if(this.state.record_id.includes("x") && this.state.record['record']){
            return (
                <View>
                    { (Object.entries(this.state.record['record']).map((row ) => {
                        if (row[0] != 'id' && this.state.describeModule[row[0]] ){
                            
                            if(this.state.describeModule[row[0]]['type'].name == 'picklist'){
                                return (
                                    this.state.describeModule[row[0]]['type'].picklistValues.map((picklist)=>{
                                        if(row[1] == picklist['value']){
                                            return (
                                                <View key={row[0]} style={styles.recordField}>
                                                    <Text style={styles.recordLabel}>{this.state.describeModule[row[0]].label}</Text>
                                                    <Text style={styles.recordValue} key={row[1]}>{picklist['label']}</Text>
                                                </View>
                                            )
                                        }
                                    })
                                );
                            }else if(this.state.describeModule[row[0]]['type'].name == 'multipicklist'){
                                return (
                                    <View key={row[0]} style={styles.recordField}>
                                        <Text style={styles.recordLabel}>{this.state.describeModule[row[0]].label}</Text>
                                        <Text style={styles.recordValue} key={row[1]}>{row[1].replace(/ \|\#\#\| /ig, ",")}</Text>
                                    </View>
                                )
                            }else if(this.state.describeModule[row[0]]['type'].name == 'double' || this.state.describeModule[row[0]]['type'].name == 'currency'){
                                return (
                                    <View key={row[0]} style={styles.recordField}>
                                        <Text style={styles.recordLabel}>{this.state.describeModule[row[0]].label}</Text>
                                        <Text style={styles.recordValue}  key={row[1]}>{Number(row[1]).toFixed(2)}</Text>
                                    </View>
                                )
                            }else if(this.state.describeModule[row[0]]['type'].name == 'boolean'){
                                return (
                                    <View key={row[0]} style={styles.recordField}>
                                        <Text style={styles.recordLabel}>{this.state.describeModule[row[0]].label}</Text>
                                        <Text style={styles.recordValue}  key={row[1]}>{row[1]== 1 ? vtranslate("Yes") : vtranslate("No") }</Text>
                                    </View>
                                )
                            }else{
                                return (
                                    <View key={row[0]} style={styles.recordField}>
                                        <Text style={styles.recordLabel}>{this.state.describeModule[row[0]].label}</Text>
                                        <Text style={styles.recordValue}  key={row[0]}>{typeof row[1] === 'string' ? row[1] : (row[1]['label']?row[1]['label']: JSON.stringify(row[1]))}</Text>
                                    </View>
                                );
                            }
                        }
                        return null;
                    }))}
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

export default Detail

const styles = StyleSheet.create({
    recordField : {
        width: Dimensions.get('window').width-20 ,
        padding : 3 ,
        borderBottomWidth : 1 ,
        borderColor : '#eee',
        margin : 10
    },
    recordLabel:{
        textAlign : 'center',
        padding : 10 ,
        fontSize : 18,
        color : '#333'
    },
    recordValue:{
        textAlign : 'center',
        fontSize : 12,
        padding : 5 ,
    }
})