/**
 * Created by David Maser on 16/06/2017.
 */
import {Assistants} from './Assistants';
import {Config} from './Config';
import {Animations} from './Animations';
import {Log} from './Log';
import {Flash} from './Flash';
export const Components = {
  /*
   Pikl template components. Function is called by core builder
   when pikl is="component" tag is encountered
   */
  Store: {},
  Build: function (obj, params, text, target) {
    Components.Store[obj] = {};
    Components.Store[obj]['param'] = params;
    Components.Store[obj]['text'] = text;
    Components.Store[obj]['target'] = target;
    switch (obj) {
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
      case 'nav':
        this.Navigation();
        break;
      case 'modal':
        this.Modal.Create(JSON.parse(text));
        break;
    }
    Log.Write('build', {event: 'components', response: obj, completed: true});
  },
  Footer: function () {
    let _this = Components.Store.footer;
    let content = _this.param.cols !== undefined && _this.param.split !== undefined ? Assistants.SplitContent({
      cols: _this.param.cols,
      split: _this.param.split,
      text: _this.text
    }) : '';
    let template = {
      parent: '<footer>{{content}}</footer>',
      columns: {},
      template: {
        columns: {
          multiple: '<div class="footer_column">{{content}}</div>'
        }
      }
    };
    let childString = '';
    if (typeof content === 'object') {
      if (Array.isArray(content)) {
        for (let c in content) {
          childString += template.columns.multiple.replace('{{content}}', content[c]);
        }
      }
      let compactString = template.parent.replace('{{content}}', childString);
      $(compactString).insertBefore(_this.target);
      _this.target.remove();
    }
  },
  Gutter: function () {
    let _this = Components.Store.gutter;
    let content = _this.param.cols !== undefined && _this.param.split !== undefined ? Assistants.SplitContent({
      cols: _this.param.cols,
      split: _this.param.split,
      text: _this.text
    }) : '';
    let defaultState = 'visible';
    let childString = '', c, compactString, attrString = '', p;
    let template = {
      parent: '<section role="menu"{{attributes}}>{{content}}</section>',
      rows: {
        multiple: '<div class="gutter_column">{{content}}</div>'
      },
      button: '<i class="pikl __gutter_button"></i>'
    };
    if (typeof content === 'object') {
      if (Array.isArray(content)) {
        for (c in content) {
          childString += template.rows.multiple.replace('{{content}}', content[c]);
        }
      }
      compactString = template.parent.replace('{{content}}', template.button + childString);
      $(Config.defaults.domRoot).prepend(compactString).find('section[role="content"]').attr('pikl-has-gutter', 'true').attr('pikl-gutter-state', defaultState);
      _this.target.remove();
    } else {
      attrString = '';
      if (_this.param !== undefined && typeof _this.param === 'object') {
        for (p in _this.param) {
          attrString += ' pikl-gutter-' + p + '="' + _this.param[p] + '"';
          if (p === 'state') {
            defaultState = _this.param[p];
          }
        }
      }
      compactString = template.parent.replace('{{content}}', template.button + _this.text);
      compactString = compactString.replace('{{attributes}}', attrString);
      $(Config.defaults.domRoot).prepend(compactString).find('section[role="content"]').attr('pikl-has-gutter', 'true').attr('pikl-gutter-state', defaultState);
      _this.target.remove();
    }
    $(Config.defaults.domRoot).on('click', '.pikl.__gutter_button', function () {
      Assistants.ExecuteFunctionByName('Animations.GutterStateMotion', window);
    });
    Log.Write('gutter', {event: 'components', response: _this, completed: true});
  },
  Header: function () {
    let _this = Components.Store.header;
    let content = _this.param.cols !== undefined && _this.param.split !== undefined ? Assistants.SplitContent({
      cols: _this.param.cols,
      split: _this.param.split,
      text: _this.text
    }) : '';
    let template = {
      parent: '<header>{{content}}</header>',
      columns: {
        multiple: '<div class="header_column">{{content}}</div>'
      }
    };
    let childString = '', c, compactString;
    if (typeof content === 'object') {
      if (Array.isArray(content)) {
        for (c in content) {
          childString += template.columns.multiple.replace('{{content}}', content[c]);
        }
      }
      compactString = template.parent.replace('{{content}}', childString);
      $(compactString).insertBefore(_this.target);
      _this.target.remove();
    }
    Log.Write('header', {event: 'components', response: _this, completed: true});
  },
  Image: function () {
    let _this = Components.Store.image;
    let _params = _this.param !== undefined ? _this.param : undefined;
    let template = {
      parent: '<img {{params}}>',
      params: {
        src: 'src="{{src}}"',
        width: ' width="{{width}}"',
        height: ' height="{{height}}"',
        style: ' style="{{style}}"'
      }
    };
    let t, childString = '', compactString, src;
    if (typeof _params === 'object' && _params !== undefined) {
      for (t in _params) {
        if (t === 'src') {
          src = _params[t];
        }
        childString += template.params[t].replace('{{' + t + '}}', _params[t]);
      }
      compactString = template.parent.replace('{{params}}', childString);
      if (Assistants.ImageExists(src) !== false) {
        $(compactString).insertBefore(_this.target)
      }
      _this.target.remove();
    }
  },
  Navigation: function () {
    let _this = Components.Store.nav;
    let content = _this.param.cols !== undefined && _this.param.split !== undefined ? Assistants.SplitContent({
      cols: _this.param.cols,
      split: _this.param.split,
      text: _this.text
    }) : _this.text;
    try {
      content = JSON.parse(content);
      content = content['nav'];
    } catch (e) {
      Flash.Build({
        type: 'format error',
        title: 'JSON Formatting Error',
        message: 'Unable to parse the string as JSON. Please validate the JSON string',
        delay: 10000
      });
    }
    let template = {
      parent: '<nav>{{content}}</nav>',
      item: '<div class="nav_item"><span>{{label}}</span><div class="nav_child">{{content}}</div></div>',
      columns: {
        simple: '<div class="nav_column"><span>{{label}}</span><div class="nav_column_child">{{content}}</div></div>',
        child: '<div class="nav_column_child_item">{{content}}</div>'
      }
    };
    let column, child, c, d, e, _itemLabel, _childLabel, _columnLabel;
    let _objectString = '';
    if (typeof content === 'object') {
      for (c in content) {
        _itemLabel = content[c].item;
        let _columnString = '';
        if (typeof content[c] === 'object') {
          column = content[c].columns;
          for (d in column) {
            _columnLabel = column[d].item;
            let _childString = '';
            if (typeof column[d] === 'object') {
              child = column[d].children;
              _childLabel = column[d].item;
              for (e in child) {
                _childString += template.columns.child.replace('{{content}}', child[e].child);
              }
            }
            _columnString += template.columns.simple.replace('{{label}}', _columnLabel).replace('{{content}}', _childString);
          }
        }
        _objectString += template.item.replace('{{label}}', _itemLabel).replace('{{content}}', _columnString);
      }
      _objectString = template.parent.replace('{{content}}', _objectString);
    }
    $(_objectString).insertBefore(_this.target);
    _this.target.remove();
  },
  Modal: {
    /*
     Creates a Pikl modal instance that can be called directly or
     nested in another template or compoenent object
     */
    Store: {},
    Structure: {
      default: '<div pikl-component="modal __default" pikl-component-name="{{name}}"><div class="pikl modal__container"><div class="pikl modal__title">{{title}}</div><div class="pikl modal__body">{{body}}</div><div class="pikl modal__buttons">{{buttons}}</div></div></div>'
    },
    Create: function (obj) {
      let _this = Components.Modal;
      let _target = Components.Store['modal']['target'];
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
      if (obj !== undefined && typeof obj === 'object') {
        let modalName = obj.name;
        let _buttonString = '';
        let _modalString = this.Structure.default.replace('{{name}}', modalName);
        let o, subObj, s, _buttons, b;
        if (_this.Store[modalName] === undefined) {
          _this.Store[modalName] = {};
          /*
           store the modal in the parent object so that
           it can be recalled by name later.
           */
          for (o in obj) {
            _this.Store[modalName][o] = obj[o];
            if (typeof obj[o] === 'object') {
              subObj = obj[o];
              for (s in subObj) {
                if (typeof subObj[s] !== 'object') {
                  _modalString = _modalString.replace('{{' + s + '}}', subObj[s]);
                } else {
                  // it's an object so it's going to be the buttons
                  _buttons = subObj[s];
                  for (b in _buttons) {
                    _buttonString += '<button pikl-type="' + _buttons[b].type + '">' + _buttons[b].label + '</button>';
                  }
                }
              }
              _modalString = _modalString.replace('{{buttons}}', _buttonString)
            } else {
            }
          }
          $(_modalString).insertBefore(_target);
          _target.remove();
        } else {
          //build modal from store data
          console.log('modal loaded from store');
          obj = _this.Store[modalName];
          for (o in obj) {
            if (typeof obj[o] === 'object') {
              subObj = obj[o];
              for (s in subObj) {
                if (typeof subObj[s] !== 'object') {
                  _modalString = _modalString.replace('{{' + s + '}}', subObj[s]);
                } else {
                  // it's an object so it's going to be the buttons
                  _buttons = subObj[s];
                  for (b in _buttons) {
                    _buttonString += '<button pikl-type="' + _buttons[b].type + '">' + _buttons[b].label + '</button>';
                  }
                }
              }
              _modalString = _modalString.replace('{{buttons}}', _buttonString)
            } else {
            }
          }
          $(_modalString).insertBefore(_target);
          _target.remove();
        }
        Animations.FadeOutOnClick({
          handler: 'click',
          item: 'button[pikl-type="refuse"]',
          target: '[pikl-component*="modal"]',
          speed: 500
        })
      } else {
        Flash.Build();
      }
    },
    Destroy: function (item) {
      if (item !== undefined) {
        $('[pikl-component-name="' + item + '"]').remove();
      } else {
        $('[pikl-component*="modal"]').remove();
      }
    }
  }
};