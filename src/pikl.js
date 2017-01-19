/**
 * Created by David Maser on 09/01/17.

 ##############
 # Aliases
 #############

 Use the following Aliases to access specific functions

 $p or p =  Pikl
 pi = Pikl.Index
 pij = Pikl.Init.Json()
 pa = Pikl.Assistants
 pf = Pikl.Form
 pan = Pikl.Animations

 */
var Pikl = {
    Config: {
        Ajax:{
            params:['src','index','node','repeat'],
            default:'data/source.json'
        },
        brackets:'{}',
        comments:'{..}',
        defaults:{
            tplTag:{
                element:'pkl',
                replacement:'div'
            }
        },
        DateConditions:['day','month','year','hours','minutes','seconds'],
        Operators:['=','!=','>','<','<=','>='],
        plugins: {
            translate: true,
            encode: false
        },
        reserved:[
            {'\'':'&apos;'},
            {'\"':'&quote;'},
            {'\>':'&gt;'},
            {'\<':'&lt;'}
        ],
        targets:['div','span','p']
    },
    Index:{},
    Animations: {
        FadeOutOnClick: function (obj) {
            //{handler:'click',item:'',target:'',speed:500}
            $('body').on(obj.handler, obj.item, function () {
                $(obj.target).animate({opacity: 0}, obj.speed, function () {
                    $(this).remove();
                });
            });
        },
        SlideOutOnClick: function (obj) {
            $('body').on(obj.handler, obj.item, function () {
                var itemWidth = obj.item.width;
                $(obj.target).animate({left: -itemWidth}, obj.speed);
            });
        },
        GutterStateMotion:function(obj){
            var animationType = $('section[role="menu"]').attr('pikl-gutter-state') == 'visible' ? 'n' : 'p';
            var gutterMenu = $('section[role="menu"]');
            var pageBody = $('section[role="content"]');
            var gutterWidth = gutterMenu.width();
            if(animationType == 'n'){
                var gutterOffset = -gutterWidth;
                var gutterState = 'invisible';
                var bodyWidth = 0;
            }else if(animationType == 'p'){
                gutterOffset = 0;
                gutterState = 'visible';
                bodyWidth = '20%';
            }
            $(gutterMenu).animate({left:gutterOffset},500,function(){
                $(this).attr('pikl-gutter-state',gutterState);
            });
            $(pageBody).animate({left:bodyWidth},500,function(){
                $(this).attr('pikl-gutter-state',gutterState);
            })
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
        BuildLink:function(params,text){
            var linkTemplate ='<a href="{{url}}" target="{{target}}">{{content}}</a>',filteredParams = {};
            filteredParams.url = params.indexOf('url=') > -1 ? params.split('url="')[1].split('"')[0] : null;
            filteredParams.target = params.indexOf('target=') > -1 ? params.split('target="')[1].split('"')[0] : null;
            linkTemplate = filteredParams.url !== null && filteredParams.url !== '' ? linkTemplate.replace('{{url}}',filteredParams.url) : linkTemplate.replace(' href="{{url}}"','');
            linkTemplate = filteredParams.target !== null && filteredParams.target !== '' ? linkTemplate.replace('{{target}}',filteredParams.target) : linkTemplate.replace(' target="{{target}}"','');
            linkTemplate = text !== undefined && text !== '' ? linkTemplate.replace('{{content}}',text) : '';
            return linkTemplate;
        },
        BuildList:function(content){
            var filteredContent = {},contentParams,itemMain,itemList,itemArray,itemString='',listTemplate;
            contentParams = content.split('{@')[1].split('}')[0];
            filteredContent.name = contentParams.indexOf('name') > -1 ? contentParams.split('name="')[1].split('"')[0] : null;
            filteredContent.class = contentParams.indexOf('class') > -1 ? contentParams.split('class="')[1].split('"')[0] : null;
            filteredContent.id = contentParams.indexOf('id') > -1 ? contentParams.split('id="')[1].split('"')[0] : null;
            itemMain = content.replace('{/item}{@item}',',');
            itemList = itemMain.split('{@item}')[1].split('{/item}')[0];
            itemArray = itemList.split(',');
            listTemplate = '<ul class="{{class}}" name="{{name}}" id="{{id}}">{{listItems}}</ul>';
            listTemplate = filteredContent.name !== null && filteredContent.name !== '' ? listTemplate.replace('{{name}}',filteredContent.name) : listTemplate.replace(' name="{{name}}"','');
            listTemplate = filteredContent.id !== null && filteredContent.id !== '' ? listTemplate.replace('{{id}}',filteredContent.id) : listTemplate.replace(' id="{{id}}"','');
            listTemplate = filteredContent.class !== null && filteredContent.class !== '' ? listTemplate.replace('{{class}}',filteredContent.class) : listTemplate.replace(' class="{{class}}"','');
            for(var a in itemArray){
                itemString += '<li>';
                if(itemArray[a].indexOf('{#link') > -1){
                    var linkParams = itemArray[a].split('{#link')[1].split('}')[0];
                    var linkText = itemArray[a].split('{#link')[1].split('}')[1].split('{/link')[0];
                    itemString += pa.BuildLink(linkParams,linkText);
                }else {
                    itemString += itemArray[a];
                }
                itemString += '</li>';
            }
            var builtList = listTemplate.replace('{{listItems}}',itemString);
            return builtList;
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
        ExecuteFunctionByName: function (functionName, context , args ) {
            var args = [].slice.call(arguments).splice(2);
            var namespaces = functionName.split(".");
            var func = namespaces.pop();
            for (var i = 0; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }
            return context[func].apply(context, args);
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
        SplitContent:function(obj){
            obj.cols = obj.cols || 1;
            obj.split = obj.split || null;
            var textArray = [];
            if(obj.cols !== undefined && obj.cols !== 1){
                if (obj.split !== undefined && obj.split !== '' && obj.text.indexOf(obj.split) > -1) {
                    //we can start splitting at the split point
                    textArray = obj.text.split(obj.split);
                    //console.log(textArray);
                    return textArray;
                } else {
                    //we can start splitting based on the numeric value
                    var splitOffset = Math.round(obj.text.length / obj.cols);
                    var slicePosition = splitOffset;
                    for (var i = 1; i < splitOffset; i++) {
                        if (i == 1) {
                            var sliceStart = 0
                        } else {
                            sliceStart = (i - 1) * splitOffset;
                        }
                        slicePosition = i * splitOffset;
                        textArray.push(obj.text.slice(sliceStart, slicePosition));
                        //console.log(sliceStart, slicePosition, textArray);
                    }
                    return textArray;
                }
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
                    tagOutput += pa.SwapReserved(content[i]);
                    if(s[tag].close == true) {
                        tagOutput += tagDisplay.replace('<','</');
                    }
                }
            }else{
                tagOutput = tagDisplay;
                if(s[tag].close == true) {
                    if(content !== undefined){
                        tagOutput += pa.SwapReserved(content);
                    }
                    tagOutput += tagDisplay.replace('<','</');
                }
            }
            return tagOutput;
        }
    },
    Components:{
        Store:{},
        Build:function(obj,params,text,target){
            $p.Components.Store[obj] = {};
            $p.Components.Store[obj]['param'] = params;
            $p.Components.Store[obj]['text'] = text;
            $p.Components.Store[obj]['target'] = target;
            switch(obj){
                case 'header':
                    this.Header();
                    break;
                case 'footer':
                    this.Footer();
                    break;
                case 'gutter':
                    this.Gutter();
                    break;
                case 'navigation':
                    this.Navigation();
                    break;
                case 'modal':
                    this.Modal.Create(JSON.parse(text));
                    break;
            }
        },
        Footer:function(){
            var _this = $p.Components.Store.footer;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {};
            template.parent = '<footer>{{content}}</footer>';
            template.columns = {};
            template.columns.multiple = '<div class="footer_column">{{content}}</div>';
            var childString = '';
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(var c in content){
                        childString += template.columns.multiple.replace('{{content}}',content[c]);
                    }
                }
                var compactString = template.parent.replace('{{content}}',childString);
                $(compactString).insertBefore(_this.target);
                _this.target.remove();
                console.log(compactString);
            }
        },
        Gutter:function(){
            var _this = $p.Components.Store.gutter;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {};
            template.parent = '<section role="menu"{{attributes}}>{{content}}</section>';
            template.rows = {};
            template.rows.multiple = '<div class="gutter_column">{{content}}</div>';
            template.button = '<i class="pikl __gutter_button"></i>';
            var childString = '';
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(var c in content){
                        childString += template.rows.multiple.replace('{{content}}',content[c]);
                    }
                }
                var compactString = template.parent.replace('{{content}}',template.button+childString);
                $('body').prepend(compactString).find('.dill').wrap('<section role="content">');
                _this.target.remove();
                console.log(compactString);
            }else{
                var attrString = '';
                var defaultState = 'visible';
                if(_this.param !== undefined && typeof _this.param == 'object'){
                    for(var p in _this.param){
                        attrString += ' pikl-gutter-'+p+'="'+_this.param[p]+'"';
                        if(p == 'state'){
                            defaultState = _this.param[p];
                        }
                    }
                }
                compactString = template.parent.replace('{{content}}',template.button+_this.text);
                compactString = compactString.replace('{{attributes}}',attrString);
                $('body').prepend(compactString).find('.dill').wrap('<section role="content" pikl-has-gutter="true" pikl-gutter-state="'+defaultState+'">');
                _this.target.remove();
            }
            $('body').on('click','.pikl.__gutter_button',function(){
                $p.Assistants.ExecuteFunctionByName('$p.Animations.GutterStateMotion', window);
                //$p.Animations.GutterStateMotion();
            });
        },
        Header:function(){
            var _this = $p.Components.Store.header;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {};
            template.parent = '<header>{{content}}</header>';
            template.columns = {};
            template.columns.multiple = '<div class="header_column">{{content}}</div>';
            var childString = '';
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(var c in content){
                        childString += template.columns.multiple.replace('{{content}}',content[c]);
                    }
                }
                var compactString = template.parent.replace('{{content}}',childString);
                $(compactString).insertBefore(_this.target);
                _this.target.remove();
            }
        },
        Navigation:function(){
            var _this = $p.Components.Store.navigation;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {};
            template.parent = '<nav>{{content}}</nav>';
            template.columns = {};
            template.columns.multiple = '<div class="nav_column">{{content}}</div>';
            var childString = '';
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(var c in content){
                        childString += template.columns.multiple.replace('{{content}}',content[c]);
                    }
                }
                var compactString = template.parent.replace('{{content}}',childString);
                console.log(compactString);
            }
            function buildNavHierarchy(obj){

            }
        },
        Modal:{
            Store:{},
            Structure:{
                default:'<div pikl-component="modal __default" pikl-component-name="{{name}}"><div class="pikl modal__container"><div class="pikl modal__title">{{title}}</div><div class="pikl modal__body">{{body}}</div><div class="pikl modal__buttons">{{buttons}}</div></div></div>'
            },
            Create:function(obj){
                var _this = $p.Components.Modal;
                var _target = $p.Components.Store['modal']['target'];
                /*
                 format
                 {
                 name:'modal_name',
                 components:{
                 title:'My Title',
                 body:'Body text. Can contain HTML',
                 buttons:[
                 {
                 label:'I accept',
                 type:'confirm',
                 event:''
                 },
                 {
                 label:'I refuse',
                 type:'refuse',
                 event:''
                 }
                 ]
                 }
                 }
                 */
                if(obj !== undefined && typeof obj == 'object') {
                    var modalName = obj.name;
                    var buttonString = '';
                    var modalString = this.Structure.default.replace('{{name}}',modalName);
                    if (_this.Store[modalName] == undefined) {
                        _this.Store[modalName] = {};
                        /*
                         store the modal in the parent object so that
                         it can be recalled by name later.
                         */
                        for(var o in obj){
                            _this.Store[modalName][o] = obj[o];
                            if(typeof obj[o] == 'object'){
                                var subObj = obj[o];
                                for(var s in subObj){
                                    if(typeof subObj[s] !== 'object'){
                                        modalString = modalString.replace('{{'+s+'}}',subObj[s]);
                                    }else{
                                        // it's an object so it's going to be the buttons
                                        var buttons = subObj[s];
                                        for(var b in buttons){
                                            buttonString += '<button pikl-type="'+buttons[b].type+'">'+buttons[b].label+'</button>';
                                        }
                                    }
                                }
                                modalString = modalString.replace('{{buttons}}',buttonString)
                            }else{
                            }
                        }
                        $(modalString).insertBefore(_target);
                        _target.remove();
                    } else {
                        //build modal from store data
                        console.log('modal loaded from store');
                        obj = _this.Store[modalName];
                        for(var o in obj){
                            if(typeof obj[o] == 'object'){
                                var subObj = obj[o];
                                for(var s in subObj){
                                    if(typeof subObj[s] !== 'object'){
                                        modalString = modalString.replace('{{'+s+'}}',subObj[s]);
                                    }else{
                                        // it's an object so it's going to be the buttons
                                        var buttons = subObj[s];
                                        for(var b in buttons){
                                            buttonString += '<button pikl-type="'+buttons[b].type+'">'+buttons[b].label+'</button>';
                                        }
                                    }
                                }
                                modalString = modalString.replace('{{buttons}}',buttonString)
                            }else{
                            }
                        }
                        $(modalString).insertBefore(_target);
                        _target.remove();
                    }
                    pan.FadeOutOnClick({handler:'click',item:'button[pikl-type="refuse"]',target:'[pikl-component*="modal"]',speed:500})
                }else {
                    $p.Flash.Error();
                }
            },
            Destroy:function(item){
                if(item !== undefined){
                    $('[pikl-component-name="'+item+'"]').remove();
                }else{
                    $('[pikl-component*="modal"]').remove();
                }
            }
        }
    },
    Templates:{
        Collection:{
            button:{
                code:'<button></button>'
            },
            grid:{
                code:{}
            },
            table:{
                code:'<table><tbody><tr><td></td></tr></tbody></table>'
            }
        },
        Extract:function(obj){
            console.log(obj);
        },
        Import:function(obj){
            if(obj.indexOf('params')>-1){
                var templateParams = obj.split('params=[')[1].split(']')[0].split(',');
                //remove the params string after we've imported it
                 obj = obj.replace(' params=['+templateParams+']','');
            }
            var templateModel = obj.split('model=')[1].split('}')[0];
            var templateContent = obj.split('}')[1].split('{')[0];
            $p.Templates.Collection[templateModel] = {};
            $p.Templates.Collection[templateModel]['code'] = templateContent;
            if(templateParams !== undefined && templateParams !== ''){
                $p.Templates.Collection[templateModel]['params'] = {};
                for(var p in templateParams){
                    var subObject = templateParams[p].split('=');
                    $p.Templates.Collection[templateModel]['params'][subObject[0]] = subObject[1];
                }
            }else{
                $p.Templates.Collection[templateModel]['code'] = templateContent;
            }
            console.log($p.Templates.Collection);
        }
    },
    Flash:{
        Error:function(){

        },
        Message:function(){

        },
        Warning:function(){

        }
    },
    Form:{
        closures:['select','input','button','textarea','form'],
        Build:function(obj,target){
            if(obj !== undefined && typeof obj == 'object') {
                target = target || $('pkl[is="form"]');
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
                    pa.RegisterEvents(events);
                }
            }
        }
    },
    Init:{
        PiklWrapper:function(){
            $('body').contents().wrapAll('<div class="dill">');
        },
        Json:function(){
            var useFormat = $('html').attr('pkl-use');
            var useSource = $('html').attr('pkl-src');
            if(useFormat !== undefined && useFormat == 'json'){
                if(useSource !== undefined && useSource !== ''){
                    var ajaxCallUrl = useSource || $p.Config.Ajax.default;
                }else{
                    ajaxCallUrl = $p.Config.Ajax.default;
                }
            }
            /*
            find all json nodes form the source file and
            place them in a global object
             */
            $.ajax({
                url:ajaxCallUrl,
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
                    $.when($p.Init.PiklWrapper()).done(function(){
                        $p.Init.Content('[pikl="true"]','fr')
                    }).done(function(){
                        $('[pikl="true"]').addClass('loaded');
                        console.log('pikl is running');//herere
                    });
                }
            });
        },
        Content:function(node){
            var appendComma = false, targetObject = {}, targetItem, targetBinding,targetDataBinding, targetNode, targetContent, keyString, layoutObjects, nodeContent, sliceText, objectIndex, calcString, calcMethod,
                calcValues, cleanObject, conditional, conditionType, conditionArgument, conditionCase = {}, dateString, toRemove, passContent, _this, ajaxString, ajaxParams, ajaxObject, returnedData, param, value, templateObject, tag,
                c, d, l, p, t, r;
            node = node || '[pikl="true"]';
            $('pkl').each(function(){
                keyString = '';
                targetBinding = $(this).attr('is');
                targetDataBinding = $(this).attr('bind');
                targetObject = pi[targetDataBinding];
                targetContent = $(this).html();
                targetItem = $(this);
                tag = $p.Config.defaults.tplTag.replacement;
                switch(targetBinding) {
                    case 'component':
                        var componentType,componentParams,componentParamsObj,componentText,p,paramArray;
                        componentType = targetContent.split('{@')[1].split(' ')[0];
                        if(targetContent.split('{@')[1].split(' ')[1] !== undefined){
                            componentParams = targetContent.split('{@')[1].split(' ')[1].split('}')[0].split(',');
                        }else{
                            componentParams = null
                        }
                        componentParamsObj = {};
                        if(targetContent.indexOf('{@json}') > -1){
                            componentText = targetContent.split('{@json}')[1].split('{/json}')[0];
                        }else{
                            componentText = targetContent.split('}')[1].split('{')[0];
                        }
                        for(p in componentParams){
                            if(componentParams.hasOwnProperty(p)){
                                paramArray = componentParams[p].split('=');
                                componentParamsObj[paramArray[0]] = paramArray[1];
                            }
                        }
                        $p.Components.Build(componentType,componentParamsObj,componentText,$(this));
                        break;
                    case 'template':
                        var template = targetContent;
                        if(targetContent.indexOf('@import')>-1){
                            $p.Templates.Import(targetContent);
                        }else {
                            template = template.split('}{');
                            var templateObject = {};
                            for (var t in template) {
                                var a = template[t].replace('{', '').replace('}', '');
                                var b = a.split('#')[1].split(' ')[0];
                                templateObject[b] = {};
                                var c = a.split('#')[1].split(' ')[1];
                                if (c.indexOf(',') > -1) {
                                    var d = c.split(',');
                                    for (var i in d) {
                                        var e = d[i].split('=');
                                        templateObject[b][e[0]] = e[1];
                                    }
                                } else {
                                    d = c.split('=');
                                    templateObject[b][d[0]] = d[1];
                                }
                            }
                            $p.Templates.Extract(templateObject);
                        }
                        break;
                    case 'layout':
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
                                    $(pa.TagBuilder(cleanObject.split('*')[0],cleanObject.split('*')[1],passContent)).insertBefore($(this));
                                }else{
                                    $(pa.TagBuilder(cleanObject,null,passContent)).insertBefore($(this));
                                }
                            }
                            objectIndex ++;
                            if(objectIndex == objectLength){
                                $(this).remove();
                            }
                        }
                        break;
                    case 'list':
                        $(pa.BuildList(targetContent)).insertBefore($(this));
                        $(this).remove();
                        break;
                    case 'form':
                        if (targetContent.indexOf('@') > -1) {
                            conditional = targetContent.split('@')[1].split('}')[0];
                            if(conditional == 'json'){
                                if(targetContent.indexOf('{@src') > -1){
                                    var jsonPath = targetContent.split('{@src=')[1].split('}')[0];
                                    pa.Ajax(jsonPath).done(function (result) {
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
                        break;
                    case 'data':
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
                        break;
                }
                if($(this).parent().attr('is') !== 'form'){
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
                                var dateUnit = pa.Date();
                                if (conditionArgument.indexOf('and') > -1) {
                                    conditionArgument = conditionArgument.split('and');
                                }
                                for (c in conditionArgument) {
                                    var calc = conditionArgument[c].trim();
                                    calc = calc.split(' ');
                                    for (d in calc) {
                                        if ($.inArray(calc[d], $p.Config.DateConditions) > -1) {
                                            if (pa.Comparison(dateUnit[calc[d]], calc[1], parseInt(calc[2]))) {
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
                                $('<'+tag+'>' + pa.Calculate(calcValues[0], calcMethod, calcValues[1]) + '</'+tag+'>').insertBefore($(this));
                                $(this).remove();
                                break;
                            case 'date':
                                dateString = targetContent.replace('{@date}', '').replace('{/date}', '');
                                $('<'+tag+'>' + pa.Date(true) + '</'+tag+'>').insertBefore($(this));
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
                                    if ($.inArray(param, $p.Config.Ajax.params) > -1) {
                                        ajaxObject[param] = value;
                                    }
                                }
                                pa.Ajax(ajaxObject).done(function (result) {
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
                    }
                }
            });
        }
    },
    Validators:{
        json:function(code){
            try{
                return JSON.parse(code);
            }catch(e){
                console.log('Unable to parse JSON '+e);
            }

        },
        html:function(code){
            /*
            this is an extremely simplistic html validator. It will perform
            low level validations but might overlook certain common errors
            or tasks that are usually browser side.
             */
                var doc = document.createElement('div');
                doc.innerHTML = code;
                return ( doc.innerHTML === code );
        }
    },
    Widgets:{

    }
};
var $p = p = Pikl;
var pi = Pikl.Index;
var pij = Pikl.Init.Json();
var pa = Pikl.Assistants;
var pf = Pikl.Form;
var pan = Pikl.Animations;