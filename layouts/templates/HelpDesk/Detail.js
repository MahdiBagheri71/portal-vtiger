import  { Component } from 'react'
import {View, Text ,StyleSheet } from 'react-native'
import { BottomNavigation,ActivityIndicator,Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateLang,vtranslate,fetchRelatedModules} from '../../../Functions/Portal' ;

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
        module : 'HelpDesk',
        routes : [
            { key: 'details', title: vtranslate('Details'), icon: 'details' },
            // { key: 'modComments', title: vtranslate('ModComments'), icon: 'comment'  },
            // { key: 'history', title: vtranslate('History'), icon: 'history'  },
            // { key: 'documents', title: vtranslate('Documents'), icon: 'file-document'  },
        ],
        fetch_modules : {}
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
        if(email && pass ){
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

    render() {
        if(this.state.record_id.includes("x")){
            return (
                <View>
                    <Button icon="eye-arrow-right" style={styles.moduleTitle} mode="text" color="#428bca" onPress={() => this.loadList()}>
                        {this.state.fetch_modules['modules'] ? this.state.fetch_modules['modules']['information'][this.state.module].uiLabel:null}
                    </Button>
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
    moduleTitle : {
        padding : 15 ,
        fontSize : 16 
    },
})