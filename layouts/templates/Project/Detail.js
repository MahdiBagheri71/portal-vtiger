import  { Component } from 'react'
import {View, Text ,StyleSheet,Modal } from 'react-native'
import { BottomNavigation,ActivityIndicator,Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateLang,vtranslate,fetchRelatedModules,fetchRecord,saveRecord,describeModule,fetchModules} from '../../../Functions/Portal' ;

import DetailPartials  from './partials/Detail'
import ModCommentsPartials  from './partials/ModComments'
import HistoryPartials  from './partials/History'
import DocumentsPartials  from './partials/Documents'
import ProjectTaskPartials  from './partials/ProjectTask'
import ProjectMilestonePartials  from './partials/ProjectMilestone'


import Edit from './Edit'

class Detail extends Component {
    state = {
        email : '',
        password : '',
        record_id : 'false',
        partials : 'details',
        index : 0 ,
        module : '',
        routes : [
            { key: 'details', title: vtranslate('Details'), icon: 'details' }
        ],
        fetch_modules : {},
        describeModule : {} ,
        show_edit : false,
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
        if(email && pass && record_id ){

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
                
                var fetchRelatedModule = await fetchRelatedModules(email,pass,this.state.module);
                var route = [{ key: 'details', title: vtranslate('Details'), icon: 'details' }];
                if(fetchRelatedModule && fetch_modules["modules"]){
                    fetchRelatedModule.map((module)=>{
                        switch (module.toLowerCase()) {
                            case 'modcomments':
                                route.push({ key: 'modComments', title: vtranslate('ModComments'), icon: 'comment'});
                                break;
                            case 'history':
                                route.push({ key: 'history', title: vtranslate('History'), icon: 'history'});
                                break;
                            case 'documents':
                                route.push({ key: 'documents', title: vtranslate('Documents'), icon: 'file-document'});
                                break;
                            case 'projecttask':
                                if(fetch_modules["modules"]['information']['ProjectTask']){
                                    route.push({ key: 'projecttask', title: fetch_modules["modules"]['information']['ProjectTask'].uiLabel, icon: 'calendar-check'});
                                }
                                break;
                            case 'projectmilestone':
                                if(fetch_modules["modules"]['information']['ProjectMilestone']){
                                    route.push({ key: 'projectmilestone', title: fetch_modules["modules"]['information']['ProjectMilestone'].uiLabel, icon: 'flag-triangle'});
                                }
                                break;
                        }
                    })
                }
                this.setState({ 'routes': route });

            })

            var describe = await describeModule(email,pass,this.state.module);
            
            if(describe['describe']){

                this.setState({ 'describeModule': describe['describe']});
            }

            this.setState({ 'record': await fetchRecord(email,pass,record_id,this.state.module,'')});
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    renderScene = ({ route, jumpTo }) => {}

    loadPartials = ()=>{
        switch (this.state.partials) {
            case 'modComments':
                return <ModCommentsPartials/>;
            case 'history':
                return <HistoryPartials/>;
            case 'documents':
                return <DocumentsPartials/>;
            case 'projecttask':
                return <ProjectTaskPartials  investmentHandler={this.loadRecord}/>;
            case 'projectmilestone':
                return <ProjectMilestonePartials  investmentHandler={this.loadRecord}/>;
            case 'null':
                return null;
        }
        return <DetailPartials/>;
    }

    setIndex = (index) =>{
        this.setState({ 'index': index });
        this.setState({ 'partials': this.state.routes[index]['key'] });
    }

    loadRecord = () =>{
        this.props.investmentHandler();
    }

    loadList = () => {
        AsyncStorage.setItem('record_id', 'false');
        AsyncStorage.setItem('parent_id', '');
        this.props.investmentHandler();
    }

    acceptQuote = async() =>{
        let email =this.state.email
        let pass = this.state.password;
        let record_id = this.state.record_id;
        var data =JSON.stringify({"quotestage":"Accepted"});
        var result = await saveRecord(email,pass,this.state.module,data,record_id);
        if(result){
            this.setState({ 'record': result});
            this.setState({ 'partials': 'null' });
            this.setState({ 'index': 0 });
            this.setState({ 'partials': 'details' });
        }
    }

