import  { Component } from 'react'
import {View, Text ,StyleSheet } from 'react-native'
import { BottomNavigation,ActivityIndicator,Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateLang,vtranslate,fetchRelatedModules,fetchRecord,saveRecord,describeModule} from '../../../Functions/Portal' ;

import DetailPartials  from './partials/Detail'
import ModCommentsPartials  from './partials/ModComments'
import HistoryPartials  from './partials/History'
import DocumentsPartials  from './partials/Documents'


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
        describeModule : {} ,
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
            var fetchRelatedModule = await fetchRelatedModules(email,pass,this.state.module);
            var route = [{ key: 'details', title: vtranslate('Details'), icon: 'details' }];
            if(fetchRelatedModule){
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
                    }
                })
            }
            this.setState({ 'routes': route });

            var describ = await describeModule(email,pass,this.state.module);
            
            if(describ['describe']){

                this.setState({ 'describeModule': describ['describe']});
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
            case 'null':
                return null;
        }
        return <DetailPartials/>;
    }

    setIndex = (index) =>{
        this.setState({ 'index': index });
        this.setState({ 'partials': this.state.routes[index]['key'] });
    }

    loadList = () => {
        AsyncStorage.setItem('record_id', 'false');
        this.props.investmentHandler();
    }

    markClosed = async() =>{
        let email =this.state.email
        let pass = this.state.password;
        let record_id = this.state.record_id;
        var data =JSON.stringify({"ticketstatus":"Closed"});
        var result = await saveRecord(email,pass,this.state.module,data,record_id);
        this.setState({ 'record': result});
        this.setState({ 'partials': 'null' });
        this.setState({ 'index': 0 });
        this.setState({ 'partials': 'details' });
    }

    render() {
        if(this.state.record_id.includes("x")){
            return (
                <View>
                    
                    <View style={styles.navbar}>
                        <Button style={styles.moduleTitle} mode="text" color="#428bca" onPress={() => this.loadList()}>
                            {this.state.describeModule.label}
                            {(this.state.record['record'] && this.state.describeModule.labelFields && this.state.record['record'][this.state.describeModule.labelFields])?' ('+this.state.record['record'][this.state.describeModule.labelFields]+') ':null}
                        </Button>
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
        margin : 2 
    } ,
    navbar : {
        width: "100%" ,
    },
    moduleTitle : {
        width: "100%" ,
        padding : 3 ,
        textAlign : 'center',
        flex : 1,
        fontSize : 18 ,
    },
})