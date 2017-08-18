/**
 * Created by David Maser on 16/06/2017.
 */
import {Assistants} from './Assistants';
export const Form = {
  closures: ['select', 'input', 'button', 'textarea', 'form'],
  Build: function (obj, target) {
    if (obj !== undefined && typeof obj === 'object') {
      target = target || $('pikl[is="form"]');
      let formTemplate = '<form {{attributes}} name="{{name}}" action="{{action}}">{{formItems}}</form>';
      let formObject = {};
      $.each(obj, function (key, value) {
        formObject[key] = value;
        if (key === 'items') {
          formObject['items'] = value;
        }
      });
      layoutForm(formObject);
      function layoutForm(obj) {
        let formItems;
        for (let o in obj) {
          if (typeof obj[o] !== 'object') {
            formTemplate = formTemplate.replace('{{' + o + '}}', obj[o]);
          } else {
            formItems = obj[o];
          }
        }
        handleFormItem(formTemplate, formItems);
      }

      function handleFormItem(template, obj) {
        let string = '', events = {}, o, tempObject, formType, formItemID, formItemClass, t, optionObject, optionString,
          a;
        for (o in obj) {
          tempObject = obj[o];
          formType = obj[o].element;
          formItemID = obj[o].id !== undefined && obj[o].id !== '' ? ` id="${obj[o].id}"` : '';
          formItemClass = obj[o].class !== undefined && obj[o].class !== '' ? ` class="${obj[o].class}"` : '';
          if ($.inArray(formType, Form.closures) > -1) {
            if (obj[o].event !== undefined && typeof obj[o].event === 'object') {
              events[obj[o].name] = obj[o].event;
            }
            string += obj[o].label !== undefined && obj[o].label !== '' ? `<label for="${obj[o].name}">${obj[o].label}</label>` : '';
            if (formType === 'input') {
              string += '<input';
              string += formItemID + formItemClass;
              string += ` type="${obj[o].type}" name="${obj[o].name}"`;
              string += obj[o].placeholder !== undefined && obj[o].placeholder !== '' ? ` placeholder="${obj[o].placeholder}"` : '';
              string += obj[o].value !== undefined && obj[o].value !== '' ? ` value="${obj[o].value}"` : '';
              string += obj[o].checked !== undefined && obj[o].checked !== '' && obj[o].checked === 'true' ? ' checked' : '';
              string += '/>';
            } else if (formType === 'select') {
              string += '<select';
              string += formItemID + formItemClass;
              string += ` name="${obj[o].name}">{{options}}</select>`;
            } else if (formType === 'button') {
              string += '<button';
              string += formItemID + formItemClass;
              string += ` name="${obj[o].name}">${obj[o].value}</button>`;
            } else if (formType === 'textarea') {
              string += '<textarea';
              string += formItemID + formItemClass;
              string += ` name="${obj[o].name}"`;
              string += obj[o].width !== undefined && obj[o].width !== '' ? ` width="${obj[o].width}"` : '';
              string += obj[o].height !== undefined && obj[o].height !== '' ? ` height="${obj[o].height}"` : '';
              string += `>${obj[o].value}</textarea>`;
            }
            for (t in tempObject) {
              if (typeof tempObject[t] === 'object') {
                optionObject = tempObject[t];
                optionString = '';
                for (a in optionObject) {
                  optionString += `<option name="${optionObject[a].name}">${optionObject[a].value}</option>`;
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
        Assistants.RegisterEvents(events);
      }
    }
  }
}