    edit = () =>{
        AsyncStorage.setItem('record_loading', JSON.stringify(this.state.record['record']));
        this.setState({ 'show_edit' : true });
    }

    loadAddModal = async() => {
        this.setState({ 'show_edit' : false });
        this.setState({ 'partials': 'null' });
        this.setState({ 'index': 0 });
        this.setState({ 'partials': 'details' });
        let email =this.state.email
        let pass = this.state.password;
        let record_id = this.state.record_id;
        this.setState({ 'record': await fetchRecord(email,pass,record_id,this.state.module,'')});
    }

    render() {
        if(this.state.record_id.includes("x")){
            return (
                <View>
                    
                    <View style={styles.navbar}>
                        <Button style={{
                            position: 'absolute',
                            padding : 3 ,
                            textAlign : 'center',
                            width : ((this.state.module == 'Quotes' &&  this.state.record['record'] && (this.state.record['record'].quotestage).toUpperCase() != 'ACCEPTED') || 
                            (this.state.fetch_modules['modules'] && this.state.record['record'] && this.state.fetch_modules['modules']['information'][this.state.module] &&  this.state.fetch_modules['modules']['information'][this.state.module].edit == '1' && (this.state.module != 'Quotes' || this.state.module != 'Invoice' )))?'68%':'100%',
                            flex : 1,
                            fontSize : 18 ,
                            top : 0,
                            left : 0
                        }} mode="text" color="#428bca" onPress={() => this.loadList()}>
                            {this.state.describeModule.label}
                            {(this.state.record['record'] && this.state.describeModule.labelFields && this.state.record['record'][this.state.describeModule.labelFields])?' ('+this.state.record['record'][this.state.describeModule.labelFields]+') ':null}
                        </Button>
                        {(this.state.module == 'Quotes' &&  this.state.record['record'] && (this.state.record['record'].quotestage).toUpperCase() != 'ACCEPTED')?
                            <Button style={styles.btnSuccess} color="#fff" onPress={() => this.acceptQuote()}>
                                {vtranslate('Accept Quote')}
                            </Button>
                        :null} 
                        {(this.state.fetch_modules['modules'] && this.state.record['record'] && this.state.fetch_modules['modules']['information'][this.state.module] &&  this.state.fetch_modules['modules']['information'][this.state.module].edit == '1' && (this.state.module != 'Quotes' || this.state.module != 'Invoice' )) ?
                            <Button style={styles.btnPrimary} color="#fff" onPress={() => this.edit()}>
                                {vtranslate('Edit')} {this.state.describeModule.label}
                            </Button>
                        :null}
                        <View>
                            <Modal animationType = {"slide"} transparent = {false}
                                visible = {this.state.show_edit}>
                                    <Edit investmentHandler={this.loadAddModal}/>
                            </Modal>
                        </View>
                    </View>

                    <BottomNavigation 
                        barStyle={{ backgroundColor: '#fefefe' }}
                        inactiveColor = "#2a6496"
                        style ={styles.BottomNavigation}
                        navigationState={{ index : this.state.index , routes : this.state.routes }}
                        onIndexChange={this.setIndex}
                        renderScene={this.renderScene}
                    />
                    <Text>
                        {this.loadPartials()} 
                    </Text>
                </View> 
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

export default Detail

const styles = StyleSheet.create({
    BottomNavigation : {
        top : 0,
        margin : 2 ,
        marginTop : 50
    } ,
    navbar : {
        width: "100%" ,
    },
    btnSuccess : {
        position: 'absolute',
        borderRadius : 5,
        flex : 1,
        textAlign : 'center',
        width : '30%',
        backgroundColor : '#47a447',
        padding : 1,
        borderWidth :1 ,
        borderColor : '#398439',
        top : 0,
        right : '1%'
    },
    btnPrimary : {
        position: 'absolute',
        borderRadius : 5,
        flex : 1,
        textAlign : 'center',
        width : '30%',
        backgroundColor : '#3276b1',
        padding : 1,
        borderWidth :1 ,
        borderColor : '#285e8e',
        top : 0,
        right : '1%'
    }
})