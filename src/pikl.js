/**
 * Created by altitude on 09/01/17.
 */
var Pikl = {
    Config: {
        targets:['div','span','p'],
        brackets:'{}',
        comments:'{..}',
        plugins: {
            translate: true,
            encode: false
        }
    },
    DateConditions:['day','month','year','hours','minutes','seconds'],
    Operators:['=','!=','>','<','<=','>='],
    Ajax:{
        params:['src','index','node','repeat']
    },
    Form:{
        closures:['select','button','form']
    },
    Index:{},
    Init:{
        Json:function(){
            /*
            find all json nodes form the source file and
            place them in a global object
             */
            $.ajax({
                url:'data/source.json',
                method:'GET',
                success:function(data){
                    $.each(data,function(key,value){
                        pi[key] = value;
                    })
                },error:function(){
                },complete:function(){
                    /*
                    ondce all indexes have been stored in the
                    Index object, we can start searching in the
                    html for Pikl template objects
                     */
                    Pikl.Init.Content('body','fr');
                }
            })
        },
        Content:function(node){
            function checkForLabel(obj){
                var labelObj = {},o;
                for(o in obj){
                    if(obj[o].indexOf('label')>-1){
                        labelObj.label = obj[o].replace('label=','');
                    }
                    if(obj[o].indexOf('name')>-1){
                        labelObj.name = obj[o].replace('name=','');
                    }
                }
                if(labelObj.label !== undefined){
                    return '<label for="'+labelObj.name+'">'+labelObj.label+'</label>';
                }
            }
            function genFormTag(obj,content){
                var formObject,formString,root,o,f;
                formObject = [];
                formString = '';
                for(o in obj){
                    formObject.push(obj[o].split('='));
                }
                for(f in formObject){
                    root = formObject[f];
                    formString += ' '+root[0]+'="'+root[1]+'"';
                }
                return '<form'+formString+'>'+content+'</form>';
            }
           var appendComma = false,targetObject={},targetBinding='',targetNode,targetContent,conditional,conditionType,conditionArgument,conditionCase={},t;
            node = node || 'body';
            $('tpl').each(function(){
                var keyString = '',formTagObject,formObject,itemCount,formItem,thisFormObjectType,f,o;
                targetBinding = $(this).attr('is');
                targetObject = pi[targetBinding];
                targetContent = $(this).html();
                if(targetBinding == 'form'){
                    formTagObject = $(this).text().replace('{@','').split('}')[0].split(',');
                    formObject = {};
                    itemCount = 1;
                    $('tpl[is="form"]').find('tpl').each(function(){
                        /*
                        collect form items within template
                         */
                        formItem = $(this).html().replace(/@/g,'').replace(/{/g,'').replace(/}/g,'').split(',');
                        formObject[itemCount] = formItem;
                        itemCount++;
                    });
                    var formString = '',obj,objFin;
                    for(f in formObject){
                        checkForLabel(formObject[f]);
                        obj = formObject[f];
                        formString += checkForLabel(obj) !== undefined ? checkForLabel(obj) : '';
                        formString += '<';
                        thisFormObjectType = obj[0];
                        for(o in obj){
                            objFin = obj[o].split('=');
                            if(objFin.length == 1){
                                //single object like name or disabled
                                formString += objFin[0]+' ';
                            }else{
                                if(objFin[0] !== 'label') {
                                    formString += objFin[0] + '="' + objFin[1] + '" ';
                                }else{

                                }
                            }
                        }
                        formString += $.inArray(thisFormObjectType,Pikl.Form.closures) > 1 ? '</'+thisFormObjectType+'>': '/>';
                    }
                    $('<div>' + genFormTag(formTagObject,formString) + '</div>').insertBefore($(this));
                    $(this).remove();
                }else if($(this).parent().attr('is') !== 'form'){
                    if (targetContent.indexOf('@') > -1) {
                        //we have functions
                        conditional = targetContent.split('@')[1].split('}')[0];
                        conditionType = conditional.split(' ')[0].replace(/,/g, '');
                        conditionArgument = conditional.indexOf('if') > -1 ? conditional.split('if')[1].trim() : '';
                        conditionCase.true = targetContent.replace(conditional, '').replace('{@}', '').split('{')[0];
                        if (targetContent.indexOf('{@else}') > -1) {
                            conditionCase.false = targetContent.replace(conditional, '').replace('{@}', '').split('{')[1].replace('@else}', '');
                        }
                        console.log(conditionType);
                        switch (conditionType) {
                            case 'if':
                                var dateUnit = Pikl.Assistants.Date();
                                if (conditionArgument.indexOf('and') > -1) {
                                    conditionArgument = conditionArgument.split('and');
                                }
                                for (var c in conditionArgument) {
                                    var calc = conditionArgument[c].trim();
                                    calc = calc.split(' ');
                                    for (var d in calc) {
                                        if ($.inArray(calc[d], Pikl.DateConditions) > -1) {
                                            if (Pikl.Assistants.Comparison(dateUnit[calc[d]], calc[1], parseInt(calc[2]))) {
                                                $('<div>' + conditionCase.true + '</div>').insertBefore($(this));
                                                $(this).remove();
                                            } else {
                                                $('<div>' + conditionCase.false + '</div>').insertBefore($(this));
                                                $(this).remove();
                                            }
                                        }
                                    }
                                }
                                break;
                            case 'calc':
                                var calcString = targetContent.replace('{@calc}', '').replace('{/calc}', '');
                                var calcMethod = calcString.split('{@')[1].split('}')[0];
                                var calcValues = calcString.split('{@' + calcMethod + '}');
                                $('<div>' + Pikl.Assistants.Calculate(calcValues[0], calcMethod, calcValues[1]) + '</div>').insertBefore($(this));
                                $(this).remove();
                                break;
                            case 'date':
                                var dateString = targetContent.replace('{@date}', '').replace('{/date}', '');
                                $('<div>' + Pikl.Assistants.Date(true) + '</div>').insertBefore($(this));
                                $(this).remove();
                                break;
                            case 'ajax':
                                var _this = this;
                                var ajaxString = targetContent.replace('{@ajax}', '').replace('{/ajax}', '');
                                var ajaxParams = ajaxString.split(',');
                                var ajaxObject = {};
                                var returnedData = '';
                                for (var p in ajaxParams) {
                                    var param = ajaxParams[p].split('=')[0].replace('}', '').replace('{', '').replace('@', '');
                                    var value = ajaxParams[p].split('=')[1].replace('}', '').replace('{', '').replace('@', '');
                                    if ($.inArray(param, Pikl.Ajax.params) > -1) {
                                        ajaxObject[param] = value;
                                    }
                                }
                                Pikl.Assistants.Ajax(ajaxObject).done(function (result) {
                                    result = ajaxObject.index !== undefined && ajaxObject.index !== '' ? result[ajaxObject.index] : result;
                                    if (ajaxObject.repeat == true || ajaxObject.repeat === 'true') {
                                        for (var r in result) {
                                            returnedData += ajaxObject.node !== undefined && ajaxObject.node !== '' ? result[r][ajaxObject.node] !== undefined ? result[r][ajaxObject.node] + ' ' : '' : result[r] + ' ';
                                        }
                                    }
                                    $('<div>' + returnedData + '</div>').insertBefore($(_this));
                                    $(_this).remove();
                                }).fail(function () {
                                    console.log('could not load json data');
                                });
                                break;
                        }
                    } else {
                        targetNode = $(this).html().replace(/}/g, '').replace(/{/g, '').replace('#comma', '');
                        appendComma = $(this).html().indexOf('{#comma}') > -1;
                        if (typeof targetObject == 'object') {
                            for (t in targetObject) {
                                keyString += targetObject[t][targetNode] !== undefined ? targetObject[t][targetNode] : ' ';
                                if (appendComma) {
                                    keyString += ', ';
                                }
                            }
                        }
                        keyString = keyString.trim();
                        keyString = keyString.slice(-1) == ',' ? keyString.substring(0, keyString.length - 1) : keyString;
                        $('<div>' + keyString + '</div>').insertBefore($(this));
                        $(this).remove();
                    }
                }
            });
        }
    },
    Assistants: {
        Ajax:function(obj){
            return $.ajax({
                url:obj.src,
                method:'GET'
            });
        },
        Date: function (string) {
            var currentData = new Date();
            var formatDate = {};
            formatDate['day'] = currentData.getDate();
            formatDate['month'] = currentData.getMonth() + 1;
            formatDate['year'] = currentData.getFullYear();
            formatDate['hours'] = currentData.getHours();
            formatDate['minutes'] = currentData.getMinutes();
            formatDate['seconds'] = currentData.getSeconds();
            if(string == true){
                return formatDate['month']+'/'+formatDate['day']+'/'+formatDate['year']+' '+formatDate['hours']+':'+formatDate['minutes']+':'+formatDate['seconds']
            }else{
                return formatDate;
            }
        },
        Comparison: function (a, b, c) {
            switch (b) {
                case '=':
                    return a == c;
                    break;
                case '!=':
                    return a !== c;
                    break;
                case '&gt;':
                    return a > c;
                    break;
                case '&lt;':
                    return a < c;
                    break;
                case '&gt;=':
                    return a >= c;
                    break;
                case '&lt;=':
                    return a <= c;
                    break;
            }
        },
        Calculate: function (a, b, c) {
            switch (b) {
                case 'times':
                    return a * c;
                    break;
                case 'divide':
                    return a / c;
                    break;
                case 'plus':
                    return a + c;
                    break;
                default:
                    return '';
                break;
            }
        }
    }
};
var $p = p = Pikl;
var pi = Pikl.Index;
var pij = Pikl.Init.Json();