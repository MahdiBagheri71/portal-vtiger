import  { Component } from 'react'
import {View, Text, StyleSheet ,ScrollView ,Modal} from 'react-native'
import {updateLang,vtranslate,fetchRecords,describeModule,searchFaqs} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { List,Searchbar,ActivityIndicator,Button, Provider,Portal,Divider  } from 'react-native-paper';
import { Dropdown  } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {per_page} from '../../../global.js' 
import ModCommentsPartials  from './partials/ModComments'
import DocumentsPartials  from './partials/Documents'

class ListFaq extends Component {
    state = {
        email : '',
        password : '',
        fetchRecords : {},
        describeModule : {} ,
        perPage : per_page ,
        page : 0,
        module : 'Faq',
        searchQuery : '',
        modalType : '',
        categories : '',
        visible : false
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
        let email =this.state.email
        let pass = this.state.password;
        if(email && pass ){
            var describe = await describeModule(email,pass,this.state.module);
            
            if(describe['describe']['fields']){
                var fields = {};
                Object.entries(describe['describe']['fields']).map( field_obj =>{
                    let field = field_obj[1];
                    fields[field.name]=field;
                })

                this.setState({ 'describeModule': fields});
            }
            await this.fetchRecordsMe();
        }

    }

    setPage = (page) => {
        this.state.page = page;
        this.setState({'page' : page});
        this.fetchRecordsMe();
    }

    setCategories = (status) => {
        this.state.page = 0;
        this.setState({'page' : 0});
        this.state.categories = status;
        this.setState({'categories' : status});
        this.fetchRecordsMe();
    }

