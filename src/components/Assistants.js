/**
 * Created by David Maser on 16/06/2017.
 */
import {Config} from './Config';
import {Templates} from './Templates';  
import {Flash} from './Flash';
import {Animations} from './Animations';

export let Assistants = {
  /*
   Built in assistant function that can be called directly or
   from within pikl template objects
   */
  Ajax: function (obj) {
    let jsonPath;
    if (typeof obj === 'object') {
      jsonPath = Config.Ajax.root+obj.src;
    } else {
      jsonPath = obj;
    }
    return $.ajax({
      url: jsonPath,
      method: 'GET'
    });
  },
  AjaxParams: function (ajaxParams) {
    /*
     returns the ajax parameters as an object. Can be passed to
     Assistants.Ajax
     @return {object}
     */
    let param, p, value, ajaxObject = {};
    for (p in ajaxParams) {
      param = ajaxParams[p].split('=')[0].replace('}', '').replace('{', '').replace('@', '');
      value = ajaxParams[p].split('=')[1].replace('}', '').replace('{', '').replace('@', '');
      if ($.inArray(param, Config.Ajax.params) > -1) {
        ajaxObject[param] = value;
      }
    }
    return ajaxObject;
  },
  BuildLink: function (params, text) {
    /*
     @return {string}
     */
    let linkTemplate = '<a href="{{url}}" target="{{target}}">{{content}}</a>', filteredParams = {};
    filteredParams.url = params.indexOf('url=') > -1 ? params.split('url="')[1].split('"')[0] : null;
    filteredParams.target = params.indexOf('target=') > -1 ? params.split('target="')[1].split('"')[0] : null;
    linkTemplate = filteredParams.url !== null && filteredParams.url !== '' ? linkTemplate.replace('{{url}}', filteredParams.url) : linkTemplate.replace(' href="{{url}}"', '');
    linkTemplate = filteredParams.target !== null && filteredParams.target !== '' ? linkTemplate.replace('{{target}}', filteredParams.target) : linkTemplate.replace(' target="{{target}}"', '');
    linkTemplate = text !== undefined && text !== '' ? linkTemplate.replace('{{content}}', text) : '';
    return linkTemplate;
  },
  BuildList: function (content) {
    let filteredContent = {}, contentParams, itemMain, itemList, itemArray, itemString = '', listTemplate, builtList, a,
      linkParams, linkText;
    contentParams = content.split('{@')[1].split('}')[0];
    filteredContent.name = contentParams.indexOf('name') > -1 ? contentParams.split('name="')[1].split('"')[0] : null;
    filteredContent.class = contentParams.indexOf('class') > -1 ? contentParams.split('class="')[1].split('"')[0] : null;
    filteredContent.id = contentParams.indexOf('id') > -1 ? contentParams.split('id="')[1].split('"')[0] : null;
    itemMain = content.replace('{/item}{@item}', ',');
    itemList = itemMain.split('{@item}')[1].split('{/item}')[0];
    itemArray = itemList.split(',');
    listTemplate = '<ul class="{{class}}" name="{{name}}" id="{{id}}">{{listItems}}</ul>';
    listTemplate = filteredContent.name !== null && filteredContent.name !== '' ? listTemplate.replace('{{name}}', filteredContent.name) : listTemplate.replace(' name="{{name}}"', '');
    listTemplate = filteredContent.id !== null && filteredContent.id !== '' ? listTemplate.replace('{{id}}', filteredContent.id) : listTemplate.replace(' id="{{id}}"', '');
    listTemplate = filteredContent.class !== null && filteredContent.class !== '' ? listTemplate.replace('{{class}}', filteredContent.class) : listTemplate.replace(' class="{{class}}"', '');
    for (a in itemArray) {
      itemString += '<li>';
      if (itemArray[a].indexOf('{#link') > -1) {
        linkParams = itemArray[a].split('{#link')[1].split('}')[0];
        linkText = itemArray[a].split('{#link')[1].split('}')[1].split('{/link')[0];
        itemString += Assistants.BuildLink(linkParams, linkText);
      } else {
        itemString += itemArray[a];
      }
      itemString += '</li>';
    }
    builtList = listTemplate.replace('{{listItems}}', itemString);
    return builtList;
  },
  Calculate: function (operation, math) {
    /*
     pass the operation as a string. The math argument can be
     any of the javascript Math values (i.e. round,abs,floor...)
     */
    let result = eval(operation);
    result = math !== undefined && math !== null ? Math[math](result) : result;
    return result;
  },
  CleanUp: function (str) {
    let list = ['id', 'class', 'name', 'attributes', 'style', 'header', ' '], l;
    for (l in list) {
      str = str.replace(new RegExp('{{' + list[l] + '}}', 'g'), '');
    }
    return str;
  },
  Comparison: function (a, b, c) {
    /*
     @return {boolean}
     */
    switch (b) {
      case '=':
        return a === c;
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
  Date: function (string, type) {
    let currentData = new Date(), formatDate = {};
    formatDate['day'] = currentData.getDate().toString().length == 1 ? parseInt('0' + currentData.getDate()) : currentData.getDate();
    formatDate['month'] = (currentData.getMonth() + 1).toString().length == 1 ? parseInt('0' + (currentData.getMonth() + 1)) : currentData.getMonth() + 1;
    formatDate['year'] = currentData.getFullYear();
    formatDate['hours'] = currentData.getHours();
    formatDate['minutes'] = currentData.getMinutes();
    formatDate['seconds'] = currentData.getSeconds();
    switch (type) {
      case 'date':
        return string === true ? formatDate['month'] + '/' + formatDate['day'] + '/' + formatDate['year'] : formatDate;
        break;
      case 'time':
        return string === true ? formatDate['hours'] + ':' + formatDate['minutes'] + ':' + formatDate['seconds'] : formatDate;
        break;
    }
  },
  ExecuteFunctionByName: function (functionName, context, args) {
    if(functionName === 'GutterStateMotion'){
      Animations.GutterStateMotion();
    }else{
      try {
        let args = [].slice.call(arguments).splice(2);
        let namespaces = functionName.split(".");
        let func = namespaces.pop();
        for (let i = 0; i < namespaces.length; i++) {
          context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
      } catch (e) {
        this.ExecuteFunctionSimple(functionName);
        console.log(e,functionName,window[functionName]);
        Flash.Build({
          type: 'error',
          title: 'EXECUTION ERROR',
          message: 'A Function was unable to execute due to an unkown error',
          delay: 10000
        })
      }
    }
  },
  ExecuteFunctionSimple:function(fn){
    try {
      let codeToExecute = window[fn];
      let tmpFunc = new Function(codeToExecute);
      tmpFunc();
      console.log(fn+' has been executed',tmpFunc);
    }catch(e){
      console.log(e,fn);
      Flash.Build({
        type: 'error',
        title: 'EXECUTION ERROR',
        message: 'A Function was unable to execute due to an unkown error',
        delay: 10000
      })
    }
  },
  ImageExists: function (url) {
    /*
     @return {boolean}
     */
    let http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status !== 404;
  },
  PiklWrapper:function() {
    $(Config.defaults.domRoot).contents().wrapAll('<section role="content" pikl-has-gutter="false" class="dill">');
  },
  RegisterEvents: function (obj) {
    if (typeof obj === 'object') {
      for (let o in obj) {
        $(Config.defaults.domRoot).on(obj[o].handler, '[name="' + o + '"]', function () {
          Assistants.ExecuteFunctionByName(obj[o].function, window);
        });
      }
    }
  },
  Repeat: function (str, times) {
    return new Array(times + 1).join(str);
  },
  ReplaceHandle: function (a, b) {
    if (Templates.Inline[a] !== undefined) {
      return Templates.Inline[a].replace('{{handle}}', b);
    } else {
      return b;
    }
  },
  SplitContent: function (obj) {
    obj.cols = obj.cols || 1;
    obj.split = obj.split || null;
    let textArray = [], splitOffset, slicePosition, i, sliceStart;
    if (obj.cols !== undefined && obj.cols !== 1) {
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
          if (i === 1) {
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
  StringModifiers: function (str, mods) {
    let acceptedMods = ['rev', 'trim', 'whiteout', 'concat'];
    if (typeof mods === 'object') {
      $.each(mods, function (key, value) {
        if ($.inArray(value, acceptedMods) > -1) {
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
    } else {

    }
  },
  SwapReserved: function (a) {
    let res = Config.reserved, r, sub, s;
    for (r in res) {
      if (typeof res[r] === 'object') {
        sub = res[r];
        for (s in sub) {
          if (a !== undefined) {
            a = a.replace(new RegExp(s, 'g'), sub[s]);
          }
        }
      } else {
        a = a.replace(new RegExp(r, 'g'), res[r]);
      }
    }
    return a;
  },
  TagBuilder: function (tag, multiplier, content) {
    let s = {}, tagDisplay, tagOutput, i;
    s.div = {tag: '<div>', close: true};
    s.br = {tag: '<br />', close: false};
    s.p = {tag: '<p>', close: true};
    s.i = {tag: '<i>', close: true};
    s.b = {tag: '<strong>', close: true};
    s.nav = {tag: '<nav>', close: true};
    s.section = {tag: '<section>', close: true};
    s.header = {tag: '<header>', close: true};
    s.footer = {tag: '<footer>', close: true};
    tagDisplay = s[tag].tag;
    if (multiplier !== undefined && multiplier !== null) {
      tagOutput = '';
      for (i = 0; i < multiplier; i++) {
        tagOutput += tagDisplay;
        tagOutput += Assistants.SwapReserved(content[i]);
        if (s[tag].close === true) {
          tagOutput += tagDisplay.replace('<', '</');
        }
      }
    } else {
      tagOutput = tagDisplay;
      if (s[tag].close === true) {
        if (content !== undefined) {
          tagOutput += Assistants.SwapReserved(content);
        }
        tagOutput += tagDisplay.replace('<', '</');
      }
    }
    return tagOutput;
  },
  TimeStamp: function () {
    return Math.floor(Date.now() / 1000);
  }
};
