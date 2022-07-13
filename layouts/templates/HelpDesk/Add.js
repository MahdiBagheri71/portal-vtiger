import React from 'react';
import {View, Text, StyleSheet, TextInput, ScrollView, Switch  } from 'react-native'
import { Button, Divider } from 'react-native-paper';
import {vtranslate,describeModule,formatDate} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';
import ValidationComponent from 'react-native-form-validator';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';

import '../../../global.js' 

class Add extends ValidationComponent {

    state = {
        PortalVtigerEmail: '',
        PortalVtigerPassword: '',
        PortalVtigerDisableButton : false,
        PortalVtigerDescribeModule : {},
        PortalVtigerData : {},
        PortalVtigerValidate : {}
    }

    constructor(props) {
        super(props);
        this.deviceLocale = "me"
        this.messages = {
            me: {
                required: vtranslate('The field "{0}" is mandatory.'),
                email: vtranslate("Please enter a valid E-mail address."),
                numbers: vtranslate("Please enter integer value."),
                date: vtranslate("Please enter a valid date."),
                int: vtranslate("Please enter a integer value."),
                currency: vtranslate("Please enter positive numbers."),
                url: vtranslate("Please enter a valid Url."),
            }
        };
    
        this.rules['int'] =  /^[\-\+\ ]?\d+$/;
        this.rules['currency'] =  /^\d*\.?\d*$/;
        this.rules['url'] =  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/;
    }
      
    _onSubmit() {
        
        // this.validate(this.state.PortalVtigerValidate);
        // alert(JSON.stringify(this.state.PortalVtigerValidate))
        this.validate(this.state.PortalVtigerValidate);
        if(this.getErrorMessages()){
            alert(this.getErrorMessages())
        }else{

            alert(JSON.stringify(this.state.PortalVtigerData))
        }
    }

    setStateME = (obj)=>{
        this.setState(obj, () => {
            this.validate(this.state.PortalVtigerValidate);
        });
    }
    

