
import base64 from 'react-native-base64'

let language_select = 'en_us';
let url_base = 'http://www.mahdibagherivar.ir/vt7/modules/CustomerPortal/api.php';
// let url_base = 'http://mahdivar.a-web.ir/modules/CustomerPortal/api.php';

let languages = {
    'fa_ir' :  require('../i18n/fa_ir.json'),
    'en_us' :  require('../i18n/en_us.json'),
    'de_de' :  require('../i18n/de_de.json'),
    'pt_br' :  require('../i18n/pt_br.json'),
    'fr_fr' :  require('../i18n/fr_fr.json'),
    'tr_tr' :  require('../i18n/tr_tr.json'),
    'es_es' :  require('../i18n/es_es.json'),
    'nl_nl' :  require('../i18n/nl_nl.json'),
    'zh_cn' :  require('../i18n/zh_cn.json'),
    'zh_tw' :  require('../i18n/zh_tw.json')
}

var isJsonParsable = (string) => {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

async function api(details,encoded_base64) {
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return await(
        await fetch(url_base, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Authorization': 'Basic '+encoded_base64,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
        }).then(response => {
            try{
                var result = response.json();
                return result;
            }catch(error){
                return error;
            }
        })
        .catch(error => {return error;})
    );
}

export const uploadAttachment = async(user_name,password,data) => {
    
    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);
    return await(
        await fetch(url_base, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Authorization': 'Basic '+encoded_base64,
                'Content-Type': 'multipart/form-data;charset=UTF-8'
            },
            body: data
        }).then(response => {
            try{
                var result = response.json();
                return result;
            }catch(error){
                return error;
            }
        })
        .catch(error => {return error;})
    );
}

export const vtranslate = (string ) => {

    const language_translate = languages[language_select];

    if(language_translate.hasOwnProperty(string)){
        return language_translate[string];
    }else{
        return string;
    }
}

export const updateLang = (lang) => {
    language_select = lang;
}

export const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export const formatTime = (date) => {
    var d = new Date(date),
        hours = '' + (d.getHours()),
        minutes = '' + d.getMinutes();
        // seconds = d.getSeconds();

    return [hours, minutes].join(':');
}

export const  ping = async (user_name,password) => {

    var details = {
        '_operation': 'Ping',
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        return(vtranslate(result['error']['message']));
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  && result['result'] == 'login success') {
        return("login :) ");
    } else {
        return(JSON.stringify(result));
    }

}



