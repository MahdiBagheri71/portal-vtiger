import React, { Component } from 'react'
import {View, Text ,StyleSheet,Image,Dimensions,TextInput } from 'react-native'
import { BottomNavigation,ActivityIndicator,Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateLang,vtranslate,fetchProfile,saveRecord} from '../../../Functions/Portal' ;

class Detail extends Component {
    state = {
        email : '',
        password : '',
        partials : 'customer_details',
        index : 0 ,
        routes : [
            { key: 'customer_details', title: vtranslate('Contacts'), icon: 'account' }
        ],
        profile : false,
        customer_details :{},
        company_details :{},
        disableButton : false
    }

    componentDidMount = async () => {
        await AsyncStorage.getItem('lang').then((value) => {
            if(value){
                updateLang(value);
                this.setState({ 'lang': value })
            }
        })
        await AsyncStorage.getItem('parent_id').then((value) => {
            if(value){
                this.setState({ 'parent_id': value })
            }else{
                this.setState({ 'parent_id': '' })
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
            var fetch_profile = await fetchProfile(email,pass);
            this.setState({ 'profile': fetch_profile })
            var route = [];
            if(fetch_profile){
                Object.entries(fetch_profile).map((module)=>{
                    switch (module[0].toLowerCase()) {
                        case 'customer_details':
                            route.push({ key: 'customer_details', title: vtranslate('Personal Details'), icon: 'account' });
                            this.setState({customer_details:fetch_profile['customer_details']});
                            break;
                        case 'company_details':
                            route.push({ key: 'company_details', title: vtranslate('Company Details'), icon: 'domain'});
                            this.setState({company_details:fetch_profile['company_details']});
                            break;
                    }
                })
            }
            this.setState({ 'routes': route });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    renderScene = ({ route, jumpTo }) => {}

    saveAccont = async()=>{
        if(this.state.disableButton){
            return;
        }
        
        if(this.state.company_details.accountname.length<1){
            alert(vtranslate('The field "{0}" is mandatory.').replace("{0}",vtranslate("Name")));
            return ;
        }

        if(this.state.company_details.website && !String(this.state.company_details.website)
            .toLowerCase()
            .match(
                /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/
            )){
            alert(vtranslate('Please enter a valid Url.'));
            return;
        }

        if(this.state.company_details.email1 && !String(this.state.company_details.email1)
            .toLowerCase()
            .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )){
            alert(vtranslate('Please enter a valid E-mail address.'));
            return;
        }

        this.state.disableButton = true;
        this.setState({ 'disableButton': true });
        let email =this.state.email
        let pass = this.state.password;
        var data =JSON.stringify(this.state.company_details);
        var result = await saveRecord(email,pass,'Accounts',data,this.state.company_details.id);
        if(result){
            this.setState({ 'profile': false });
            var fetch_profile = await fetchProfile(email,pass);
            this.setState({ 'profile': fetch_profile });
            this.setState({customer_details:fetch_profile['customer_details']});
            this.setState({company_details:fetch_profile['company_details']});
        }
        this.setState({ 'disableButton': false });
    }

    saveContact = async()=>{
        if(this.state.disableButton){
            return;
        }
        
        if(this.state.customer_details.lastname.length<1){
            alert(vtranslate('The field "{0}" is mandatory.').replace("{0}",vtranslate("Last Name")));
            return ;
        }
        
        if(this.state.customer_details.email.length<1){
            alert(vtranslate('The field "{0}" is mandatory.').replace("{0}",vtranslate("Primary Email")));
            return ;
        }

        if(!String(this.state.customer_details.email)
            .toLowerCase()
            .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )){
            alert(vtranslate('Please enter a valid E-mail address.'));
            return;
        }

        if(this.state.customer_details.secondaryemail && !String(this.state.customer_details.secondaryemail)
            .toLowerCase()
            .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )){
            alert(vtranslate('Please enter a valid E-mail address.'));
            return;
        }

        this.state.disableButton = true;
        this.setState({ 'disableButton': true });
        let email =this.state.email
        let pass = this.state.password;
        var data =JSON.stringify(this.state.customer_details);
        var result = await saveRecord(email,pass,'Contacts',data,this.state.customer_details.id);
        if(result){
            this.setState({ 'profile': false });
            var fetch_profile = await fetchProfile(email,pass);
            this.setState({ 'profile': fetch_profile });
            this.setState({customer_details:fetch_profile['customer_details']});
            this.setState({company_details:fetch_profile['company_details']});
        }
        this.setState({ 'disableButton': false });
    }

    loadPartials = ()=>{
        switch (this.state.partials) {
            case 'customer_details':
                if(this.state.customer_details){
                    let contactDetails = this.state.customer_details;
                    return ( 
                        <View style={styles.box}>
                            <View>
                                <Image alt="Contact Picture" style={{width: '100%'}} source={{uri: contactDetails.imagetype+';base64,'+contactDetails.imagedata}}/>
                            </View>
                            <View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("First Name")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        this.state.customer_details.firstname = value;
                                        this.setState({'customer_details':this.state.customer_details})
                                    }} value={this.state.customer_details.firstname} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Last Name")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        if(value.length<1){
                                            alert(vtranslate('The field "{0}" is mandatory.').replace("{0}",vtranslate("Last Name")));
                                        }
                                        this.state.customer_details.lastname = value;
                                        this.setState({'customer_details':this.state.customer_details})
                                    }} value={this.state.customer_details.lastname} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Primary Email")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        if(value.length<1){
                                            alert(vtranslate('The field "{0}" is mandatory.').replace("{0}",vtranslate("Primary Email")));
                                        }
                                        if(!String(value)
                                            .toLowerCase()
                                            .match(
                                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                            )){
                                            alert(vtranslate('Please enter a valid E-mail address.'));
                                        }
                                        this.state.customer_details.email = value;
                                        this.setState({'customer_details':this.state.customer_details})
                                    }} value={this.state.customer_details.email} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Secondary Email")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        if(!String(value)
                                            .toLowerCase()
                                            .match(
                                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                            )){
                                            alert(vtranslate('Please enter a valid E-mail address.'));
                                        }
                                        this.state.customer_details.secondaryemail = value;
                                        this.setState({'customer_details':this.state.customer_details})
                                    }} value={this.state.customer_details.secondaryemail} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Mobile Phone")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        this.state.customer_details.mobile = value;
                                        this.setState({'customer_details':this.state.customer_details})
                                    }} value={this.state.customer_details.mobile} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Office Phone")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        this.state.customer_details.phone = value;
                                        this.setState({'customer_details':this.state.customer_details})
                                    }} value={this.state.customer_details.phone} />
                                </View>
                                <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.state.disableButton? {} : this.saveContact()}>
                                    <Text style = {styles.submitButtonText}>{ this.state.disableButton ? vtranslate("Loading"): vtranslate("Save")}</Text>
                                </Button>
                            </View>
                        </View>
                    )
                }
            case 'company_details':
                if(this.state.company_details){
                    let accountDetails = this.state.company_details;
                    return ( 
                        <View style={styles.box}>
                            <View>
                                <Image alt="Contact Picture" style={{width: '100%'}} source={{uri: accountDetails.imagetype+';base64,'+accountDetails.imagedata}}/>
                            </View>
                            <View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Name")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                            if(value.length<1){
                                                alert(vtranslate('The field "{0}" is mandatory.').replace("{0}",vtranslate("Name")));
                                            }
                                        this.state.company_details.accountname = value;
                                        this.setState({'company_details':this.state.company_details})
                                    }} value={this.state.company_details.accountname} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Website")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        if(!String(value)
                                            .toLowerCase()
                                            .match(
                                                /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/
                                            )){
                                            alert(vtranslate('Please enter a valid Url.'));
                                        }
                                        this.state.company_details.website = value;
                                        this.setState({'company_details':this.state.company_details})
                                    }} value={this.state.company_details.website} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Email")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        if(!String(value)
                                            .toLowerCase()
                                            .match(
                                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                            )){
                                            alert(vtranslate('Please enter a valid E-mail address.'));
                                        }
                                        this.state.company_details.email1 = value;
                                        this.setState({'company_details':this.state.company_details})
                                    }} value={this.state.company_details.email1} />
                                </View>
                                <View style={styles.detail}>
                                    <Text style={{ ...styles.label, ...{ 
                                        left : this.state.lang=='fa_ir'?'50%':0,
                                        right : this.state.lang=='fa_ir'?0:'50%' }}}>{vtranslate("Phone")}</Text>
                                    <TextInput style={{ ...styles.value, ...{ 
                                        left : this.state.lang=='fa_ir'?0:'50%',
                                        right : this.state.lang=='fa_ir'?'50%':0 }}} onChangeText={(value) => {
                                        this.state.company_details.phone = value;
                                        this.setState({'company_details':this.state.company_details})
                                    }} value={this.state.company_details.phone} />
                                </View>
                                <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.state.disableButton? {} : this.saveAccont()}>
                                    <Text style = {styles.submitButtonText}>{ this.state.disableButton ? vtranslate("Loading"): vtranslate("Save")}</Text>
                                </Button>
                            </View>
                        </View>
                    )
                }
        }
        return null;
    }

    setIndex = (index) =>{
        this.setState({ 'index': index });
        this.setState({ 'partials': this.state.routes[index]['key'] });
    }

    render() {
        if(this.state.profile){
            return (
                <View>
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

let styles = StyleSheet.create({
    BottomNavigation : {
        top : 0,
        margin : 15 
    },
    detail:{
        width: Dimensions.get('window').width ,
        marginBottom : 5,
        marginTop : 5,
        height : 50
    },
    label:{
        width : "50%",
        padding : 5,
        textAlign : 'center',
        position : "absolute",
        color : '#999'
    },
    value:{
        width : "50%",
        padding : 5,
        textAlign : 'center',
        position : "absolute",
        color : '#428bca',
    },
    box:{
        borderTopWidth : 2,
        borderTopColor : '#999',
        paddingTop :15
    },
    TextStatusSave:{
        backgroundColor :'#5cb85c',
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#fff',
        padding : 5,
        margin : 5
    },
    submitButtonText : {
        color : "#000"
    }
})