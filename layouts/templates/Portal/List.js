import  { Component } from 'react'
import {View, Text, StyleSheet ,ScrollView ,Dimensions} from 'react-native'
import {updateLang,vtranslate,fetchRecords,describeModule} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DataTable,Appbar,Button,ActivityIndicator  } from 'react-native-paper';

import {per_page} from '../../../global.js' 

class List extends Component {
    state = {
        email : '',
        password : '',
        fetchRecords : {},
        fetch_modules : {},
        heightHome : Dimensions.get('window').height-158,
        mode : 'mine' ,
        show_help_desk_add : false,
        describeModule : {} ,
        counShowHeader : 5 ,
        perPage : per_page ,
        page : 0,
        order : '',
        order_by : ''
    }

    componentDidMount = async () => {
 
        await AsyncStorage.getItem('lang').then((value) => {
            if(value){
                updateLang(value);
                this.setState({ 'lang': value })
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
        
        await AsyncStorage.getItem('module').then((value) => {
            if(value){
                this.setState({ 'module': value })
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
                        this.setState({ fetch_modules: fetch_modules });
                     }
                }
                
                this.setState({ 'moduleLabel': fetch_modules['modules']['information'][this.state.module].label })

            })

            var describ = await describeModule(email,pass,this.state.module);
            
            if(describ['describe']['fields']){
                var fields = {};
                Object.entries(describ['describe']['fields']).map( field_obj =>{
                    let field = field_obj[1];
                    fields[field.name]=field;
                })

                this.setState({ 'describeModule': fields});
            }
            
            this.fetchRecordsMe();
        }

    }

    setStateMode = (mode) => {
        this.state.page = 0;
        this.setState({'page' : 0});
        this.state.mode = mode;
        this.setState({'mode' : mode});
        this.fetchRecordsMe();
    }

    setPage = (page) => {
        this.state.page = page;
        this.setState({'page' : page});
        this.fetchRecordsMe();
    }

    fetchRecordsMe = async() =>{
        this.setState({ 'fetchRecords': {} });
        let email =this.state.email
        let pass = this.state.password;
        var filter = false;
        // alert(this.state.module + " module : " +  this.state.module+ " mode : " + this.state.mode+ " filter : " + filter + " page : " +this.state.page+ " perPage : " + this.state.perPage,);
        this.setState({ 'fetchRecords': await fetchRecords(email,pass,this.state.module, this.state.moduleLabel, {"mode":this.state.mode}, filter ,this.state.page, this.state.perPage, this.state.order_by, this.state.order) });
    }

    loadAddModal = () => {
        this.setState({ 'show_help_desk_add' : false });
        AsyncStorage.getItem('record_id').then((value) => {
            if(value.includes("x")){
                this.props.investmentHandler();
            }
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setModuleID = (record_id) => {
        AsyncStorage.setItem('record_id', record_id);
        this.props.investmentHandler();
    }

    setOrder = (field) => {
        var order = this.state.order=='DESC' ? 'ASC' : 'DESC';
        this.state.order = order;
        this.state.order_by = field;
        this.setState({ 'order' : order });
        this.setState({ 'order_by' : field });
        this.fetchRecordsMe();
    }

    render() {
        if(this.state.fetchRecords.hasOwnProperty('count')){
            let show_header = 0;
            return (
                <ScrollView >
                    <View style={{height:this.state.heightHome}}>
                        <Text style={styles.moduleTitle}>
                            {this.state.fetch_modules['modules']['information'][this.state.module].uiLabel}
                        </Text>
                        <Appbar style={styles.Appbar}>
                            {(this.state.fetch_modules['modules']['information'][this.state.module].recordvisibility == "1")?
                                <Text>
                                    <Button style={this.state.mode == 'all' ? styles.mode:styles.modeSelect} color={this.state.mode == 'all' ? '#000':'#fff'}
                                            onPress={() => this.setStateMode("mine")}
                                        >{vtranslate("Mine")}</Button>
                                    <Button style={this.state.mode == 'all' ? styles.modeSelect:styles.mode} color={this.state.mode == 'all' ? '#fff':'#000'}
                                            onPress={() => this.setStateMode("all")}
                                        >{vtranslate("All")}</Button>
                                </Text>
                            :null}
                        </Appbar>
                        <ScrollView>
                            <DataTable style={styles.DataTable}>
                                <DataTable.Header style={styles.DataTableHeader}>
                                    {this.state.fetchRecords['count'] > 0 ? (Object.entries(this.state.fetchRecords[0]).map((row ) => {
                                        if (row[0] != 'id' && this.state.describeModule[row[0]] && show_header  < this.state.counShowHeader){
                                            show_header++;
                                            return (
                                                <DataTable.Title sortDirection={( row[0] == this.state.order_by ?( this.state.order == 'DESC')?"ascending":"descending":'')} key={row[0]} onPress={() => this.setOrder(row[0])}>{this.state.describeModule[row[0]].label}</DataTable.Title>
                                            );
                                        }
                                        return null;
                                    })):null}
                                </DataTable.Header>
                                
                                { (Object.entries(this.state.fetchRecords).sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1).map((record ) => {
                                     if (Number(record[0]) >= 0){
                                        show_header = 0;
                                        return (
                                            <DataTable.Row key={record[1]['id']} style={styles.DataTableHeader} onPress={() => this.setModuleID(record[1]['id'])}>
                                                { (Object.entries(record[1]).map((row ) => {
                                                    if (row[0] != 'id' && this.state.describeModule[row[0]] && show_header  < this.state.counShowHeader){
                                                        show_header++;
                                                        if(this.state.describeModule[row[0]]['type'].name == 'picklist'){
                                                            return (
                                                                this.state.describeModule[row[0]]['type'].picklistValues.map((picklist)=>{
                                                                    if(row[1] == picklist['value']){
                                                                        return (
                                                                            <DataTable.Cell key={row[1]}>{picklist['label']}</DataTable.Cell>
                                                                        )
                                                                    }
                                                                })
                                                            );
                                                        }else if(this.state.describeModule[row[0]]['type'].name == 'multipicklist'){
                                                            return (
                                                                <DataTable.Cell key={row[1]}>{row[1].replace(/ \|\#\#\| /ig, ",")}</DataTable.Cell>
                                                            )
                                                        }else if(this.state.describeModule[row[0]]['type'].name == 'double' || this.state.describeModule[row[0]]['type'].name == 'currency'){
                                                            return (
                                                                <DataTable.Cell key={row[1]}>{Number(row[1]).toFixed(2)}</DataTable.Cell>
                                                            )
                                                        }else if(this.state.describeModule[row[0]]['type'].name == 'boolean'){
                                                            return (
                                                                <DataTable.Cell key={row[1]}>{row[1]== 1 ? vtranslate("Yes") : vtranslate("No") }</DataTable.Cell>
                                                            )
                                                        }else{
                                                            return (
                                                                <DataTable.Cell key={row[0]}>{typeof row[1] === 'string' ? row[1] : (row[1]['label']?row[1]['label']: JSON.stringify(row[1]))}</DataTable.Cell>
                                                            );
                                                        }
                                                    }
                                                    return null;
                                                }))}
                                            </DataTable.Row>
                                        );
                                    }
                                }))}
                                {this.state.fetchRecords['count'] > 0 ?
                                    <DataTable.Pagination
                                        style={styles.DataTableHeader}
                                        page={this.state.page}
                                        numberOfPages={Math.ceil(this.state.fetchRecords['count']/this.state.perPage)}
                                        onPageChange={(page) => this.setPage(page)}
                                        label={`${this.state.page +1} of ${Math.ceil(this.state.fetchRecords['count']/this.state.perPage)}`}
                                        showFastPagination
                                        optionsLabel={'Rows per page'}
                                    />
                                :null}
                            </DataTable>
                        </ScrollView>
                    </View> 
                </ScrollView> 
            )
        }else{
            return (
                <View >
                    <Text style ={{textAlign:'center',padding : 25}}>{vtranslate("Loading")}</Text>
                    <ActivityIndicator style ={{textAlign:'center',padding : 25}} animating={true} color='#000' />
                </View> 
            )
        }
    }
}

export default List

const styles = StyleSheet.create({
    moduleTitle : {
        padding : 15 ,
        fontSize : 16
    },
    Appbar: {
        backgroundColor : "#fff",
        left: 0,
        right: 0,
        marginBottom : 25,
        textAlign: 'center',
        paddingLeft: 25
    },
    fab: {
        backgroundColor : color_bg,
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modeSelect : {
        width : '20%',
        backgroundColor : '#3276b1',
        borderColor : '#285e8e',
        borderWidth : 2,
        padding : 0,
        borderRadius : 0,
        textAlign : 'center'
    },
    mode :{
        width : '20%',
        borderWidth : 2,
        borderRadius : 0,
        textAlign : 'center',
        borderColor : '#adadad',
        backgroundColor : '#ebebeb',
        padding : 0
    },
    DataTable : {
        minWidth : Dimensions.get('window').width,
        textAlign : 'center',
        color : '#428bca',
        marginBottom : 50
    },
    DataTableHeader : {
        textAlign : 'center',
        color : '#428bca',

    },
    dropdown: {
        height: 50,
        width : '40%' ,
        backgroundColor: 'transparent',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
        margin : 15
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
});