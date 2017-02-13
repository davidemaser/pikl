/**
 * Created by David Maser on 09/01/17.

 #################
 #### Aliases ####
 #################

 Use the following Aliases to access specific functions

 $p = p = Pikl;
 pi = Pikl.Index;
 pij = Pikl.Init.Json();
 pa = Pikl.Assistants;
 pf = Pikl.Form;
 pt = Pikl.Templates;
 log = Pikl.Log;
 pan = Pikl.Animations;
 flash = Pikl.Flash;

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
                element:'pikl',
                replacement:'div'
            },
            domRoot:'body'
        },
        log:{
            enabled:true,
            events:[],
            store:'object'
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
        /*
        Prebuilt animations that can be called directly or
        are used to animate properties in widgets and
        certain template objects
         */
        FadeOutOnClick: function (obj) {
            //{handler:'click',item:'',target:'',speed:500}
            $($p.Config.defaults.domRoot).on(obj.handler, obj.item, function () {
                $(obj.target).animate({opacity: 0}, obj.speed, function () {
                    $(this).remove();
                });
            });
        },
        SlideOutOnClick: function (obj) {
            $($p.Config.defaults.domRoot).on(obj.handler, obj.item, function () {
                var itemWidth = obj.item.width;
                $(obj.target).animate({left: -itemWidth}, obj.speed);
            });
        },
        SlideIntoPosition:function(obj){
            var item = obj.object;
            var dir = obj.direction;
            var speed = obj.speed || 300;
            var remove = obj.remove;
            var height = obj.height !== undefined ? obj.height : $(item).height();
            var width = obj.width !== undefined ? obj.width : $(item).width();
            if(dir == 'down'){
                $(item).animate({bottom:-height},speed,function(){
                    remove == true ? $(item).remove() : false;
                });
            }else if(dir == 'up'){
                $(item).animate({bottom:height},speed,function(){
                    remove == true ? $(item).remove() : false;
                });
            }else if(dir == 'left'){
                $(item).animate({left:-width},speed,function(){
                    remove == true ? $(item).remove() : false;
                });
            }else if(dir == 'right'){
                $(item).animate({right:width},speed,function(){
                    remove == true ? $(item).remove() : false;
                });
            }
        },
        GutterStateMotion:function(){
            /*
            private function that handles the gutter menu and
            page section animation when the gutter toggle
            button is clicked
             */
            var animationType = $('section[role="menu"]').attr('pikl-gutter-state') == 'visible' ? 'n' : 'p',gutterMenu = $('section[role="menu"]'),pageBody = $('section[role="content"]'),gutterWidth = gutterMenu.width(),gutterOffset,gutterState,bodyWidth;
            if(animationType == 'n'){
                gutterOffset = -gutterWidth;
                gutterState = 'invisible';
                bodyWidth = 0;
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
        /*
        Built in assistant function that can be called directly or
        from within pikl template objects
         */
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
            var filteredContent = {},contentParams,itemMain,itemList,itemArray,itemString='',listTemplate,builtList,a,linkParams,linkText;
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
            for(a in itemArray){
                itemString += '<li>';
                if(itemArray[a].indexOf('{#link') > -1){
                    linkParams = itemArray[a].split('{#link')[1].split('}')[0];
                    linkText = itemArray[a].split('{#link')[1].split('}')[1].split('{/link')[0];
                    itemString += pa.BuildLink(linkParams,linkText);
                }else {
                    itemString += itemArray[a];
                }
                itemString += '</li>';
            }
            builtList = listTemplate.replace('{{listItems}}',itemString);
            return builtList;
        },
        Calculate: function (operation,math) {
            /*
            pass the operation as a string. The math argument can be
            any of the javascript Math values (i.e. round,abs,floor...)
             */
            var result = eval(operation);
            result = math !== undefined && math !== null ? Math[math](result) : result;
            return result;
        },
        CleanUp: function (str) {
            var list = ['id','class','name','attributes','style','header',' '],l;
            for(l in list){
                str = str.replace(new RegExp('{{'+list[l]+'}}', 'g'), '');
            }
            return str;
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
        Date: function (string,type) {
            var currentData = new Date(),formatDate = {};
            formatDate['day'] = currentData.getDate().toString().length == 1 ? parseInt('0'+currentData.getDate()) : currentData.getDate();
            formatDate['month'] = (currentData.getMonth()+1).toString().length == 1 ? parseInt('0'+(currentData.getMonth() + 1)) : currentData.getMonth() + 1;
            formatDate['year'] = currentData.getFullYear();
            formatDate['hours'] = currentData.getHours();
            formatDate['minutes'] = currentData.getMinutes();
            formatDate['seconds'] = currentData.getSeconds();
            switch (type) {
                case 'date':
                    return string == true ? formatDate['month']+'/'+formatDate['day']+'/'+formatDate['year'] : formatDate;
                    break;
                case 'time':
                    return string == true ? formatDate['hours']+':'+formatDate['minutes']+':'+formatDate['seconds'] : formatDate;
                    break;
            }
        },
        ExecuteFunctionByName: function (functionName, context , args ) {
            try {
                var args = [].slice.call(arguments).splice(2);
                var namespaces = functionName.split(".");
                var func = namespaces.pop();
                for (var i = 0; i < namespaces.length; i++) {
                    context = context[namespaces[i]];
                }
                return context[func].apply(context, args);
            }catch(e){
                flash.Build({type:'error',title:'EXECUTION ERROR',message:'A Function was unable to execute due to an unkown error',delay:10000})
            }
        },
        ImageExists: function (url) {
                var http = new XMLHttpRequest();
                http.open('HEAD', url, false);
                http.send();
                return http.status != 404;
        },
        RegisterEvents: function(obj){
            if(typeof obj == 'object'){
                for(var o in obj){
                    $($p.Config.defaults.domRoot).on(obj[o].handler,'[name="'+o+'"]',function(){
                        $p.Assistants.ExecuteFunctionByName(obj[o].function, window);
                    });
                }
            }
        },
        Repeat: function (str, times) {
            return new Array(times + 1).join(str);
        },
        ReplaceHandle: function (a, b) {
            if (pt.Inline[a] !== undefined) {
                return pt.Inline[a].replace('{{handle}}', b);
            } else {
                return b;
            }
        },
        SplitContent:function(obj){
            obj.cols = obj.cols || 1;
            obj.split = obj.split || null;
            var textArray = [],splitOffset,slicePosition,i,sliceStart;
            if(obj.cols !== undefined && obj.cols !== 1){
                if (obj.split !== undefined && obj.split !== '' && obj.text.indexOf(obj.split) > -1) {
                    //we can start splitting at the split point
                    textArray = obj.text.split(obj.split);
                    //console.log(textArray);
                    return textArray;
                } else {
                    //we can start splitting based on the numeric value
                    splitOffset = Math.round(obj.text.length / obj.cols);
                    slicePosition = splitOffset;
                    for (i = 1; i < splitOffset; i++) {
                        if (i == 1) {
                            sliceStart = 0
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
        StringModifiers:function(str,mods){
            var acceptedMods = ['rev','trim','whiteout','concat'];
            if(typeof mods == 'object'){
                $.each(mods,function(key,value){
                    if($.inArray(value,acceptedMods)>-1) {
                        switch (value) {
                            case 'rev':
                                return str.split('').reverse().join('');
                                break;
                            case 'trim':
                                return str.trim();
                                break;
                            case 'whiteout':
                                return str.replace(/ /g, '');
                        }
                    }
                });
            }else{

            }
        },
        SwapReserved:function(a){
            var res = $p.Config.reserved,r,sub,s;
            for(r in res){
                if(typeof res[r] == 'object'){
                    sub = res[r];
                    for(s in sub){
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
            var s = {},tagDisplay,tagOutput,i;
            s.div = {tag:'<div>',close:true};
            s.br = {tag:'<br />',close:false};
            s.p = {tag:'<p>',close:true};
            s.i = {tag:'<i>',close:true};
            s.b = {tag:'<strong>',close:true};
            s.nav = {tag:'<nav>',close:true};
            s.section = {tag:'<section>',close:true};
            s.header = {tag:'<header>',close:true};
            s.footer = {tag:'<footer>',close:true};
            tagDisplay = s[tag].tag;
            if(multiplier !== undefined && multiplier !== null){
                tagOutput = '';
                for(i = 0;i<multiplier;i++){
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
        },
        TimeStamp:function(){
            return Math.floor(Date.now() / 1000);
        }
    },
    Components:{
        /*
        Pikl template components. Function is called by core builder
         when pikl is="component" tag is encountered
         */
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
                case 'image':
                    this.Image();
                    break;
                case 'navigation':
                    this.Navigation();
                    break;
                case 'modal':
                    this.Modal.Create(JSON.parse(text));
                    break;
            }
            log.Write('build',{event:'components',response:obj,completed:true});
        },
        Footer:function(){
            var _this = $p.Components.Store.footer;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {
                parent : '<footer>{{content}}</footer>',
                columns : {},
                template : {
                    columns :{
                        multiple : '<div class="footer_column">{{content}}</div>'
                    }
                }
            };
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
            var defaultState = 'visible';
            var childString = '',c,compactString,attrString='',p;
            var template = {
                parent : '<section role="menu"{{attributes}}>{{content}}</section>',
                rows : {
                    multiple:'<div class="gutter_column">{{content}}</div>'
                },
                button : '<i class="pikl __gutter_button"></i>'
            };
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(c in content){
                        childString += template.rows.multiple.replace('{{content}}',content[c]);
                    }
                }
                compactString = template.parent.replace('{{content}}',template.button+childString);
                $($p.Config.defaults.domRoot).prepend(compactString).find('section[role="content"]').attr('pikl-has-gutter','true').attr('pikl-gutter-state',defaultState);
                _this.target.remove();
                console.log(compactString);
            }else{
                attrString = '';
                if(_this.param !== undefined && typeof _this.param == 'object'){
                    for(p in _this.param){
                        attrString += ' pikl-gutter-'+p+'="'+_this.param[p]+'"';
                        if(p == 'state'){
                            defaultState = _this.param[p];
                        }
                    }
                }
                compactString = template.parent.replace('{{content}}',template.button+_this.text);
                compactString = compactString.replace('{{attributes}}',attrString);
                $($p.Config.defaults.domRoot).prepend(compactString).find('section[role="content"]').attr('pikl-has-gutter','true').attr('pikl-gutter-state',defaultState);
                _this.target.remove();
            }
            $($p.Config.defaults.domRoot).on('click','.pikl.__gutter_button',function(){
                $p.Assistants.ExecuteFunctionByName('pan.GutterStateMotion', window);
            });
            log.Write('gutter',{event:'components',response:_this,completed:true});

        },
        Header:function(){
            var _this = $p.Components.Store.header;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {
                parent : '<header>{{content}}</header>',
                columns : {
                    multiple : '<div class="header_column">{{content}}</div>'
                }
            };
            var childString = '',c,compactString;
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(c in content){
                        childString += template.columns.multiple.replace('{{content}}',content[c]);
                    }
                }
                compactString = template.parent.replace('{{content}}',childString);
                $(compactString).insertBefore(_this.target);
                _this.target.remove();
            }
            log.Write('header',{event:'components',response:_this,completed:true});
        },
        Image:function(){
            var _this = $p.Components.Store.image;
            var _params = _this.param !== undefined ? _this.param : undefined;
            var template = {
                parent : '<img {{params}}>',
                params : {
                    src : 'src="{{src}}"',
                    width : ' width="{{width}}"',
                    height : ' height="{{height}}"',
                    style : ' style="{{style}}"'
                }
            };
            var t,childString='',compactString,src;
            if(typeof _params == 'object' && _params !== undefined){
                    for(t in _params){
                        if(t=='src'){
                            src = _params[t];
                        }
                        childString += template.params[t].replace('{{'+t+'}}',_params[t]);
                    }
                compactString = template.parent.replace('{{params}}',childString);
                if(pa.ImageExists(src) !== false){
                    $(compactString).insertBefore(_this.target)
                }
                _this.target.remove();
            }
        },
        Navigation:function(){
            var _this = $p.Components.Store.navigation;
            var content = _this.param.cols !== undefined && _this.param.split !== undefined ? $p.Assistants.SplitContent({cols:_this.param.cols,split:_this.param.split,text:_this.text}) : '';
            var template = {
                parent : '<nav>{{content}}</nav>',
                columns : {
                    multiple : '<div class="nav_column">{{content}}</div>'
                }
            };
            var childString = '',c,compactString;
            if(typeof content == 'object'){
                if(Array.isArray(content)){
                    for(c in content){
                        childString += template.columns.multiple.replace('{{content}}',content[c]);
                    }
                }
                compactString = template.parent.replace('{{content}}',childString);
                console.log(compactString);
            }
            function buildNavHierarchy(obj){

            }
        },
        Modal:{
            /*
            Creates a Pikl modal instance that can be called directly or
            nested in another template or compoenent object
             */
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
                    var o,subObj,s,buttons,b;
                    if (_this.Store[modalName] == undefined) {
                        _this.Store[modalName] = {};
                        /*
                         store the modal in the parent object so that
                         it can be recalled by name later.
                         */
                        for(o in obj){
                            _this.Store[modalName][o] = obj[o];
                            if(typeof obj[o] == 'object'){
                                subObj = obj[o];
                                for(s in subObj){
                                    if(typeof subObj[s] !== 'object'){
                                        modalString = modalString.replace('{{'+s+'}}',subObj[s]);
                                    }else{
                                        // it's an object so it's going to be the buttons
                                        buttons = subObj[s];
                                        for(b in buttons){
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
                        for(o in obj){
                            if(typeof obj[o] == 'object'){
                                subObj = obj[o];
                                for(s in subObj){
                                    if(typeof subObj[s] !== 'object'){
                                        modalString = modalString.replace('{{'+s+'}}',subObj[s]);
                                    }else{
                                        // it's an object so it's going to be the buttons
                                        buttons = subObj[s];
                                        for(b in buttons){
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
                    flash.Build();
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
                code:'<button {{id}} {{class}} {{name}} {{attributes}} {{style}}>{{content}}</button>'
            },
            list:{
                code:'<ul>{@each}<li>{{content}}</li>{/each}</ul>'
            },
            form:{
                select:{
                    code:'<select {{id}} {{class}} {{name}} {{attributes}} {{style}}>{@each}<option value="{{value}}">{{label}}</option>{/each}</select>'
                }
            },
            grid:{
                code:''
            },
            table:{
                code:'<table {{id}} {{class}} {{name}} {{attributes}} {{style}}><tbody><th><td>{{header}}</td></th><tr><td>{{content}}</td></tr></tbody></table>'
            }
        },
        Inline:{
            id:'id="{{handle}}"',
            class:'class="{{handle}}"',
            style:'style="{{handle}}"',
            name:'name="{{handle}}"'
        },
        HandleContent:function(obj,target){
            var objArray=[],o,thisObj,code,t,to;
            console.log(obj,target);
            if(typeof obj == 'object'){
                for(o in obj){
                    thisObj = obj[o];
                    if(thisObj.code !== undefined){
                        code = thisObj.code;
                        for(t in thisObj){
                            code = code.replace('{{'+t+'}}',thisObj[t]);
                        }
                        objArray.push(code);
                    }else{
                        for(t in thisObj){
                            thisObj = thisObj[t];
                            if(typeof thisObj == 'object'){
                                code = thisObj.code;
                                for(to in thisObj){
                                    code = code.replace('{{'+to+'}}',thisObj[to]);
                                    console.log(to,thisObj[to]);
                                }
                                objArray.push(code);
                            }
                        }
                    }
                }
                console.log(objArray);
            }else{
                flash.Build({type:'error',title:'Type Mismatch',message:'Function was expecting an object but did not receive one',delay:10000});
            }
            $(target).remove();
        },
        ParseContent:function(obj,target){
            var accepts = {
                select : ['option','value'],
                button : ['repeat','attributes','class','id','event']
            };
            var o,_this,_typeTemplate,_repeat,t,_inlineObj,_parent,_child,_outputTemplate,_formattedString,_outputString,_outputWrapper,th,options,op;
            if(typeof obj == 'object'){
                for(o in obj){
                    _this = obj[o];
                    _typeTemplate = $p.Templates.Collection[o].code;
                    _repeat = obj[o].repeat !== undefined && obj[o].repeat !== null ? parseInt(obj[o].repeat) : 1;
                    if(typeof _this == 'object' && obj.hasOwnProperty(o)){
                        for(t in _this){
                            if (typeof _this[t] !== 'object') {
                                if(pt.Inline[t] == undefined){
                                    _typeTemplate = _typeTemplate.replace('{{' + t + '}}', _this[t]);
                                }else{
                                    _inlineObj = pa.ReplaceHandle(t,_this[t]);
                                    _typeTemplate = _typeTemplate.replace('{{' + t + '}}', _inlineObj);
                                }
                            }else {
                                _parent = o;
                                _child = t;
                                _this = _this[t];
                                _outputTemplate = $p.Templates.Collection[_parent][_child] === undefined ? $p.Templates.Collection[_parent].code : $p.Templates.Collection[_parent][_child].code;
                                _formattedString = '';
                                if(_outputTemplate.indexOf('{@each}') > -1) {
                                    _outputString = _outputTemplate.split('{@each}')[1].split('{/each}')[0];
                                    _outputWrapper = _outputTemplate.split('{@each}')[0].replace('<', '').replace('>', '');
                                }else{
                                    if(typeof _this === 'object'){
                                        //console.log('inline not',o,obj[o],t,_this[t])
                                        for(th in _this){
                                            _formattedString += _this[th][0]+'="'+_this[th][1]+'" ';
                                        }
                                    }
                                    _typeTemplate = _typeTemplate.replace('{{'+t+'}}',_formattedString);
                                }
                                if(_this.options !== undefined){
                                    options = _this.options;
                                    for(op in options){
                                        _formattedString += _outputString.replace('{{value}}',options[op][1]).replace('{{label}}',options[op][0]);
                                    }
                                    _typeTemplate = '<'+_outputWrapper+'>'+_formattedString+'</'+_outputWrapper+'>';
                                }
                            }
                            /*for(var m in _this){
                                console.log(m,_this,_this[m],typeof _this[m])
                                if(typeof _this[m] !== 'object'){
                                    _typeTemplate = _typeTemplate.replace('{{'+m+'}}',pa.ReplaceHandle(m,_this[m]));
                                }
                            }*/
                        }
                    }
                    _typeTemplate !== undefined && _typeTemplate !== '' ? this.DisplayContent(pa.Repeat(_typeTemplate,_repeat),target) : false;
                }
            }
        },
        DisplayContent:function(obj,target){
            $(pa.CleanUp(obj)).insertBefore(target);
            $(target).css('display','none');
        },
        Extract:function(obj,target){
            /*
            Extracts a template model from the page and
            places the code found in the Template Collection
            object in it's place
             */
            var o,t,tmp,codeBlock='';
            if(typeof obj == 'object'){
                for(o in obj){
                    if(pt.Collection[o].code == undefined){
                        tmp = pt.Collection[o];
                        for(t in tmp){
                            obj[o][t].code = pt.Collection[o][t].code;
                            codeBlock += pt.Collection[o][t].code;
                        }
                    }else if(pt.Collection[o].code !== undefined && pt.Collection[o].code !== ''){
                        obj[o].code = pt.Collection[o].code;
                        codeBlock += pt.Collection[o].code;
                    }
                }
                pt.HandleContent(obj,target);
            }
        },
        Import:function(obj,target){
            /*
            function imports html from a template object and
            stores it by it's name in the Template Collection
            object. It can then be called by name
             */
            var templateParams,templateModel,exists,templateContent,p,subObject;
            if(obj.indexOf('params')>-1){
                templateParams = obj.split('params=[')[1].split(']')[0].split(',');
                //remove the params string after we've imported it
                 obj = obj.replace(' params=['+templateParams+']','');
            }
            templateModel = obj.split('model=')[1].split('}')[0];
            exists = pt.Collection[templateModel] !== undefined;
            if(exists !== true) {
                templateContent = obj.split('}')[1].split('{')[0];
                pt.Collection[templateModel] = {};
                pt.Collection[templateModel]['code'] = templateContent;
                if (templateParams !== undefined && templateParams !== '') {
                    pt.Collection[templateModel]['params'] = {};
                    for (p in templateParams) {
                        subObject = templateParams[p].split('=');
                        pt.Collection[templateModel]['params'][subObject[0]] = subObject[1];
                    }
                } else {
                    pt.Collection[templateModel]['code'] = templateContent;
                }
                //new template objects have been imported into the Templates.Collection object. Call them by name
                console.log('Model built having name ' + templateModel, pt.Collection[templateModel]);
            }else{
                flash.Build({type:'warning',title:'Warning',message:'The template named "'+templateModel+'" already exists in the collection. Please chose another one',delay:10000});
            }
            $(target).remove();
        }
    },
    Flash:{
        /*
        Creates a notification panel at the bottom of the page
        that advises the user when an event is triggered
         */
        Template:'<section pikl-widget="flash" pikl-flash="{{type}}" {{style}}><div class="pikl __flash_{{type}} title">{{title}}</div><div class="pikl __flash_{{type}} body">{{body}}<div></div></div></section>',
        Build:function(obj) {
            var type,title,message,delay,style,codeBlock;
            if($('section[pikl-widget="flash"]').length !== 0){
                console.log('Flash object is already open');
            }else{
                if (obj !== undefined && typeof obj == 'object') {
                    type = obj.type;
                    title = obj.title;
                    message = obj.message;
                    delay = parseInt(obj.delay) || 2500;
                    style = 'style="bottom:-160px;"';
                    codeBlock = flash.Template.replace(/{{type}}/g, type).replace('{{title}}', title).replace('{{body}}', message).replace('{{style}}', style);
                    $($p.Config.defaults.domRoot).prepend(codeBlock);
                    $.when(
                        pan.SlideIntoPosition({
                            object: 'section[pikl-widget="flash"]',
                            direction: 'up',
                            speed: 250,
                            height:0,
                            remove: false
                        })
                    ).done(function(){
                        setTimeout(function () {
                            pan.SlideIntoPosition({
                                object: 'section[pikl-widget="flash"]',
                                direction: 'down',
                                speed: 250,
                                remove: true
                            });
                        }, delay);
                    });
                }
            }
            $($p.Config.defaults.domRoot).on('click','section[pikl-widget="flash"]',function(){
                pan.SlideIntoPosition({
                    object: 'section[pikl-widget="flash"]',
                    direction: 'down',
                    speed: 250,
                    remove: true
                });
            })
        }
    },
    Form:{
        closures:['select','input','button','textarea','form'],
        Build:function(obj,target){
            if(obj !== undefined && typeof obj == 'object') {
                target = target || $('pikl[is="form"]');
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
                    var string = '',events = {},o,tempObject,formType,formItemID,formItemClass,t,optionObject,optionString,a;
                    for (o in obj) {
                        tempObject = obj[o];
                        formType = obj[o].element;
                        formItemID = obj[o].id !== undefined && obj[o].id !== '' ? ' id="'+obj[o].id+'"': '' ;
                        formItemClass = obj[o].class !== undefined && obj[o].class !== '' ? ' class="'+obj[o].class+'"': '' ;
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
                            for (t in tempObject) {
                                if (typeof tempObject[t] == 'object') {
                                    optionObject = tempObject[t];
                                    optionString = '';
                                    for (a in optionObject) {
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
            $($p.Config.defaults.domRoot).contents().wrapAll('<section role="content" pikl-has-gutter="false" class="dill">');
        },
        Json:function(){
            var useFormat = $('html').attr('pikl-use');
            var useSource = $('html').attr('pikl-src');
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
                    flash.Build({type:'error',title:'JSON Error',message:'Unable to load JSON data. Verify that the json file exists',delay:10000})
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
        Content: function (node) {
            /*
             Cycles through all pikl markup objects (<pikl>) and sends
             each accepted object to it's corresponding function.
             Each object will be treated by it's parent object
             function
             */
            var appendComma = false, targetObject = {}, targetItem, targetBinding, targetDataBinding, targetNode, targetContent, keyString, layoutObjects, nodeContent, sliceText = {}, objectIndex, calcString, mathOperators,
                calcObject = {}, calcMath, cleanObject, conditional, conditionType, conditionArgument, conditionCase = {}, dateString, toRemove, passContent, _this, ajaxString, ajaxParams, ajaxObject = {},
                returnedData, param, value, template, templateObject = {}, tag, c, d, e, l, t, o, p, r, _options, componentType, componentParams, componentParamsObj = {}, componentText, paramArray, templateObjectType,
                templateBlock, templateObjectSubType, templateObjectContent, templateParams, objectLength, jsonPath,
                calc, dateUnit, timeUnit, node = node || '[pikl="true"]',targetModifiers=[];
            $($p.Config.defaults.tplTag.element).each(function () {
                keyString = '';
                targetBinding = $(this).attr('is');
                targetDataBinding = $(this).attr('bind');
                targetObject = pi[targetDataBinding];
                targetContent = $(this).html().replace(/(\r\n|\n|\r)/gm, '').replace(/\}\s+\{/g, '}{');
                targetItem = $(this);
                if(targetContent.indexOf('{#mods')>-1){
                    targetModifiers = targetContent.split('{#mods ')[1].split('}')[0].split(',');
                    targetContent = targetContent.replace('{#mods '+targetContent.split('{#mods ')[1].split('}')[0]+'}','');
                }
                tag = $p.Config.defaults.tplTag.replacement;
                pa.StringModifiers(targetContent,targetModifiers);
                switch (targetBinding) {
                    case 'component':
                        componentType = targetContent.split('{@')[1].split(' ')[0];
                        if (targetContent.split('{@')[1].split(' ')[1] !== undefined) {
                            componentParams = targetContent.split('{@')[1].split(' ')[1].split('}')[0].split(',');
                        } else {
                            componentParams = null
                        }
                        componentParamsObj = {};
                        if (targetContent.indexOf('{@json}') > -1) {
                            componentText = targetContent.split('{@json}')[1].split('{/json}')[0];
                        } else {
                            componentText = targetContent.split('}')[1].split('{')[0];
                        }
                        for (p in componentParams) {
                            if (componentParams.hasOwnProperty(p)) {
                                paramArray = componentParams[p].split('=');
                                componentParamsObj[paramArray[0]] = paramArray[1];
                            }
                        }
                        $p.Components.Build(componentType, componentParamsObj, componentText, $(this));
                        break;
                    case 'template':
                    function collectOptions(options) {
                        var _labels = {};
                        if (options !== undefined) {
                            for (o in options) {
                                _options = options[o];
                                _options = _options.split('=');
                                if (_options !== undefined && _this !== null && _this !== '') {
                                    _labels[o] = _options;
                                }
                            }
                            return _labels;
                        }
                    }
                        template = targetContent;
                        if (targetContent.indexOf('@import') > -1) {
                            $p.Templates.Import(targetContent, targetItem);
                        } else {
                            var eachObject = template.split('}{@');
                            for (e in eachObject) {
                                var templateBlockOptions,templateOptions=undefined,templateBlockAttributes,templateAttributes=undefined;
                                eachObject[e] = eachObject[e].replace('{@', '');
                                templateObjectType = eachObject[e].split(' ')[0].split('.')[0];
                                templateObjectSubType = eachObject[e].split(' ')[0].split('.')[1];
                                templateObjectContent = eachObject[e].split('{/' + templateObjectType)[0].split('}')[1];
                                eachObject[e] = eachObject[e].replace('{/' + templateObjectType + '}', '').replace('{/' + templateObjectType, '').replace('}', '').replace(templateObjectType + ' ', '');
                                templateBlock = eachObject[e].split('params=[')[1].split(']')[0];
                                templateParams = templateBlock.split(',');
                                templateObject[templateObjectType] = {};
                                if (eachObject[e].indexOf('options=[') > -1) {
                                    templateBlockOptions = eachObject[e].split('options=[')[1].split(']')[0];
                                    templateOptions = templateBlockOptions.split(',');
                                }
                                if (eachObject[e].indexOf('attributes=[') > -1) {
                                    templateBlockAttributes = eachObject[e].split('attributes=[')[1].split(']')[0];
                                    templateAttributes = templateBlockAttributes.split(',');
                                }
                                if (templateObjectSubType !== undefined && templateObjectSubType !== '') {
                                    templateObject[templateObjectType][templateObjectSubType] = {};
                                }
                                for (p in templateParams) {
                                    _this = templateParams[p];
                                    _this = _this.split('=');
                                    if (typeof templateObject[templateObjectType][templateObjectSubType] == 'object') {
                                        templateObject[templateObjectType][templateObjectSubType][_this[0]] = _this[1];
                                        templateObject[templateObjectType][templateObjectSubType]['content'] = templateObjectContent !== null && templateObjectContent !== undefined && templateObjectContent !== '' ? templateObjectContent : '';
                                        if (templateOptions !== undefined) {
                                            templateObject[templateObjectType][templateObjectSubType]['options'] = collectOptions(templateOptions);
                                        }
                                        if (templateAttributes !== undefined) {
                                            templateObject[templateObjectType][templateObjectSubType]['attributes'] = collectOptions(templateAttributes);
                                        }
                                    } else {
                                        templateObject[templateObjectType][_this[0]] = _this[0] !== undefined ? _this[1] : '';
                                        templateObject[templateObjectType]['content'] = templateObjectContent !== null && templateObjectContent !== undefined && templateObjectContent !== '' ? templateObjectContent : '';
                                        if (templateOptions !== undefined) {
                                            templateObject[templateObjectType]['options'] = collectOptions(templateOptions);
                                        }
                                        if (templateAttributes !== undefined) {
                                            templateObject[templateObjectType]['attributes'] = collectOptions(templateAttributes);
                                        }
                                    }
                                }
                            }
                            pt.ParseContent(templateObject, targetItem);
                        }
                        break;
                    case 'layout':
                        layoutObjects = targetContent.split('--');
                        objectIndex = 0;
                        for (l in layoutObjects) {
                            objectLength = layoutObjects.length;
                            if (layoutObjects[l] !== undefined && layoutObjects[l] !== '') {
                                if (layoutObjects[l].indexOf('[') > -1 && layoutObjects[l].indexOf(']') > -1) {
                                    nodeContent = layoutObjects[l].split('[')[1].split(']')[0];
                                    sliceText.start = layoutObjects[l].indexOf('[');
                                    sliceText.end = layoutObjects[l].indexOf(']');
                                    sliceText.content = nodeContent;
                                    toRemove = layoutObjects[l].slice(sliceText.start, sliceText.end + 1);
                                    cleanObject = layoutObjects[l].replace(toRemove, '').trim();
                                } else {
                                    sliceText = {};
                                    cleanObject = layoutObjects[l];
                                }
                                if (sliceText.content !== undefined && sliceText.content.indexOf(',') > -1) {
                                    passContent = sliceText.content.split(',');
                                } else {
                                    passContent = sliceText.content;
                                }
                                if (layoutObjects[l].indexOf('*') > -1) {
                                    $(pa.TagBuilder(cleanObject.split('*')[0], cleanObject.split('*')[1], passContent)).insertBefore($(this));
                                } else {
                                    $(pa.TagBuilder(cleanObject, null, passContent)).insertBefore($(this));
                                }
                            }
                            objectIndex++;
                            if (objectIndex == objectLength) {
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
                            if (conditional == 'json') {
                                if (targetContent.indexOf('{@src') > -1) {
                                    jsonPath = targetContent.split('{@src=')[1].split('}')[0];
                                    pa.Ajax(jsonPath).done(function (result) {
                                        pf.Build(result, targetItem);
                                    }).fail(function () {
                                        flash.Build({
                                            type: 'error',
                                            title: 'JSON Error',
                                            message: 'Unable to load JSON data. Verify that the json file exists',
                                            delay: 10000
                                        })
                                    });
                                } else {
                                    targetContent = targetContent.replace('{@json}', '').replace('{/json}', '');
                                    pf.Build(JSON.parse(targetContent), targetItem);
                                }
                            }
                        }
                        break;
                    case 'data':
                        targetNode = $(this).html().replace(/}/g, '').replace(/{/g, '').replace('#comma', '');
                        appendComma = $(this).html().indexOf('{#comma}') > -1;
                        console.log(targetObject,targetNode);
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
                        $('<' + tag + '>' + keyString + '</' + tag + '>').insertBefore($(this));
                        $(this).remove();
                        break;
                }
                if ($(this).parent().attr('is') !== 'form') {
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
                                var conditionCheck = {
                                    date: ['day', 'month', 'year'],
                                    time: ['hour', 'minute', 'second']
                                };
                                dateUnit = pa.Date(false, 'date');
                                timeUnit = pa.Date(false, 'time');
                                if (conditionArgument.indexOf('and') > -1) {
                                    conditionArgument = conditionArgument.split('and');
                                }
                                for (c in conditionArgument) {
                                    calc = conditionArgument[c].trim();
                                    calc = calc.split(' ');
                                    for (d in calc) {
                                        if ($.inArray(calc[d], $p.Config.DateConditions) > -1) {
                                            if (pa.Comparison(dateUnit[calc[d]], calc[1], parseInt(calc[2]))) {
                                                $('<' + tag + '>' + conditionCase.true + '</' + tag + '>').insertBefore($(this));
                                                $(this).remove();
                                            } else {
                                                $('<' + tag + '>' + conditionCase.false + '</' + tag + '>').insertBefore($(this));
                                                $(this).remove();
                                            }
                                        }
                                    }
                                }
                                log.Write('if',{event:'Conditional',response:conditionArgument,completed:true});
                                break;
                            case 'calc':
                                try {
                                    mathOperators = ['abs','acos','asin','atan','ceil','cos','exp','floor','log','round','sin','sqrt','tan'];
                                    calcString = targetContent.replace('{@calc}', '').replace('{/calc}', '');
                                    if (calcString.indexOf('{#') > -1) {
                                        calcMath = calcString.split('{#')[1].split('}')[0];
                                        calcString = calcString.replace('{#' + calcMath + '}', '');
                                    }
                                    calcObject.multiply = {input: 'times', output: '*'};
                                    calcObject.divide = {input: 'divide', output: '/'};
                                    calcObject.subtract = {input: 'subtract', output: '-'};
                                    calcObject.minus = {input: 'minus', output: '-'};
                                    calcObject.add = {input: 'add', output: '+'};
                                    for (c in calcObject) {
                                        calcString = calcString.replace(new RegExp('{@' + calcObject[c].input + '}', 'g'), calcObject[c].output);
                                    }
                                    calcMath = $.inArray(calcMath,mathOperators) ? calcMath : null ;
                                    $('<' + tag + '>' + pa.Calculate(calcString, calcMath || null) + '</' + tag + '>').insertBefore($(this));
                                    log.Write('calc',{event:'Calculation',response:calcObject,completed:true});
                                }catch(e){
                                    /*
                                     assuming tat the math operator will be the main cause of errors
                                     execute the Calculate function without it. If it fails, then
                                     log an error
                                     */
                                    try {
                                        $('<' + tag + '>' + pa.Calculate(calcString) + '</' + tag + '>').insertBefore($(this));
                                    }catch(e){
                                        log.Write('calc',{event:'Calculation',response:calcObject,completed:false});
                                    }
                                }
                                $(this).remove();
                                break;
                            case 'date':
                                dateString = targetContent.replace('{@date}', '').replace('{/date}', '');
                                $('<' + tag + '>' + pa.Date(true, 'date') + '</' + tag + '>').insertBefore($(this));
                                $(this).remove();
                                break;
                            case 'ajax':
                                var _ajaxTarget = targetItem;
                                ajaxString = targetContent.replace('{@ajax}', '').replace('{/ajax}', '');
                                ajaxParams = ajaxString.split(',');
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
                                    $('<' + tag + '>' + returnedData + '</' + tag + '>').insertBefore($(_ajaxTarget));
                                    $(_ajaxTarget).remove();
                                    log.Write('ajax',{event:'AJAX',response:returnedData || null,completed:true});
                                }).fail(function () {
                                    log.Write('ajax',{event:'AJAX',response:returnedData || null,completed:false});
                                    flash.Build({
                                        type: 'error',
                                        title: 'JSON Error',
                                        message: 'Unable to load JSON data. Verify that the json file exists',
                                        delay: 5000
                                    })
                                });
                                break;
                        }
                    }
                }
            });
        }
    },
    Log:{
        Store:{},
        Template:'<div>{@each}<div>{{key}} - {{value}}</div>{/each}</div>',
        Display:function(mode){
            switch (mode){
                case 'console':
                    console.log(log.Store);
                    break;
                case 'app':
                    break;
            }
        },
        Write:function(origin,obj){
            /*
            obj format is the following
            {event:'',response:'',completed:''}
             */
            try {
                if (typeof obj === 'object' && $p.Config.log.enabled == true) {
                    var _stamp = pa.TimeStamp();
                    log.Store[origin] = {};
                    for (var o in obj) {
                        log.Store[origin][o] = obj[o];
                    }
                    log.Store[origin]['timeStamp'] = _stamp;
                }
            }catch(e){

            }
        },
        Flush:function(){

        }
    },
    Validators: {
        json: function (code) {
            try {
                return JSON.parse(code);
            } catch (e) {
                flash.Build({
                    type: 'error',
                    title: 'JSON Parse Error',
                    message: 'Unable to parse JSON ' + e,
                    delay: 10000
                })
            }

        },
        html: function (code) {
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
var pt = Pikl.Templates;
var log = Pikl.Log;
var pan = Pikl.Animations;
var flash = Pikl.Flash;