    componentDidMount = async () => {

        await AsyncStorage.getItem('email').then((value) => {
            if(value){
                this.setStateME({ 'PortalVtigerEmail': value })
            }
        })
        await AsyncStorage.getItem('password').then((value) => {
            if(value){
                this.setStateME({ 'PortalVtigerPassword': value })
            }
        })

        let email =this.state.PortalVtigerEmail
        let pass = this.state.PortalVtigerPassword;
        if(email && pass ){
            var describe_module = await describeModule(email,pass,"HelpDesk") ;
            this.setStateME({ 'PortalVtigerDescribeModule': describe_module});
            
            if(describe_module['describe'] && describe_module['describe']['fields'] ){
                var data = {};
                var dataValidate = {};
                {Object.entries(describe_module['describe']['fields']).map((fields ) => {
                    let field = fields[1];
                    if (field.name !== 'contact_id' && field.name !== 'parent_id' && field.name !== 'assigned_user_id' && field.name !== 'related_to' && field.editable ) {

                        if (field.type.name == 'string' ||  field.type.name == 'phone' || field.type.name == 'skype' || field.type.name == 'url' || field.type.name === "text"
                        || field.type.name == 'email' || field.type.name == 'integer' || field.type.name == 'double' || field.type.name == 'currency') {
                            data[ field.name ] = field.default;
                            this.setStateME({  [field.name]: field.default});
                        }
                        if (field.type.name == 'boolean') {
                            if (field.default == "on") {
                                data[ field.name ] = true;
                                this.setStateME({  [field.name]: true});
                            } else {
                                data[ field.name ] = false;
                                this.setStateME({  [field.name]: false});
                            }
                        }

                        if (field.type.name == 'time') {
                            var date = new Date();
                            if (field.default !== '') {
                                var defaultTime = field.default.split(':');
                                date.setHours(defaultTime[ 0 ]);
                                date.setMinutes(defaultTime[ 1 ]);
                            } 
                            data[ field.name ] = date;
                            this.setStateME({  [field.name]: date});
                        }

                        if (field.type.name == 'date' ) {
                            if (!isNaN(field.default)) {
                                var date = new Date();
                                data[ field.name ] = formatDate(date);
                                this.setStateME({  [field.name]: date});
                            } else {
                                data[ field.name ] = formatDate(field.default);
                                this.setStateME({  [field.name]: field.default});
                            }
                        }

                        if (field.type.name == 'multipicklist') {
                            var defaultValues = [];
                            if (field.default !== null) {
                                defaultValues = field.default.split(' |##| ');
                            }
                            var selectedValues = [];
                            if (defaultValues.length !== 0) {
                                defaultValues.map( (values, i) => {
                                    selectedValues.push(values);
                                });
                            }
                            data[ field.name ] = selectedValues.join(' |##| ');
                            this.setStateME({  [field.name]: selectedValues});

                        }

                        if (field.type.name == 'picklist' ) {
                            var continueLoop = true;
                            var defaultValue = field.default;
                            field.type.picklistValues.map( (pickList, i) => {
                                if (continueLoop) {
                                    if (defaultValue !== '' && pickList.value == defaultValue) {
                                        field.value = field.type.picklistValues[ i ];
                                        field.index = i;
                                        continueLoop = false;
                                    } else if (defaultValue === '') {
                                        field.value = field.type.picklistValues[ i ];
                                        field.defaultIndex = i;
                                        continueLoop = false;
                                    }
                                }
                            });
                            if (field.index === undefined) {
                                data[ field.name ] = field.type.picklistValues[ 0 ].value;
                            } else {
                                data[ field.name ] = field.type.picklistValues[ field.index ].value;
                            }
                            this.setStateME({  [field.name]: data[ field.name ]});
                        }

                        if (field.type.name == 'string' ||  field.type.name == 'phone' || field.type.name == 'skype' || field.type.name === "text") {
                            dataValidate[field.name] = {required: field.mandatory};
                        }
    
                        if (field.type.name == 'url' ) {
                            dataValidate[field.name] = { required: field.mandatory , url :true};
                        }
    
                        if (field.type.name == 'integer' ) {
                            dataValidate[field.name] = { required: field.mandatory , int :true};
                        }
    
                        if ( field.type.name == 'double') {
                            dataValidate[field.name] = { numbers: true , required: field.mandatory};
                        }
    
                        if ( field.type.name == 'currency') {
                            dataValidate[field.name] = {  required: field.mandatory ,currency:true};
                        }
    
                        if (field.type.name == 'boolean') {
                            dataValidate[field.name] = {required: field.mandatory};
                        }
    
                        if (field.type.name == 'email') {
                            dataValidate[field.name] = {email: true,required: field.mandatory};
                        }
    
                        if (field.type.name == 'time') {
                            dataValidate[field.name] = {date: 'HH:MM:SS',required: field.mandatory};
                        }
    
                        if (field.type.name == 'date' ) {
                            dataValidate[field.name] = {date: 'YYYY-MM-DD',required: field.mandatory};
                        }
    
                        if (field.type.name == 'multipicklist') {
                            dataValidate[field.name] = {required: field.mandatory};
                        }
    
                        if (field.type.name == 'picklist' ) {
                            dataValidate[field.name] = {required: field.mandatory};
                        }
    

                    }
                })} 
                this.setStateME({ 'PortalVtigerData': data});
                this.setStateME({ 'PortalVtigerValidate': dataValidate});
                this.validate(dataValidate);
            }
        }


    }

    setValueData = (field,value,type)=>{
        var data = this.state.PortalVtigerData;
        if(type == 'multipicklist'){
            data[ field ] = value.join(" |##| ");
        }else{
            data[ field ] = value;
        }
        this.setStateME({  [field]: value});
        this.setStateME({ 'PortalVtigerData': data});
    }

    close = () => {
        this.props.investmentHandler();
    }

