/**
 * Created by David Maser on 16/06/2017.
 */
import {Assistants} from './Assistants';
import {Flash} from './Flash';
export const Templates = {
  Collection: {
    button: {
      code: '<button {{id}} {{class}} {{name}} {{attributes}} {{style}}>{{content}}</button>'
    },
    list: {
      code: '<ul>{@each}<li>{{content}}</li>{/each}</ul>'
    },
    form: {
      select: {
        code: '<select {{id}} {{class}} {{name}} {{attributes}} {{style}}>{@each}<option value="{{value}}">{{label}}</option>{/each}</select>'
      }
    },
    grid: {
      code: ''
    },
    table: {
      code: '<table {{id}} {{class}} {{name}} {{attributes}} {{style}}><tbody><th><td>{{header}}</td></th><tr><td>{{content}}</td></tr></tbody></table>'
    }
  },
  Inline: {
    id: 'id="{{handle}}"',
    class: 'class="{{handle}}"',
    style: 'style="{{handle}}"',
    name: 'name="{{handle}}"'
  },
  HandleContent: function (obj, target) {
    let objArray = [], o, thisObj, code, t, to;
    console.log(obj, target);
    if (typeof obj === 'object') {
      for (o in obj) {
        thisObj = obj[o];
        if (thisObj.code !== undefined) {
          code = thisObj.code;
          for (t in thisObj) {
            code = code.replace(`{{${t}}}`, thisObj[t]);
          }
          objArray.push(code);
        } else {
          for (t in thisObj) {
            thisObj = thisObj[t];
            if (typeof thisObj === 'object') {
              code = thisObj.code;
              for (to in thisObj) {
                code = code.replace(`{{${to}}}`, thisObj[to]);
                console.log(to, thisObj[to]);
              }
              objArray.push(code);
            }
          }
        }
      }
      console.log(objArray);
    } else {
      Flash.Build({
        type: 'error',
        title: 'Type Mismatch',
        message: 'Function was expecting an object but did not receive one',
        delay: 10000
      });
    }
    $(target).remove();
  },
  ParseContent: function (obj, target) {
    let accepts = {
      select: ['option', 'value'],
      button: ['repeat', 'attributes', 'class', 'id', 'event']
    };
    let o, _this, _typeTemplate, _repeat, t, _inlineObj, _parent, _child, _outputTemplate, _formattedString,
      _outputString, _outputWrapper, th, options, op;
    if (typeof obj === 'object') {
      for (o in obj) {
        _this = obj[o];
        _typeTemplate = Templates.Collection[o].code;
        _repeat = obj[o].repeat !== undefined && obj[o].repeat !== null ? parseInt(obj[o].repeat) : 1;
        if (typeof _this === 'object' && obj.hasOwnProperty(o)) {
          for (t in _this) {
            if (typeof _this[t] !== 'object') {
              if (Templates.Inline[t] === undefined) {
                _typeTemplate = _typeTemplate.replace(`{{${t}}}`, _this[t]);
              } else {
                _inlineObj = Assistants.ReplaceHandle(t, _this[t]);
                _typeTemplate = _typeTemplate.replace(`{{${t}}}`, _inlineObj);
              }
            } else {
              _parent = o;
              _child = t;
              _this = _this[t];
              _outputTemplate = Templates.Collection[_parent][_child] === undefined ? Templates.Collection[_parent].code : Templates.Collection[_parent][_child].code;
              _formattedString = '';
              if (_outputTemplate.indexOf('{@each}') > -1) {
                _outputString = _outputTemplate.split('{@each}')[1].split('{/each}')[0];
                _outputWrapper = _outputTemplate.split('{@each}')[0].replace('<', '').replace('>', '');
              } else {
                if (typeof _this === 'object') {
                  //console.log('inline not',o,obj[o],t,_this[t])
                  for (th in _this) {
                    _formattedString += `${_this[th][0]}="${_this[th][1]}" `;
                  }
                }
                _typeTemplate = _typeTemplate.replace(`{{${t}}}`, _formattedString);
              }
              if (_this.options !== undefined) {
                options = _this.options;
                for (op in options) {
                  _formattedString += _outputString.replace('{{value}}', options[op][1]).replace('{{label}}', options[op][0]);
                }
                _typeTemplate = `<${_outputWrapper}>${_formattedString}</${_outputWrapper}>`;
              }
            }
            /*for(let m in _this){
             console.log(m,_this,_this[m],typeof _this[m])
             if(typeof _this[m] !== 'object'){
             _typeTemplate = _typeTemplate.replace('{{'+m+'}}',Assistants.ReplaceHandle(m,_this[m]));
             }
             }*/
          }
        }
        _typeTemplate !== undefined && _typeTemplate !== '' ? this.DisplayContent(Assistants.Repeat(_typeTemplate, _repeat), target) : false;
      }
    }
  },
  DisplayContent: function (obj, target) {
    $(Assistants.CleanUp(obj)).insertBefore(target);
    $(target).css('display', 'none');
  },
  Extract: function (obj, target) {
    /*
     Extracts a template model from the page and
     places the code found in the Template Collection
     object in it's place
     */
    let o, t, tmp, codeBlock = '';
    if (typeof obj === 'object') {
      for (o in obj) {
        if (Templates.Collection[o].code === undefined) {
          tmp = Templates.Collection[o];
          for (t in tmp) {
            obj[o][t].code = Templates.Collection[o][t].code;
            codeBlock += Templates.Collection[o][t].code;
          }
        } else if (Templates.Collection[o].code !== undefined && Templates.Collection[o].code !== '') {
          obj[o].code = Templates.Collection[o].code;
          codeBlock += Templates.Collection[o].code;
        }
      }
      Templates.HandleContent(obj, target);
    }
  },
  Import: function (obj, target) {
    /*
     function imports html from a template object and
     stores it by it's name in the Template Collection
     object. It can then be called by name
     */
    let templateParams, templateModel, exists, templateContent, p, subObject;
    if (obj.indexOf('params') > -1) {
      templateParams = obj.split('params=[')[1].split(']')[0].split(',');
      //remove the params string after we've imported it
      obj = obj.replace(` params=[${templateParams}]`, '');
    }
    templateModel = obj.split('model=')[1].split('}')[0];
    exists = Templates.Collection[templateModel] !== undefined;
    if (exists !== true) {
      templateContent = obj.split('}')[1].split('{')[0];
      Templates.Collection[templateModel] = {};
      Templates.Collection[templateModel]['code'] = templateContent;
      if (templateParams !== undefined && templateParams !== '') {
        Templates.Collection[templateModel]['params'] = {};
        for (p in templateParams) {
          subObject = templateParams[p].split('=');
          Templates.Collection[templateModel]['params'][subObject[0]] = subObject[1];
        }
      } else {
        Templates.Collection[templateModel]['code'] = templateContent;
      }
      //new template objects have been imported into the Templates.Collection object. Call them by name
      console.log(`Model built having name ${templateModel}`, Templates.Collection[templateModel]);
    } else {
      Flash.Build({
        type: 'warning',
        title: 'Warning',
        message: `The template named "${templateModel}" already exists in the collection. Please chose another one`,
        delay: 10000
      });
    }
    $(target).remove();
  }
}