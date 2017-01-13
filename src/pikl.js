/**
 * Created by altitude on 09/01/17.
 */
var Pikl = {
    Config: {
        defaults:{
            tplTag:{
                replacement:'div'
            }
        },
        targets:['div','span','p'],
        reserved:[
            {'\'':'&apos;'},
            {'\"':'&quote;'},
            {'\>':'&gt;'},
            {'\<':'&lt;'}
        ],
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
                    $p.Init.Content('body','fr');
                }
            })
        },
        Content:function(node){
            var appendComma = false, targetObject = {}, targetItem, targetBinding = '', targetNode, targetContent, keyString, layoutObjects, nodeContent, sliceText, objectIndex, calcString, calcMethod,
                calcValues, cleanObject, conditional, conditionType, conditionArgument, conditionCase = {}, dateString, toRemove, passContent, _this, ajaxString, ajaxParams, ajaxObject, returnedData, param, value,
                c, d, l, p, t, r;
            node = node || 'body';
            $('tpl').each(function(){
                keyString = '';
                targetBinding = $(this).attr('is');
                targetObject = pi[targetBinding];
                targetContent = $(this).html();
                targetItem = $(this);
                if(targetBinding == 'layout'){
                    layoutObjects = targetContent.split('--');
                    objectIndex = 0;
                    for(l in layoutObjects){
                        var objectLength = layoutObjects.length;
                        if(layoutObjects[l] !== undefined && layoutObjects[l] !== '') {
                            if(layoutObjects[l].indexOf('[')>-1 && layoutObjects[l].indexOf(']')>-1){
                                nodeContent = layoutObjects[l].split('[')[1].split(']')[0];
                                sliceText = {};
                                sliceText.start = layoutObjects[l].indexOf('[');
                                sliceText.end = layoutObjects[l].indexOf(']');
                                sliceText.content = nodeContent;
                                toRemove = layoutObjects[l].slice(sliceText.start,sliceText.end+1);
                                cleanObject = layoutObjects[l].replace(toRemove,'');
                            }else{
                                sliceText = {};
                                cleanObject = layoutObjects[l];
                            }
                            if(sliceText.content !== undefined && sliceText.content.indexOf(',') > -1){
                                passContent = sliceText.content.split(',');
                            }else{
                                passContent = sliceText.content;
                            }
                            if(layoutObjects[l].indexOf('*')>-1){
                                $($p.Assistants.TagBuilder(cleanObject.split('*')[0],cleanObject.split('*')[1],passContent)).insertBefore($(this));
                            }else{
                                $($p.Assistants.TagBuilder(cleanObject,null,passContent)).insertBefore($(this));
                            }
                        }
                        objectIndex ++;
                        if(objectIndex == objectLength){
                            $(this).remove();
                        }
                    }
                }else if(targetBinding == 'form'){
                    if (targetContent.indexOf('@') > -1) {
                        conditional = targetContent.split('@')[1].split('}')[0];
                        if(conditional == 'json'){
                            if(targetContent.indexOf('{@src') > -1){
                                var jsonPath = targetContent.split('{@src=')[1].split('}')[0];
                                $p.Assistants.Ajax(jsonPath).done(function (result) {
                                    pf.Build(result, targetItem);
                                }).fail(function () {
                                    console.log('could not load json data');
                                });
                            }else{
                                targetContent = targetContent.replace('{@json}', '').replace('{/json}', '');
                                pf.Build(JSON.parse(targetContent), targetItem);
                            }
                        }
                    }
                }else if($(this).parent().attr('is') !== 'form'){
                    var tag = $p.Config.defaults.tplTag.replacement;
                    if (targetContent.indexOf('@') > -1) {
                        //we have functions
                        conditional = targetContent.split('@')[1].split('}')[0];
                        conditionType = conditional.split(' ')[0].replace(/,/g, '');
                        conditionArgument = conditional.indexOf('if') > -1 ? conditional.split('if')[1].trim() : '';
                        conditionCase.true = targetContent.replace(conditional, '').replace('{@}', '').split('{')[0];
                        if (targetContent.indexOf('{@else}') > -1) {
                            conditionCase.false = targetContent.replace(conditional, '').replace('{@}', '').split('{')[1].replace('@else}', '');
                        }
                        switch (conditionType) {
                            case 'if':
                                var dateUnit = $p.Assistants.Date();
                                if (conditionArgument.indexOf('and') > -1) {
                                    conditionArgument = conditionArgument.split('and');
                                }
                                for (c in conditionArgument) {
                                    var calc = conditionArgument[c].trim();
                                    calc = calc.split(' ');
                                    for (d in calc) {
                                        if ($.inArray(calc[d], $p.DateConditions) > -1) {
                                            if ($p.Assistants.Comparison(dateUnit[calc[d]], calc[1], parseInt(calc[2]))) {
                                                $('<'+tag+'>' + conditionCase.true + '</'+tag+'>').insertBefore($(this));
                                                $(this).remove();
                                            } else {
                                                $('<'+tag+'>' + conditionCase.false + '</'+tag+'>').insertBefore($(this));
                                                $(this).remove();
                                            }
                                        }
                                    }
                                }
                                break;
                            case 'calc':
                                calcString = targetContent.replace('{@calc}', '').replace('{/calc}', '');
                                calcMethod = calcString.split('{@')[1].split('}')[0];
                                calcValues = calcString.split('{@' + calcMethod + '}');
                                $('<'+tag+'>' + $p.Assistants.Calculate(calcValues[0], calcMethod, calcValues[1]) + '</'+tag+'>').insertBefore($(this));
                                $(this).remove();
                                break;
                            case 'date':
                                dateString = targetContent.replace('{@date}', '').replace('{/date}', '');
                                $('<'+tag+'>' + $p.Assistants.Date(true) + '</'+tag+'>').insertBefore($(this));
                                $(this).remove();
                                break;
                            case 'ajax':
                                _this = this;
                                ajaxString = targetContent.replace('{@ajax}', '').replace('{/ajax}', '');
                                ajaxParams = ajaxString.split(',');
                                ajaxObject = {};
                                returnedData = '';
                                for (p in ajaxParams) {
                                    param = ajaxParams[p].split('=')[0].replace('}', '').replace('{', '').replace('@', '');
                                    value = ajaxParams[p].split('=')[1].replace('}', '').replace('{', '').replace('@', '');
                                    if ($.inArray(param, $p.Ajax.params) > -1) {
                                        ajaxObject[param] = value;
                                    }
                                }
                                $p.Assistants.Ajax(ajaxObject).done(function (result) {
                                    result = ajaxObject.index !== undefined && ajaxObject.index !== '' ? result[ajaxObject.index] : result;
                                    if (ajaxObject.repeat == true || ajaxObject.repeat === 'true') {
                                        for (r in result) {
                                            returnedData += ajaxObject.node !== undefined && ajaxObject.node !== '' ? result[r][ajaxObject.node] !== undefined ? result[r][ajaxObject.node] + ' ' : '' : result[r] + ' ';
                                        }
                                    }
                                    $('<'+tag+'>' + returnedData + '</'+tag+'>').insertBefore($(_this));
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
                        $('<'+tag+'>' + keyString + '</'+tag+'>').insertBefore($(this));
                        $(this).remove();
                    }
                }
            });
        }
    },
    Form:{
        closures:['select','input','button','textarea','form'],
        Build:function(obj,target){
            if(obj !== undefined && typeof obj == 'object') {
                target = target || $('tpl[is="form"]');
                var formTemplate = '<form {{attributes}} name="{{name}}" action="{{action}}">{{formItems}}</form>';
                var formObject = {};
                $.each(obj, function (key, value) {
                    formObject[key] = value;
                    if (key == 'items') {
                        formObject['items'] = value;
                    }
                });
                layoutForm(formObject);
                function layoutForm(obj) {
                    for (var o in obj) {
                        if (typeof obj[o] !== 'object') {
                            formTemplate = formTemplate.replace('{{' + o + '}}', obj[o]);
                        } else {
                            var formItems = obj[o];
                        }
                    }
                    handleFormItem(formTemplate, formItems);
                }
                function handleFormItem(template, obj) {
                    var string = '';
                    var events = {};
                    for (var o in obj) {
                        var tempObject = obj[o];
                        var formType = obj[o].element;
                        var formItemID = obj[o].id !== undefined && obj[o].id !== '' ? ' id="'+obj[o].id+'"': '' ;
                        var formItemClass = obj[o].class !== undefined && obj[o].class !== '' ? ' class="'+obj[o].class+'"': '' ;
                        if($.inArray(formType,pf.closures)>-1) {
                            if(obj[o].event !== undefined && typeof obj[o].event == 'object'){
                                events[obj[o].name] = obj[o].event;
                            }
                            string += obj[o].label !== undefined && obj[o].label !== '' ? '<label for="'+obj[o].name+'">'+obj[o].label+'</label>' : '';
                            if (formType == 'input') {
                                string += '<input';
                                string += formItemID+formItemClass;
                                string += ' type="' + obj[o].type + '" name="' + obj[o].name + '"';
                                string += obj[o].placeholder !== undefined && obj[o].placeholder !== '' ? ' placeholder="' + obj[o].placeholder + '"' : '';
                                string += obj[o].value !== undefined && obj[o].value !== '' ? ' value="' + obj[o].value + '"' : '';
                                string += obj[o].checked !== undefined && obj[o].checked !== '' && obj[o].checked == 'true' ? ' checked' : '';
                                string += '/>';
                            } else if (formType == 'select') {
                                string += '<select';
                                string += formItemID+formItemClass;
                                string += ' name="' + obj[o].name + '">{{options}}</select>';
                            } else if (formType == 'button') {
                                string += '<button';
                                string += formItemID+formItemClass;
                                string += ' name="' + obj[o].name + '">' + obj[o].value + '</button>';
                            }else if (formType == 'textarea') {
                                string += '<textarea';
                                string += formItemID+formItemClass;
                                string += ' name="' + obj[o].name + '"';
                                string += obj[o].width !== undefined && obj[o].width !== '' ? ' width="'+obj[o].width+'"' : '';
                                string += obj[o].height !== undefined && obj[o].height !== '' ? ' height="'+obj[o].height+'"' : '';
                                string += '>' + obj[o].value + '</textarea>';
                            }
                            for (var t in tempObject) {
                                if (typeof tempObject[t] == 'object') {
                                    var optionObject = tempObject[t];
                                    var optionString = '';
                                    for (var a in optionObject) {
                                        optionString += '<option name="' + optionObject[a].name + '">' + optionObject[a].value + '</option>';
                                    }
                                }
                            }
                            if (optionString !== undefined && optionString !== '') {
                                string = string.replace('{{options}}', optionString);
                            }
                        }
                    }
                    template = template.indexOf('{{attributes}}') > -1 ? template.replace('{{attributes}}', '') : template;
                    $(template.replace('{{formItems}}', string)).insertBefore(target);
                    $(target).remove();
                    $p.Assistants.RegisterEvents(events);
                }
            }
        }
    },
    Assistants: {
        Ajax:function(obj){
            if(typeof obj == 'object'){
                var jsonPath = obj.src;
            }else{
                jsonPath = obj;
            }
            return $.ajax({
                url:jsonPath,
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
        SwapReserved:function(a){
            var res = $p.Config.reserved;
            for(var r in res){
                if(typeof res[r] == 'object'){
                    var sub = res[r];
                    for(var s in sub){
                        if(a !== undefined) {
                            a = a.replace( new RegExp( s, 'g' ), sub[s] );
                        }
                    }
                }else{
                    a = a.replace( new RegExp( r, 'g' ), res[r] );
                }
            }
            return a;
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
        },
        RegisterEvents: function(obj){
            if(typeof obj == 'object'){
                for(var o in obj){
                    $('body').on(obj[o].handler,'[name="'+o+'"]',function(){
                        eval(obj[o].function);
                    });
                }
            }
        },
        TagBuilder:function(tag,multiplier,content){
            var s = {};
            s.div = {tag:'<div>',close:true};
            s.br = {tag:'<br />',close:false};
            s.p = {tag:'<p>',close:true};
            s.i = {tag:'<i>',close:true};
            s.b = {tag:'<strong>',close:true};
            s.nav = {tag:'<nav>',close:true};
            s.section = {tag:'<section>',close:true};
            s.header = {tag:'<header>',close:true};
            s.footer = {tag:'<footer>',close:true};
            var tagDisplay = s[tag].tag;
            if(multiplier !== undefined && multiplier !== null){
                var tagOutput = '';
                for(var i = 0;i<multiplier;i++){
                    tagOutput += tagDisplay;
                    tagOutput += $p.Assistants.SwapReserved(content[i]);
                    if(s[tag].close == true) {
                        tagOutput += tagDisplay.replace('<','</');
                    }
                }
            }else{
                tagOutput = tagDisplay;
                if(s[tag].close == true) {
                    if(content !== undefined){
                        tagOutput += $p.Assistants.SwapReserved(content);
                    }
                    tagOutput += tagDisplay.replace('<','</');
                }
            }
            return tagOutput;
        }
    }
};
var $p = p = Pikl;
var pi = Pikl.Index;
var pij = Pikl.Init.Json();
var pf = Pikl.Form;