    fetchRecordsMe = async() =>{
        var fetch_records_base = this.state.fetchRecords;
        this.setState({ 'fetchRecords': {} });
        let email =this.state.email
        let pass = this.state.password;
        var filter = false;
        if(this.state.categories != ""){
            filter = JSON.stringify({"faqcategories":this.state.categories})
        }
        if(this.state.page > 0){
            var fetch_records = await fetchRecords(email,pass,this.state.module, this.state.module, '', filter ,this.state.page, this.state.perPage, '', '');
            var fetch_records_all = [] ;
            Object.entries(fetch_records_base).map(fetch_record => {
                if(fetch_record[0]!='count'){
                    fetch_records_all.push(fetch_record[1]);
                }
            })
            Object.entries(fetch_records).map(fetch_record => {
                if(fetch_record[0]!='count'){
                    fetch_records_all.push(fetch_record[1]);
                }
            })
            fetch_records_all = {...fetch_records_all,...{'count':fetch_records.count}}
            this.setState({ 'fetchRecords': fetch_records_all });
        }else{
            this.setState({ 'fetchRecords': await fetchRecords(email,pass,this.state.module, this.state.module, '', filter ,this.state.page, this.state.perPage, '', '') });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onChangeSearch = async(query)=>{
        this.setState({'searchQuery':query});
        if(query.length>2){
            this.setState({ 'fetchRecords': {} });
            let email =this.state.email
            let pass = this.state.password;
            var fetch_records= await searchFaqs(email,pass,this.state.module, query);
            fetch_records= {...fetch_records,...{"count": fetch_records.length}};
            this.setState({ 'fetchRecords':  fetch_records});
        }else if (query.length==0){
            this.fetchRecordsMe();
        }
    }

    openMenu = (type ,record_id)=>{
        AsyncStorage.setItem('record_id_faq', record_id);
        this.setState({ visible: true });
        this.setState({ modalType: type });
    }
 
    closeMenu = ()=>{
       this.setState({ visible: false })
    }
 
    modalContext = () => {
        switch(this.state.modalType){
            case "ModComments":
                return (
                    <ScrollView style={styles.bodyModal}>
                        <Text style={styles.textHeader}>
                            {vtranslate(this.state.modalType)}
                        </Text>
                        <Divider />
                        <ModCommentsPartials/>
                    </ScrollView>
                )
            case "Documents":
                return (
                    <ScrollView style={styles.bodyModal}>
                        <Text style={styles.textHeader}>
                            {vtranslate(this.state.modalType)}
                        </Text>
                        <Divider />
                        <DocumentsPartials/>
                    </ScrollView>
                )
                
        }
    }

    render() {
        if(this.state.fetchRecords.hasOwnProperty('count')){
            return (
                <ScrollView >
                    <View>
                        
                        <Searchbar 
                            style={styles.Searchbar}
                            placeholder={vtranslate("Search")}
                            onChangeText={this.onChangeSearch}
                            value={this.state.searchQuery}
                            />

                        {this.state.describeModule['faqcategories']?<View style={{padding : 25,width : '100%'}}>
                            <Text style={{textAlign: 'center',width : '100%'}}>{vtranslate('Categories')} : </Text>
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={[{"label": vtranslate("Select an Option"),"value": ''}].concat(this.state.describeModule['faqcategories'].type['picklistValues'])}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={vtranslate("Select item")}
                                searchPlaceholder={vtranslate("Search...")}
                                value={this.state.categories}
                                onChange={item => {
                                    this.setCategories( item.value );
                                }}
                                renderLeftIcon={() => (
                                    <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                                )}
                                />
                        </View>:null}

                        <Text style={{padding : 15,width : '100%',textAlign: 'center'}}>
                            {vtranslate("Top Questions")}
                            <Divider />
                        </Text>

                        <Provider>
                            
                            <Portal>
                                <Modal transparent={true} visible={this.state.visible} onRequestClose={this.closeMenu} onDismiss={this.closeMenu} >
                                    <View style={{flex: 1,flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                                        <View style={{backgroundColor : '#fff',width: '90%',height: '85%',alignItems: 'center',padding : 15,borderWidth:2,borderColor:'#eee'}}>
                                            {this.modalContext()}
                                            <Button  icon="window-close" style={{position : 'absolute',right : 2,top:2 }} color='#333' onPress={this.closeMenu}>{vtranslate('Cancel')}</Button>
                                        </View>
                                    </View>
                                </Modal>
                            </Portal>
                        </Provider>
                        <ScrollView style={styles.listAccordionGroup}>
                            <List.AccordionGroup>
                                { (Object.entries(this.state.fetchRecords).sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1).map((record ) => {
                                     if (Number(record[0]) >= 0){
                                        return (
                                        <List.Accordion style={styles.listAccordion} key={record[0]} title={record[1]['question']} id={record[0]}>
                                            <Text style={styles.listRow}>{record[1]['faq_answer']}</Text>
                                            <Button color='#6200ee' onPress={() => this.openMenu('ModComments',record[1]['id'])}>{vtranslate('ModComments')}</Button>
                                            <Button color='#6200ee' onPress={() => this.openMenu('Documents',record[1]['id'])}>{vtranslate('Documents')}</Button>
                                        </List.Accordion>
                                        );
                                    }
                                }))}
                            </List.AccordionGroup>
                        </ScrollView>
                            {Object.keys(this.state.fetchRecords).length-1 < this.state.fetchRecords.count  ?
                                <Button color='#6200ee' onPress={()=>this.setPage(this.state.page+1)}>
                                    <Text style={{alignItems: 'center',width : '100%'}}>
                                        {vtranslate('more')} ...
                                    </Text>
                                </Button>
                            :null}
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

export default ListFaq

const styles = StyleSheet.create({
    Searchbar : {
        borderWidth : 2,
        borderColor : "#ddd",
        margin : 5,
    },
    listAccordionGroup: {
        marginTop : 10,
    },
    listRow : {
        padding : 15 ,
        textAlign : "center",
        borderWidth : 2,
        borderColor : "#ddd",
        margin : 5,
        fontSize : 16,
        
    },
    listAccordion :{
        padding : 3
    },
    dropdown: {
        width : '100%',
        height: 50,
        backgroundColor: 'transparent',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        textAlign : "center",
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    textHeader:{
        textAlign : 'center',
        color : "#000",
        fontSize : 20 ,
        marginBottom : 10
    },
    bodyModal : {
        width : '100%',
        height : '85%'
    }
});