    render() {
        var describeModule = this.state.PortalVtigerDescribeModule;
        if(describeModule['describe'] && describeModule['describe']['fields']){
            return (
                <ScrollView style = {styles.Modal}>
                    <Text style = {styles.HeaderText}>
                        {vtranslate('Add New Ticket')}
                    </Text>
                    
                    <Divider style = {styles.Divider} /> 
                    
                    <View style={styles.mainBody}>
                            
                            <View>
                                <View>
                                    {Object.entries(describeModule['describe']['fields']).sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1).map((fields ) => {
                                        let field = fields[1];
                                        if (field.name !== 'contact_id' && field.name !== 'parent_id' && field.name !== 'assigned_user_id' && field.name !== 'related_to' && field.editable && field.type.name !== "text") {
                                            if (field.type.name == 'picklist' ) {
                                                return (
                                                    <View key={field.name}>
                                                        {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                        <Picker selectedValue = {this.state[ field.name ]} onValueChange = {(val) => this.setValueData(field.name,val,'picklist')}>
                                                            {(field.type.picklistValues).map((picklistValue ) => {
                                                                return (<Picker.Item key={picklistValue.label} label = {picklistValue.label} value = {picklistValue.value} />);
                                                            })}
                                                        </Picker>
                                                        {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                    </View>
                                                )
                                            }else if (field.type.name == 'multipicklist' ) {
                                                return (
                                                    <View key={field.name}>
                                                        {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                        <View style = {{alignItems: "center",justifyContent: "center"}}>
                                                            <ScrollView horizontal={true} >
                                                                <MultiSelect
                                                                    items={field.type.picklistValues}
                                                                    uniqueKey="value"
                                                                    displayKey="label"
                                                                    ref={(component) => { this.multiSelect = component }}
                                                                    onSelectedItemsChange={(val) => this.setValueData(field.name,val,'multipicklist')}
                                                                    selectedItems={this.state[ field.name ]}
                                                                    selectText=""
                                                                    searchInputPlaceholderText=""
                                                                    tagRemoveIconColor="#CCC"
                                                                    tagBorderColor="#CCC"
                                                                    tagTextColor="#CCC"
                                                                    selectedItemTextColor="#CCC"
                                                                    selectedItemIconColor="#CCC"
                                                                    itemTextColor="#000"
                                                                    searchInputStyle={{ color: '#CCC' }}
                                                                    submitButtonColor="#CCC"
                                                                    submitButtonText={vtranslate("Submit")}
                                                                />
                                                            </ScrollView>
                                                        </View>
                                                        {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                    </View>
                                                )
                                            }else if (field.type.name == 'boolean' ) {
                                                return (
                                                    <View key={field.name}>
                                                        {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                        <View style = {{alignItems: "center",justifyContent: "center"}}>
                                                            <Switch 
                                                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                                                thumbColor={this.state[ field.name ] ? "#f5dd4b" : "#f4f3f4"}
                                                                ios_backgroundColor="#3e3e3e"
                                                                onValueChange={(val) => this.setValueData(field.name,val,'boolean')}
                                                                value={this.state[ field.name ]}
                                                            />
                                                        </View>
                                                        {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                    </View>
                                                )
                                            }else if (field.type.name == 'date' ) {
                                                return (
                                                    <View key={field.name}>
                                                        {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                        <View style = {{alignItems: "center",justifyContent: "center"}}>
                                                        {/* <DatePicker date={this.state[ field.name ]} onDateChange={(val) => this.setValueData(field.name,val,'date')} /> */}
                                                        </View>
                                                        {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                    </View>
                                                )
                                            }else{
                                                return (
                                                    <View key={field.name}>
                                                        {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                        <TextInput style = {styles.inputText} ref={field.name} onChangeText={(val) => this.setValueData(field.name,val,'string')} value={this.state[ field.name ]} />
                                                        {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                    </View>
                                                )
                                            }
                                        }
                                    })} 
                                </View>
                                
                                <View>
                                    {Object.entries(describeModule['describe']['fields']).sort((a, b) => Number(a[0]) > Number(b[0]) ? 1 : -1).map((fields ) => {
                                        let field = fields[1];
                                        if (field.type.name === "text" && field.editable) {
                                            return (
                                                <View key={field.name}>
                                                    {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                    <TextInput multiline={true} style = {styles.inputTextArea} ref={field.name} onChangeText={(val) => this.setValueData(field.name,val,'string')} value={this.state[ field.name ]} />
                                                    {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                </View>
                                            )
                                        }
                                    })} 
                                </View>
                            </View>
                            {/* <Text>
                                {this.getErrorMessages()}
                            </Text> */}
                    </View>

                    <Divider style = {styles.Divider} /> 
                                    
                    <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.state.PortalVtigerDisableButton? {} : this._onSubmit()}>
                        <Text style = {styles.submitButtonText}>{vtranslate("Save")}</Text>
                    </Button>
                    <Button style = {styles.submitButtonCancel} color={"#000"} onPress={() => this.close()}><Text style = {styles.submitButtonText}>{vtranslate("Cancel")}</Text></Button>
                </ScrollView> 
            )
        }
        return null;
    }
}

export default Add

const styles = StyleSheet.create({
    Modal:{
        padding : 15,
        marginTop : 25
    },
    HeaderText:{
        textAlign : 'center',
        color : "#000",
        fontSize : 20
    },
    Divider:{
       padding : 1 ,
       margin : 5
    },
    submitButtonCancel : {
        borderRadius : 5,
        textAlign : 'center',
        width : 'auto',
        color : '#333',
        padding : 5,
        margin : 5,
        borderWidth :1 ,
        borderColor : '#adadad',
        marginBottom : 25
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
    mainBody: {
        justifyContent: 'center',
        padding: 25,
        color : '#000'
    },
    stare : {
        color : "#a94442"
    },
    inputText: {
        textAlign :  'center',
        margin: 20,
        height: 40,
        borderColor: color_bg,
        borderWidth: 1,
        padding : 10
    },
    inputTextArea:{
        margin: 20,
        borderColor: color_bg,
        borderWidth: 1,
        padding : 10
    },
    error:{
        color : "#a94442",
        paddingBottom : 10
    }
});