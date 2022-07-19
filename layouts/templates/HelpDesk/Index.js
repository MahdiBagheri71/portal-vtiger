import  { Component } from 'react'
import {View, Text, StyleSheet ,ScrollView ,Dimensions,Modal} from 'react-native'
import {fetchCompanyTitle,updateLang,vtranslate,fetchRecords,describeModule} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown  } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';

import { DataTable,Appbar,FAB,Button,ActivityIndicator  } from 'react-native-paper';

import HelpDeskAdd from './Add'

import '../../../global.js' 
class Index extends Component {
    state = {
        email : '',
        password : '',
        company_detail : {},
        fetchRecords : {},
        fetch_modules : {},
        heightHome : Dimensions.get('window').height-140,
        mode : 'mine' ,
        show_help_desk_add : false,
        describeModule : {} ,
        counShowHeader : 5 ,
        perPage : 10 ,
        ticketstatus : 'ALL',
        page : 0,
        module : 'HelpDesk'
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
        await AsyncStorage.getItem('help_desk_status').then((value) => {
            if(value){
                this.setState({ 'ticketstatus': value })
            }
            
            AsyncStorage.setItem('help_desk_status', 'ALL');
        })
        let email =this.state.email
        let pass = this.state.password;
        if(email && pass ){
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

    setTicketStatus = (status) => {
        this.state.page = 0;
        this.setState({'page' : 0});
        this.state.ticketstatus = status;
        this.setState({'ticketstatus' : status});
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
        if(this.state.ticketstatus.toUpperCase() !== "ALL"){
            filter = JSON.stringify({"ticketstatus":this.state.ticketstatus})
        }
        // alert(this.state.module + " module : " +  this.state.module+ " mode : " + this.state.mode+ " filter : " + filter + " page : " +this.state.page+ " perPage : " + this.state.perPage,);
        this.setState({ 'fetchRecords': await fetchRecords(email,pass,this.state.module, this.state.module, {"mode":this.state.mode}, filter ,this.state.page, this.state.perPage, '', '') });
    }

    loadAddModal = () => {
        this.setState({ show_help_desk_add : false });
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
                            <Button style={this.state.mode == 'all' ? styles.mode:styles.modeSelect} color={this.state.mode == 'all' ? '#000':'#fff'}
                                onPress={() => this.setStateMode("mine")}
                            >{vtranslate("Mine")}</Button>
                            <Button style={this.state.mode == 'all' ? styles.modeSelect:styles.mode} color={this.state.mode == 'all' ? '#fff':'#000'}
                                onPress={() => this.setStateMode("all")}
                            >{vtranslate("All")}</Button>
                            {this.state.describeModule['ticketstatus']?<Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={[{"label": vtranslate('All Tickets'),
                                "value": 'ALL'}].concat(this.state.describeModule['ticketstatus'].type.picklistValues)}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={vtranslate("Select item")}
                                searchPlaceholder={vtranslate("Search...")}
                                value={this.state.ticketstatus}
                                onChange={item => {
                                    this.setTicketStatus( item.value );
                                }}
                                renderLeftIcon={() => (
                                    <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                                )}
                                />:null}
                        </Appbar>
                        <ScrollView horizontal>
                            <DataTable style={styles.DataTable}>
                                <DataTable.Header style={styles.DataTableHeader}>
                                    {this.state.fetchRecords['count'] > 0 ? (Object.entries(this.state.fetchRecords[0]).map((row ) => {
                                        if (row[0] != 'id' && this.state.describeModule[row[0]] && show_header  < this.state.counShowHeader){
                                            show_header++;
                                            return (
                                                <DataTable.Title key={row[0]}>{this.state.describeModule[row[0]].label}</DataTable.Title>
                                            );
                                        }
                                        return null;
                                    })):null}
                                </DataTable.Header>
                                
                                { (Object.entries(this.state.fetchRecords).sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1).map((record ) => {
                                     if (Number(record[0]) >= 0){
                                        show_header = 0;
                                        return (
                                            <DataTable.Row key={record[0]} style={styles.DataTableHeader}>
                                                { (Object.entries(record[1]).map((row ) => {
                                                    if (row[0] != 'id' && this.state.describeModule[row[0]] && show_header  < this.state.counShowHeader){
                                                        show_header++;
                                                        return (
                                                            <DataTable.Cell key={row[0]}>{typeof row[1] === 'string' ?row[1] : JSON.stringify(row[1])}</DataTable.Cell>
                                                        );
                                                    }
                                                    return null;
                                                }))}
                                            </DataTable.Row>
                                        );
                                    }
                                }))}
                                {this.state.fetchRecords['count'] > 0 ?
                                    <DataTable.Pagination
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
                    <View>
                        <Modal animationType = {"slide"} transparent = {false}
                            visible = {this.state.show_help_desk_add}>
                                <HelpDeskAdd investmentHandler={this.loadAddModal}/>
                        </Modal>
                    </View>
                    {this.state.fetch_modules['modules']['information'][this.state.module].create == '1'?
                        <FAB
                                style={styles.fab}
                                small
                                icon="plus"
                                onPress={() => this.setState({ show_help_desk_add : true })}
                            />:null
                    }
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

export default Index

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
        textAlign: 'center'
    },
    fab: {
        backgroundColor : color_bg,
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modeSelect : {
        width : 100,
        backgroundColor : '#3276b1',
        borderColor : '#285e8e',
        borderWidth : 2,
        padding : 0,
        borderRadius : 0,
        textAlign : 'center'
    },
    mode :{
        width : 100,
        borderWidth : 2,
        borderRadius : 0,
        textAlign : 'center',
        borderColor : '#adadad',
        backgroundColor : '#ebebeb',
        padding : 0
    },
    DataTable : {
        width : Dimensions.get('window').width,
        textAlign : 'center',
        color : '#428bca',
    },
    DataTableHeader : {
        textAlign : 'center',
        color : '#428bca',

    },
    dropdown: {
        height: 50,
        width : 200 ,
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