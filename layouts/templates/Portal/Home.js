import React, { Component } from 'react'
import {View, Text, StyleSheet,TouchableOpacity,Modal  } from 'react-native'
import '../../../global.js' 
import {fetchCompanyTitle,updateLang,vtranslate,fetchRecentRecords,fetchAnnouncement,fetchShortcuts} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';


import DocumentsAdd from './../Documents/Add.js'
import HelpDeskAdd from './../HelpDesk/Add.js'

class Home extends Component {

    state = {
        company_detail:{},
        fetchRecentRecords :{},
        announcement : '',
        fetchShortcuts : {},
        show_documens_add : false,
        show_help_desk_add : false
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
            
            
            this.setState({ 'fetchRecentRecords': await fetchRecentRecords(email,pass) });
            this.setState({ 'announcement': await fetchAnnouncement(email,pass) });
            this.setState({ 'fetchShortcuts': await fetchShortcuts(email,pass) });
        }

    }

    setModule = (module) => {
    
        this.setState({ module: module })
        
        AsyncStorage.setItem('module', module);

        this.props.investmentHandler();
    }

    loadAddModule = (module) => {
        if(module == "Documents"){
            this.setState({ show_documens_add : true });
        }else{
            this.setState({ show_help_desk_add : true });
        }
    }
    
    openShortcut =  (action) => {
		var actionConfig = {
			'LBL_ADD_DOCUMENT': 'Documents',
			'LBL_CREATE_TICKET': 'HelpDesk',
		};
		var serviceConfig = {
			'LBL_OPEN_TICKETS': 'HelpDesk',
		};
		if (actionConfig.hasOwnProperty(action)) {
			this.loadAddModule(actionConfig[action]);
		}
		if (serviceConfig.hasOwnProperty(action)) {
            AsyncStorage.setItem('record_id', 'false');
            AsyncStorage.setItem('help_desk_status', 'Open');
			this.setModule(serviceConfig[action]);
		}
	}

    setRecord = (module,record) => {
        AsyncStorage.setItem('record_id', record);
        this.setModule(module);
    }

    recentHelpDesk = () =>{
        var fetchRecentRecords = this.state.fetchRecentRecords;
        if(fetchRecentRecords[0] && fetchRecentRecords[0]['HelpDesk']){
            return (

                <View style = {styles.RecentHelpDesk}>
                    <Text>{vtranslate("Recent HelpDesk")}</Text>
                    <View  style = {styles.RecentHelpDeskTable}>
                        {fetchRecentRecords[0]['HelpDesk'].map((help_desk ) => {
                                return (
                                    <View key={help_desk.id} style = {styles.RecentHelpDeskTableRow}>
                                        <TouchableOpacity
                                            onPress = {
                                            () => this.setRecord('HelpDesk',help_desk.id)
                                            }>
                                            <Text style = {styles.submitButtonTextLink}>{help_desk.label}</Text>
                                        </TouchableOpacity>
                                        <Text>{help_desk.description}</Text>
                                        <Text style = {(help_desk.status == 'Closed'?styles.TextStatusClosed:(help_desk.status == 'In Progress'?styles.TextStatusInProgress:(help_desk.status == 'Open'?styles.TextStatusOpen:(styles.TextStatus))))}>{help_desk.statuslabel}</Text>
                                    </View>
                                )
                            })
                        } 
                    </View>
                </View>
            );
        }
        return null;
    }

    recentDocuments = () =>{
        var fetchRecentRecords = this.state.fetchRecentRecords;
        if(fetchRecentRecords[1] && fetchRecentRecords[1]['Documents']){
            return (

                <View style = {styles.RecentHelpDesk}>
                    <Text>{vtranslate("Recent Documents")}</Text>
                    <View  style = {styles.RecentHelpDeskTable}>
                        {fetchRecentRecords[1]['Documents'].map((document ) => {
                                return (
                                    <View key={document.id} style = {styles.RecentHelpDeskTableRow}>
                                        <TouchableOpacity
                                            onPress = {
                                            () => this.setRecord('Documents',document.id)
                                            }>
                                            <Text  style = {styles.submitButtonTextLink}>{document.label}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        } 
                    </View>
                </View>
            );
        }
        
        return null;
    }

    loadAddModal = () => {
        AsyncStorage.getItem('module').then((value) => {
            if(value != 'Home'){
                this.setState({ 'module': value });

                this.props.investmentHandler();
            }
        })
        this.setState({ show_documens_add : false });
        this.setState({ show_help_desk_add : false });
    }
    
    shortcuts = () =>{
        var fetchShortcuts = this.state.fetchShortcuts;
        if(fetchShortcuts['shortcuts']){
            return (

                <View style = {styles.RecentHelpDesk}>
                    <Text>{vtranslate("What would you like to do ?")}</Text>
                    <View  style = {styles.RecentHelpDeskTable}>
                        {fetchShortcuts['shortcuts'].map((shortcut1,index1 ) => {
                            
                            return (
                                <View key={index1} style = {styles.RecentHelpDeskTableRow}>
                                    
                                 {Object.entries(shortcut1).map((shortcut2 ) => {
                                    return(
                                        <View key={shortcut2[0]}>
                                            <Text style={{textAlign:'center',fontSize:16}}>{vtranslate(shortcut2[0])}</Text> 
                                            {shortcut2[1].map((shortcut3 ) => {
                                                return(
                                                    <TouchableOpacity key={shortcut3}
                                                        onPress = {
                                                        () => this.openShortcut(shortcut3)
                                                        }>
                                                        <Text style = {styles.TextStatusNO}>{vtranslate(shortcut3)}</Text>
                                                    </TouchableOpacity> 
                                                )
                                            })}
                                        </View>
                                    )
                                 })}
                                </View>
                            )
                        })} 
                    </View>
                </View>
            );
        }
        
        return null;
    }

    render() {
        return (
            <View>

                <View>
                    <Text style = {styles.submitButtonText}>{vtranslate("Welcome to")} {this.state.company_detail['organizationname']} {vtranslate('Portal')}</Text>
                    {this.state.announcement?<Text style = {styles.AnnouncementText}>{this.state.announcement}</Text>:null}
                </View> 

                <View>
                    {this.shortcuts()}
                    {this.recentHelpDesk()}
                    {this.recentDocuments()}
                </View> 

                <View>
                    <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.show_documens_add}>
                            <DocumentsAdd investmentHandler={this.loadAddModal}/>
                    </Modal>
                </View>

                <View>
                    <Modal animationType = {"slide"} transparent = {false}
                        visible = {this.state.show_help_desk_add}>
                            <HelpDeskAdd investmentHandler={this.loadAddModal}/>
                    </Modal>
                </View>

            </View>
        )
    }

}
export default Home

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        marginTop : 5,
    },
    submitButtonText:{
        color: '#000',
        textAlign: 'center',
        fontSize : 18
    },
    AnnouncementText :{
        color: '#000',
        textAlign: 'center',
        fontSize : 14,
        backgroundColor : '#fcf8e3',
        margin : 25,
        padding : 15
    },
    RecentHelpDesk:{
        paddingTop : 15,
        padding : 10,
        marginTop : 25,
        margin : 10,
        borderWidth : 1 ,
        borderColor : '#ededed',
    },
    RecentHelpDeskTable:{
        marginTop : 15,
        borderWidth : 1 ,
        borderColor : '#ededed'
    },
    RecentHelpDeskTableRow:{
        padding : 5,
        borderWidth : 1 ,
        borderColor : '#ededed',
        margin:1
    },
    submitButtonTextLink:{
        color : '#2a6496',
        textAlign : 'center'
    },
    TextStatusClosed:{
        backgroundColor :'#d9534f',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5
    },
    TextStatusInProgress:{
        backgroundColor :'#f0ad4e',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5
    },
    TextStatusOpen:{
        backgroundColor :'#5cb85c',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5
    },
    TextStatus:{
        backgroundColor :'#5bc0de',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5
    },
    TextStatusNO:{
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#333',
        padding : 5,
        margin : 5,
        borderWidth :1 ,
        borderColor : '#adadad'
    }
})