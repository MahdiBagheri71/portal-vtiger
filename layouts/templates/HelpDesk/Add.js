import React from 'react';
import {View, Text, StyleSheet, TextInput, ScrollView, Switch  } from 'react-native'
import { Button, Divider,ActivityIndicator } from 'react-native-paper';
import {vtranslate,describeModule,formatDate,formatTime,fetchReferenceRecords,saveRecord} from '../../../Functions/Portal' ;
import AsyncStorage from '@react-native-async-storage/async-storage';
import ValidationComponent from 'react-native-form-validator';
import { MultiSelect,Dropdown  } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';

import '../../../global.js' 

class Add extends ValidationComponent {

    state = {
        PortalVtigerEmail: '',
        PortalVtigerPassword: '',
        PortalVtigerDisableButton : false,
        PortalVtigerDescribeModule : {},
        PortalVtigerData : {},
        PortalVtigerValidate : {},
        PortalVtigerDateTimeShow : {},
        PortalVtigerRefersTo : {},
        PortalVtigerModule : "HelpDesk"
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
      
    _onSubmit = async() => {

        if(this.state.PortalVtigerDisableButton){
            return;
        }
        this.state.PortalVtigerDisableButton = true;
        this.setStateME({ 'PortalVtigerDisableButton': true });
        this.validate(this.state.PortalVtigerValidate);
        if(this.getErrorMessages()){
            alert(this.getErrorMessages());
            this.setStateME({ 'PortalVtigerDisableButton': false });
            return ;
        }else{
            let email =this.state.PortalVtigerEmail
            let pass = this.state.PortalVtigerPassword;
            var data =JSON.stringify(this.state.PortalVtigerData);
            var result = await saveRecord(email,pass,this.state.PortalVtigerModule,data,false);
            if(result["record"] && result["record"]['id']){
                AsyncStorage.setItem('record_id', result["record"]['id']);
                AsyncStorage.setItem('parent_id', '');
            }
            AsyncStorage.setItem('module', this.state.PortalVtigerModule);
            this.props.investmentHandler();
            this.setStateME({ 'PortalVtigerDisableButton': false });
            return result;
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
            var describe_module = await describeModule(email,pass,this.state.PortalVtigerModule) ;
            this.setStateME({ 'PortalVtigerDescribeModule': describe_module});
            
            if(describe_module['describe'] && describe_module['describe']['fields'] ){
                var data = {};
                var dataValidate = {};
                var dateField = {};
                var refersTo = {};
                
                {Object.entries(describe_module['describe']['fields']).map(async (fields ) => {
                    let field = fields[1];
                    if (field.name !== 'contact_id' && field.name !== 'parent_id' && field.name !== 'assigned_user_id' && field.name !== 'related_to' && field.editable ) {

                        if (field.type.name == 'string' ||  field.type.name == 'phone' || field.type.name == 'skype' || field.type.name == 'url' || field.type.name === "text"
                        || field.type.name == 'email' || field.type.name == 'integer' || field.type.name == 'double' || field.type.name == 'currency') {
                            data[ field.name ] = field.default;
                            this.setStateME({  [field.name]: field.default});
                        }else if (field.type.name == 'boolean') {
                            if (field.default == "on") {
                                data[ field.name ] = true;
                                this.setStateME({  [field.name]: true});
                            } else {
                                data[ field.name ] = false;
                                this.setStateME({  [field.name]: false});
                            }
                        }else if (field.type.name == 'time') {
                            var date = new Date();
                            if (field.default !== '') {
                                var defaultTime = field.default.split(':');
                                date.setHours(defaultTime[ 0 ]);
                                date.setMinutes(defaultTime[ 1 ]);
                            } 
                            data[ field.name ] = formatTime(date);
                            dateField [field.name] = false;
                            this.setStateME({  [field.name]: date});
                        }else if (field.type.name == 'date' ) {
                            if (!isNaN(field.default)) {
                                var date = new Date();
                                data[ field.name ] = formatDate(date);
                                this.setStateME({  [field.name]: date});
                            } else {
                                var date = new Date(field.default);
                                data[ field.name ] = formatDate(date);
                                this.setStateME({  [field.name]: date});
                            }
                            dateField [field.name] = false;
                        }else if (field.type.name == 'multipicklist') {
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

                        }else if (field.type.name == 'picklist' ) {
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
                        }else if (field.type.name == 'reference') {

                            if(field.type.refersTo && field.type.refersTo[0]){
                                let module_name = field.type.refersTo[0];
                                refersTo[ field.name ] = await fetchReferenceRecords(email,pass,module_name,"") ;
                            }
                            
                            data[ field.name ] = field.default;
                            this.setStateME({  [field.name]: field.default});

                        }else {
                            data[ field.name ] = field.default;
                            this.setStateME({  [field.name]: field.default});
                        }

                        if (field.type.name == 'string' ||  field.type.name == 'phone' || field.type.name == 'skype' || field.type.name === "text") {
                            dataValidate[field.name] = {required: field.mandatory};
                        }else if (field.type.name == 'url' ) {
                            dataValidate[field.name] = { required: field.mandatory , url :true};
                        }else if (field.type.name == 'integer' ) {
                            dataValidate[field.name] = { required: field.mandatory , int :true};
                        }else if ( field.type.name == 'double') {
                            dataValidate[field.name] = { numbers: true , required: field.mandatory};
                        }else if ( field.type.name == 'currency') {
                            dataValidate[field.name] = {  required: field.mandatory ,currency:true};
                        }else if (field.type.name == 'boolean') {
                            dataValidate[field.name] = {required: field.mandatory};
                        }else if (field.type.name == 'email') {
                            dataValidate[field.name] = {email: true,required: field.mandatory};
                        }else if (field.type.name == 'time') {
                            dataValidate[field.name] = {date: 'HH:MM:SS',required: field.mandatory};
                        }else if (field.type.name == 'date' ) {
                            dataValidate[field.name] = {date: 'YYYY-MM-DD',required: field.mandatory};
                        }else if (field.type.name == 'multipicklist') {
                            dataValidate[field.name] = {required: field.mandatory};
                        }else if (field.type.name == 'picklist' ) {
                            dataValidate[field.name] = {required: field.mandatory};
                        }else{
                            dataValidate[field.name] = {required: field.mandatory};
                        }
    

                    }
                })} 
                this.setStateME({ 'PortalVtigerData': data});
                this.setStateME({ 'PortalVtigerValidate': dataValidate});
                this.setStateME({ 'PortalVtigerDateTimeShow': dateField});
                this.setStateME({ 'PortalVtigerRefersTo': refersTo});
                
                this.validate(dataValidate);
            }
        }


    }

    setValueData = (field,value,type)=>{
        var data = this.state.PortalVtigerData;
        if(type == 'multipicklist'){
            data[ field ] = value.join(' |##| ');
        }else if(type == 'date'){
            data[ field ] = formatDate(value);
        }else if(type == 'time'){
            data[ field ] = formatTime(value);
        }else{
            data[ field ] = value;
        }
        this.setStateME({  [field]: value});
        this.setStateME({ 'PortalVtigerData': data});
    }

    close = () => {
        this.props.investmentHandler();
    }

    showDateTimeField = (field) =>{
        var data = this.state.PortalVtigerDateTimeShow;
        data[ field ] = true;
        this.setStateME({ 'PortalVtigerDateTimeShow': data});

    }

    render() {
        var describeModule = this.state.PortalVtigerDescribeModule;
        return (
            <ScrollView style = {styles.Modal} nestedScrollEnabled={true}>
                <Text style = {styles.HeaderText}>
                    {vtranslate('Add New Ticket')}
                </Text>
                
                <Divider style = {styles.Divider} /> 
                {(describeModule['describe'] && describeModule['describe']['fields'])?
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
                                                                <Dropdown
                                                                    style={styles.dropdown}
                                                                    placeholderStyle={styles.placeholderStyle}
                                                                    selectedTextStyle={styles.selectedTextStyle}
                                                                    inputSearchStyle={styles.inputSearchStyle}
                                                                    iconStyle={styles.iconStyle}
                                                                    data={[{"label": vtranslate("Select an Option"),"value": ''}].concat(field.type.picklistValues)}
                                                                    search
                                                                    maxHeight={300}
                                                                    labelField="label"
                                                                    valueField="value"
                                                                    placeholder={vtranslate("Select item")}
                                                                    searchPlaceholder={vtranslate("Search...")}
                                                                    value={this.state[ field.name ]}
                                                                    onChange={item => {
                                                                        this.setValueData(field.name,item.value,'picklist');
                                                                    }}
                                                                    renderLeftIcon={() => (
                                                                        <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                                                                    )}
                                                                    />
                                                                {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                            </View>
                                                        )
                                                    }else if (field.type.name == 'multipicklist' ) {
                                                        return (
                                                            <View key={field.name}>
                                                                {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                                <MultiSelect
                                                                    style={styles.dropdown}
                                                                    placeholderStyle={styles.placeholderStyle}
                                                                    selectedTextStyle={styles.selectedTextStyle}
                                                                    inputSearchStyle={styles.inputSearchStyle}
                                                                    iconStyle={styles.iconStyle}
                                                                    search
                                                                    data={field.type.picklistValues}
                                                                    labelField="label"
                                                                    valueField="value"
                                                                    placeholder={vtranslate("Select item")}
                                                                    searchPlaceholder={vtranslate("Search...")}
                                                                    value={this.state[ field.name ]}
                                                                    onChange={(val) => this.setValueData(field.name,val,'multipicklist')}
                                                                    renderLeftIcon={() => (
                                                                        <AntDesign
                                                                        style={styles.icon}
                                                                        color="black"
                                                                        name="Safety"
                                                                        size={20}
                                                                        />
                                                                    )}
                                                                    selectedStyle={styles.selectedStyle}
                                                                            />
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
                                                                <Button  style = {styles.submitButtonCancel} onPress={()=>this.showDateTimeField(field.name)}>
                                                                    <Text style = {styles.submitButtonText}>{this.state.PortalVtigerData[ field.name ]}</Text>
                                                                </Button>
                                                                {this.state.PortalVtigerDateTimeShow[field.name] && (
                                                                    <DateTimePicker
                                                                        value={this.state[ field.name ]}
                                                                        mode='date'
                                                                        is24Hour={true}
                                                                        display="default"
                                                                        onChange={(event, selectedDate)=>{this.state.PortalVtigerDateTimeShow[field.name] = false ;this.setValueData(field.name,selectedDate,'date')}}
                                                                        />
                                                                )}
                                                                {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                            </View>
                                                        )
                                                    }else if (field.type.name == 'time' ) {
                                                        return (
                                                            <View key={field.name}>
                                                                {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                                
                                                                <Button  style = {styles.submitButtonCancel} onPress={()=>this.showDateTimeField(field.name)}>
                                                                    <Text style = {styles.submitButtonText}>{this.state.PortalVtigerData[ field.name ]}</Text>
                                                                </Button>
                                                                {this.state.PortalVtigerDateTimeShow[field.name] && (
                                                                    <DateTimePicker
                                                                        value={this.state[ field.name ]}
                                                                        mode='time'
                                                                        is24Hour={true}
                                                                        display="default"
                                                                        onChange={(event, selectedDate)=>{this.state.PortalVtigerDateTimeShow[field.name] = false ;this.setValueData(field.name,selectedDate,'time')}}
                                                                        />
                                                                )}
                                                                {this.isFieldInError(field.name) && this.getErrorsInField(field.name).map(errorMessage => <Text key={errorMessage} style={styles.error}>{errorMessage}</Text>)}
                                                            </View>
                                                        )
                                                    }else if (field.type.name == 'reference' ) {
                                                        return (
                                                            <View key={field.name}>
                                                                {field.mandatory?<Text style = {styles.stare}>{field.label} * : </Text>:<Text>{field.label} : </Text>}
                                                                {this.state.PortalVtigerRefersTo[field.name] ?<Dropdown
                                                                    style={styles.dropdown}
                                                                    placeholderStyle={styles.placeholderStyle}
                                                                    selectedTextStyle={styles.selectedTextStyle}
                                                                    inputSearchStyle={styles.inputSearchStyle}
                                                                    iconStyle={styles.iconStyle}
                                                                    data={this.state.PortalVtigerRefersTo[field.name]}
                                                                    search
                                                                    maxHeight={300}
                                                                    labelField="label"
                                                                    valueField="id"
                                                                    placeholder={vtranslate("Select item")}
                                                                    searchPlaceholder={vtranslate("Search...")}
                                                                    value={this.state[ field.name ]}
                                                                    onChange={item => {
                                                                        this.setValueData(field.name,item.id,'reference');
                                                                    }}
                                                                    renderLeftIcon={() => (
                                                                        <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                                                                    )}
                                                                    />:null}
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
                    :<View><Text style ={{textAlign:'center',padding : 25}}>{vtranslate("Loading")}</Text><ActivityIndicator style ={{textAlign:'center',padding : 25}} animating={true} color='#000' /></View>
                }
                <Divider style = {styles.Divider} /> 
                {(describeModule['describe'] && describeModule['describe']['fields'])?
                    <Button style = {styles.TextStatusSave} color={"#fff"} onPress={() => this.state.PortalVtigerDisableButton? {} : this._onSubmit()}>
                        <Text style = {styles.submitButtonText}>{ this.state.PortalVtigerDisableButton ? vtranslate("Loading"): vtranslate("Save")}</Text>
                    </Button>
                :null}
                <Button style = {styles.submitButtonCancel} color={"#000"} onPress={() => this.close()}><Text style = {styles.submitButtonText}>{vtranslate("Cancel")}</Text></Button>
            </ScrollView> 
        )
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
    },
    dropdown: {
        height: 50,
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
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    icon: {
        marginRight: 5,
    },
    selectedStyle: {
        borderRadius: 12,
    },
    submitButtonText : {
        color : "#000"
    }
});