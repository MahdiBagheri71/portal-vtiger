import  { Component } from 'react'
import {View, Text,Dimensions,StyleSheet  } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateLang,vtranslate,fetchHistory,describeModule} from '../../../../Functions/Portal' ;
import { ActivityIndicator } from 'react-native-paper';
import {decode} from 'html-entities';

class History extends Component {
    state = {
        email : '',
        password : '',
        record_id : 'false',
        describeModule : {} ,
        history : false ,
        module : 'HelpDesk',
    }

    componentWillUnmount() {
        this._isMounted = false;
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
            var describ = await describeModule(email,pass,this.state.module);
            
            if(describ['describe']['fields']){
                var fields = {};
                Object.entries(describ['describe']['fields']).map( field_obj =>{
                    let field = field_obj[1];
                    fields[field.name]=field;
                })

                this.state.describeModule = fields;

                this.setState({ 'describeModule': fields});
            }
            var result = await fetchHistory(email,pass,this.state.module,record_id,0, 50,0);
            var history = {'records':[],'count':0};
            var new_array = {};
            let count = 0
            if(result['history']){
                var recordMeta = this.state.describeModule;
                result['history'].map((valueArray)=>{
                    let status = valueArray['status'];
                    if (valueArray['values']) {
                        new_array = {};
					    new_array['modifiedtime'] = valueArray['modifiedtime'];
                        Object.entries(valueArray['values']).map((row ) => {
                            let fieldname = row[0];
                            let values = row[1];
                            if (recordMeta[fieldname]['type']['name'] == 'picklist') {
                                recordMeta[fieldname]['type'].picklistValues.map((label)=>{
                                    if(values['previous'] &&  values['previous'] == label['value']){
                                        values['previous'] = label['label'];
                                    }
                                    if(values['current'] &&  values['current'] == label['value']){
                                        values['current'] = label['label'];
                                    }
                                })
                            }

                            
                            if (recordMeta[fieldname]['type']['name'] == 'multipicklist') {
                                if (values['previous']) {
                                    values['previous'] = values['previous'].replace(/ \|\#\#\| /ig, ",");
                                }
                                if (values['previous'] == 0) {
                                    values['previous'] = '';
                                }
                                if (values['current']) {
                                    values['current'] = values['current'].replace(/ \|\#\#\| /ig, ",");
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'text' || recordMeta[fieldname]['type']['name'] == 'string') {
                                if (values['previous']) {
                                    if (values['previous'] == 0) {
                                        values['previous'] = '';
                                    }
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'date') {
                                if (values['current'] == '') {
                                    values['previous'] = '';
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'url') {
                                if (values['previous']) {
                                    if (values['previous'] == 0) {
                                        values['previous'] = '';
                                    }
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'time') {
                                if (values['current'] == '') {
                                    values['previous'] = '';
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'phone') {
                                if (values['current'] == '') {
                                    values['previous'] = '';
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'email') {
                                if (values['previous']) {
                                    if (values['previous'] == 0) {
                                        values['previous'] = '';
                                    }
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'double' || recordMeta[fieldname]['type']['name'] == 'currency') {
                                if (values['previous']) {
                                    values['previous'] = Number(values['previous']).toFixed(2);
                                }
                                if (values['current']) {
                                    values['current'] = Number(values['current']).toFixed(2);
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'boolean') {
                                if (values['previous'] !== '') {
                                    values['previous'] = values['previous'] == 0 ? vtranslate("No") : vtranslate("Yes");
                                }
                                if (values['current'] !== '') {
                                    values['current'] = values['current'] == 1 ? vtranslate("Yes") : vtranslate("No");
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'reference') {
                                if (values['previous'] !== '') {
                                    if (values['previous'] == 0) {
                                        values['previous'] = '';
                                    } else {
                                        values['previous'] = values['previous'];
                                    }
                                }
                                if (values['current'] !== '') {
                                    values['current'] = values['current'];
                                }
                            }

                            if (recordMeta[fieldname]['type']['name'] == 'text') {
                                values['previous'] = values['previous'].replace(/\n/ig, " ");
                                values['current'] = values['current'].replace(/\n/ig, " ");
                                values['previous'] = values['previous'].replace(/<br(\s+)?\/?>/ig, "\n");
                                values['current'] = values['current'].replace(/<br(\s+)?\/?>/ig, "\n");
                                values['previous'] = values['previous'].replace(/(<([^>]+)>)/gi, " ");
                                values['current'] = values['current'].replace(/(<([^>]+)>)/gi, " ");;
                            }

                            // alert(JSON.stringify(values))
                            fieldname = recordMeta[fieldname]['label'];
                            let createCount=0,updateCount=0;
                            Object.entries(values).map((row2 ) => {
                                let key = row2[0];
                                if (status == 'updated') {
                                    createCount = Object.keys(valueArray['values']).length;
                                    if(!new_array[fieldname]){
                                        new_array[fieldname] = {};
                                    }
                                    new_array[fieldname]['updateStatus'] = status;
                                    new_array[fieldname][key] = decode(values[key]);

                                }else if (status == 'created') {
                                    if(!new_array['id']){
                                        new_array['id'] = {};
                                    }
                                    new_array['id']['updateStatus'] = status;
                                    updateCount = Object.keys(valueArray['values']).length;
                                    if(!new_array['created']){
                                        new_array['created'] = {};
                                    }
                                    new_array['created']['user'] = valueArray['modifieduser']['label'];
                                    // history['records'].push(new_array);
                                    return ;
                                }
                            })
                            count = createCount + updateCount;
                        })
                    }
                    
				    history['records'].push(new_array);
				    history['count'] = count;
                })
            }
            // alert(JSON.stringify(history))
            this.setState({ 'history': history});
        }
    }

    loadRecord = () => {
        AsyncStorage.getItem('record_id').then((value) => {
            this.setState({ 'record_id': value })
        });
     }

    render() {
        if(this.state.history.hasOwnProperty('count')){
            return (
                <View style={styles.historyContent}>
                    {this.state.history.records.map((update ,key) => {
                        return(
                            <View key={key}>
                                { typeof update === 'object' ?Object.entries(update).map((row ) => {
                                    let fieldname = row[0];
                                    let value = row [1];
                                    if(value.updateStatus=='updated'){
                                        return (
                                            <View style={styles.historyRecord} key={fieldname}>
                                                <View style={styles.historyBullet}></View>
                                                <View style={styles.historyContent}>
                                                    <Text>
                                                        {fieldname+' '}
                                                        {value.previous!==''?<Text>
                                                            {vtranslate('changed from') + '  ' +value.previous + '  '+(value.current!=='' ? vtranslate('to') + '  '+value.current: '')} 
                                                        </Text>:null}
                                                        {value.previous =='' && value.current!==''?<Text>
                                                            {vtranslate('changed to') + '  ' +value.current } 
                                                        </Text>:null}
                                                        {value.previous =='' && value.current==''?<Text>
                                                            {vtranslate('deleted') } 
                                                        </Text>:null}
                                                    </Text>
                                                </View>
                                                <View><Text>{update.modifiedtime}</Text></View>
                                            </View>
                                        )
                                    }
                                    if(value.updateStatus=='created'){
                                        return (
                                            <View style={styles.historyRecord} key={fieldname}>
                                                <View style={styles.historyBullet}></View>
                                                <View style={styles.historyContent}>
                                                    <Text>
                                                        {update.created.user+' '}
                                                        <Text>
                                                            {vtranslate('created')} 
                                                        </Text>
                                                    </Text>
                                                </View>
                                                <View><Text>{update.modifiedtime}</Text></View>
                                            </View>
                                        )
                                    }
                                }):null}
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

export default History

const styles = StyleSheet.create({
    historyContent : {
        width: Dimensions.get('window').width  -20 ,
        padding : 3 ,
        borderBottomWidth : 1 ,
        borderColor : '#eee',
        margin : 10
    },
    historyRecord : {
        width: Dimensions.get('window').width -20,
        padding : 10,
        margin : 0
    },
    historyBullet:{
        width: Dimensions.get('window').width -15,
        backgroundColor : '#428bca',
        padding : 3,
        marginBottom : 8
    },
    historyContent:{
        width: Dimensions.get('window').width -50 ,
        margin : 15
    }
})