export const  fetchModules = async (user_name,password) => {

    var details = {
        '_operation': 'FetchModules',
        'language' : language_select,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if(result.hasOwnProperty('result') && result.hasOwnProperty('success') && result['success']==true){
        return result['result'];
    }else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchCompanyTitle = async (user_name,password) => {

    var details = {
        '_operation': 'FetchCompanyTitle',
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchRecentRecords = async (user_name,password) => {

    var details = {
        '_operation': 'FetchRecentRecords',
        'language' : language_select,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchAnnouncement = async (user_name,password) => {

    var details = {
        '_operation': 'FetchAnnouncement',
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return '';
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result']['announcement'];
    } else {
        alert(JSON.stringify(result));
        return '';
    }

}



export const  fetchShortcuts = async (user_name,password) => {

    var details = {
        '_operation': 'FetchShortcuts',
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}


export const  describeModule = async (user_name,password,module) => {

    var details = {
        '_operation': 'DescribeModule',
        'module' : module,
        'language' : language_select,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchReferenceRecords = async (user_name,password,module,query) => {

    var details = {
        '_operation': 'FetchReferenceRecords',
        'module' : module,
        'language' : language_select,
        'searchKey' : query,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchRecords = async (user_name,password,module, label, q, filter , pageNo, pageLimit, orderBy, order ) => {

    var details = {
        '_operation' : 'FetchRecords',
		'module' : module,
		'moduleLabel' : label,
		'page' : pageNo,
		'pageLimit' : pageLimit,
		'fields' : filter,
		'orderBy' : orderBy,
		'order' :order,
		'username' : user_name,
		'password': password
    };

    details = {...details, ...q};

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return {count :0};
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return  {count :0};
    }

}

export const  saveRecord = async (user_name,password,module,values,recordId) => {

    var details = {
        '_operation': 'SaveRecord',
        'module' : module,
        'values' : values,
        'username' : user_name,
        'password' : password
    };

    if(recordId){
        details['recordId']=recordId;
    }

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchRelatedModules = async (user_name,password,module) => {

    var details = {
        '_operation': 'FetchRelatedModules',
        'module' : module,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchRecord = async (user_name,password,id,module,parentId) => {

    var details = {
        '_operation': 'FetchRecord',
        'module' : module,
        'recordId' : id,
        'parentId' : parentId,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchHistory = async (user_name,password,module,id,pageNo, pageLimit,parentId) => {

    var details = {
        '_operation': 'FetchHistory',
        'record' : id,
        'module' : module,
        'page' : pageNo,
        'pageLimit' : pageLimit,
        'parentId' : parentId,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  fetchRelatedRecords = async (user_name,password,relatedModule, relatedModuleLabel,id,parentId,pageNo, pageLimit,module) => {

    var details = {
        '_operation': 'FetchRelatedRecords',
        'recordId' : id,
        'module' : module,
        'page' : pageNo,
        'pageLimit' : pageLimit,
        'parentId' : parentId,
        'username' : user_name,
        'password' : password,
        'relatedModule' : relatedModule,
        'relatedModuleLabel' : relatedModuleLabel
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  downloadFile = async (user_name,password,module, q, parentId, parentModule, attachmentId) => {

    var details = {
        '_operation' : 'DownloadFile',
        'module' : module,
        'moduleLabel' : module,
        'recordId' : q,
        'parentId' : parentId,
        'parentModule' : parentModule,
        'attachmentId' : attachmentId,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  addComment = async (user_name,password,values, parentId) => {

    var details = {
        '_operation' : 'AddComment',
        'values' : values,
        'parentId' : parentId,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  searchFaqs = async (user_name,password,module, searchKey) => {

    var details = {
        '_operation' : 'SearchFaqs',
        'module' : module,
        'searchKey' : searchKey,
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if (result.hasOwnProperty('success') && result.hasOwnProperty('result') && result['success']==true  ) {
        return result['result'];
    } else {
        alert(JSON.stringify(result));
        return false;
    }

}


export const  fetchProfile = async (user_name,password) => {

    var details = {
        '_operation': 'FetchProfile',
        'username' : user_name,
        'password' : password
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if(result.hasOwnProperty('result') && result.hasOwnProperty('success') && result['success']==true){
        return result['result'];
    }else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  changePassword = async (user_name,password,oldPassword,newPassword) => {

    var details = {
        '_operation' : 'ChangePassword',
        'password' : oldPassword,
        'newPassword' : newPassword,
        'username' : user_name
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if(result.hasOwnProperty('result') && result.hasOwnProperty('success') && result['success']==true){
        return result['result'];
    }else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  searchRecords = async (user_name,password,searchKey) => {

    var details = {
        '_operation' : 'SearchRecords',
        'searchKey' : searchKey,
        'password' : password,
        'username' : user_name
    };

    var text = user_name+":"+password;
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if(result.hasOwnProperty('result') && result.hasOwnProperty('success') && result['success']==true){
        return result['result'];
    }else {
        alert(JSON.stringify(result));
        return false;
    }

}

export const  forgotPassword = async (email) => {

    var details = {
        '_operation' : 'ForgotPassword',
        'email' : email
    };

    var text = email+": ";
    var encoded_base64 = base64.encode(text);

    var result = await api(details,encoded_base64);

    if (result.hasOwnProperty('error') && result['error'].hasOwnProperty('message') ){
        alert(vtranslate(result['error']['message']));
        return false;
    }else if(result.hasOwnProperty('result') && result.hasOwnProperty('success') && result['success']==true){
        alert(vtranslate(result['result']))
        return result['result'];
    }else {
        alert(JSON.stringify(result));
        return false;
    }

}