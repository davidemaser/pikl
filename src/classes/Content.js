/**
 * Created by David Maser on 16/06/2017.
 */
import {App} from '../components/App';
import {Config} from '../components/Config';
import {Flash} from '../components/Flash';
import {Assistants} from '../components/Assistants';
import {Components} from '../components/Components';
import {Templates} from '../components/Templates';
import {Form} from '../components/Form';
import {Log} from '../components/Log';
import {Index} from '../components/Index'

export class Content {
  constructor(pklNode) {
    this.pklNode = pklNode;
    this.processContent(this.pklNode);
  }

  processContent() {
    /*
     Cycles through all pikl markup objects (<pikl>) and sends
     each accepted object to it's corresponding function.
     Each object will be treated by it's parent object
     function
     */
    let appendComma = false, targetObject = {}, targetItem, targetBinding, targetDataBinding, targetName, targetNode,
      targetContent, keyString, layoutObjects, nodeContent, sliceText = {}, objectIndex, calcString, mathOperators,
      calcObject = {}, calcMath, cleanObject, conditional, conditionType, conditionArgument, conditionCase = {},
      dateString, toRemove, passContent, _this, ajaxString, ajaxObject, ajaxParams,
      returnedData, param, value, template, templateObject = {}, tag, c, d, e, l, t, o, p, r, _options, componentType,
      componentParams, componentParamsObj = {}, componentText, paramArray, templateObjectType,
      templateBlock, templateObjectSubType, templateObjectContent, templateParams, objectLength, jsonPath,
      calc, dateUnit, timeUnit, targetModifiers = [], usingAjax;
    $(Config.defaults.tplTag.element).each(function () {
      keyString = '';
      targetBinding = $(this).attr('is');
      targetDataBinding = $(this).attr('bind');
      targetName = $(this).attr('name');
      targetObject = Index[targetDataBinding];
      targetContent = $(this).html().replace(/(\r\n|\n|\r)/gm, '').replace(/\}\s+\{/g, '}{');
      targetItem = $(this);
      if (targetContent.indexOf('{#mods') > -1) {
        targetModifiers = targetContent.split('{#mods ')[1].split('}')[0].split(',');
        targetContent = targetContent.replace('{#mods ' + targetContent.split('{#mods ')[1].split('}')[0] + '}', '');
      }
      tag = Config.defaults.tplTag.replacement;
      Assistants.StringModifiers(targetContent, targetModifiers);
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
            if (targetContent.indexOf('{@ajax') > -1) {
              let usingAjax = true;
              let ajaxTargetObject = $(this);
              ajaxString = targetContent.split('{@json}')[1].split('{/json}')[0].replace('{@ajax}', '').replace('{/ajax}', '');
              ajaxParams = ajaxString.split(',');
              ajaxObject = Assistants.AjaxParams(ajaxParams);
            } else {
              componentText = targetContent.split('{@json}')[1].split('{/json}')[0];
            }
          } else {
            componentText = targetContent.split('}')[1].split('{')[0];
          }
          for (p in componentParams) {
            if (componentParams.hasOwnProperty(p)) {
              paramArray = componentParams[p].split('=');
              componentParamsObj[paramArray[0]] = paramArray[1];
            }
          }
          if (usingAjax === true) {
            Assistants.Ajax(ajaxObject).done(function (result) {
              componentText = JSON.stringify(result);
              Components.Build(componentType, componentParamsObj, componentText, ajaxTargetObject);
            });
          } else {
            Components.Build(componentType, componentParamsObj, componentText, $(this));
          }
          break;
        case 'template':
        function collectOptions(options) {
          let _labels = {};
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
            Templates.Import(targetContent, targetItem);
          } else {
            let eachObject = template.split('}{@');
            for (e in eachObject) {
              let templateBlockOptions, templateOptions = undefined, templateBlockAttributes,
                templateAttributes = undefined;
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
                if (typeof templateObject[templateObjectType][templateObjectSubType] === 'object') {
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
            Templates.ParseContent(templateObject, targetItem);
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
                $(Assistants.TagBuilder(cleanObject.split('*')[0], cleanObject.split('*')[1], passContent)).insertBefore($(this));
              } else {
                $(Assistants.TagBuilder(cleanObject, null, passContent)).insertBefore($(this));
              }
            }
            objectIndex++;
            if (objectIndex === objectLength) {
              $(this).remove();
            }
          }
          break;
        case 'list':
          $(Assistants.BuildList(targetContent)).insertBefore($(this));
          $(this).remove();
          break;
        case 'form':
          if (targetContent.indexOf('@') > -1) {
            conditional = targetContent.split('@')[1].split('}')[0];
            if (conditional === 'json') {
              if (targetContent.indexOf('{@src') > -1) {
                jsonPath = targetContent.split('{@src=')[1].split('}')[0];
                Assistants.Ajax(jsonPath).done(function (result) {
                  Form.Build(result, targetItem);
                }).fail(function () {
                  Flash.Build({
                    type: 'error',
                    title: 'JSON Error',
                    message: 'Unable to load JSON data. Verify that the json file exists',
                    delay: 10000
                  })
                });
              } else {
                targetContent = targetContent.replace('{@json}', '').replace('{/json}', '');
                Form.Build(JSON.parse(targetContent), targetItem);
              }
            }
          }
          break;
        case 'data':
          targetNode = $(this).html().replace(/}/g, '').replace(/{/g, '').replace('#comma', '');
          appendComma = $(this).html().indexOf('{#comma}') > -1;
          if (typeof targetObject === 'object') {
            for (t in targetObject) {
              keyString += targetObject[t][targetNode] !== undefined ? targetObject[t][targetNode] : ' ';
              if (appendComma) {
                keyString += ', ';
              }
            }
          }
          keyString = keyString.trim();
          keyString = keyString.slice(-1) === ',' ? keyString.substring(0, keyString.length - 1) : keyString;
          $('<' + tag + '>' + keyString + '</' + tag + '>').insertBefore($(this));
          $(this).remove();
          break;
        case 'parser':
          /*
           parses the string content of a pikl object and converts it into a json object.
           JSON object is saved to the Pikl.App.Data object and can be accessed by other
           functions.
           */
        function parseContent(obj) {
          try {
            return JSON.parse(obj);
          } catch (e) {
            Flash.Build({
              type: 'error',
              title: 'JSON Error',
              message: 'Unable to convert the string to a JSON object. Verify that the string is valid JSON. Check console for the error message.',
              delay: 5000,
              override: true
            });
            console.log(e);
            return false;
          }
        }

          let _jsonOBJ = parseContent(targetContent);
          if (_jsonOBJ !== false) {
            let _jsonNode = targetDataBinding !== undefined && targetDataBinding !== null ? _jsonOBJ[targetDataBinding] : _jsonOBJ;
            App.Data[targetName] = targetName !== undefined && targetName !== '' ? _jsonNode : false;
            if (typeof _jsonNode === 'object') {
              for (let j in _jsonNode) {
                //console.log(_jsonNode[j]);
              }
            }
          }
          console.log(App.Data);
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
              let conditionCheck = {
                date: ['day', 'month', 'year'],
                time: ['hour', 'minute', 'second']
              };
              dateUnit = Assistants.Date(false, 'date');
              timeUnit = Assistants.Date(false, 'time');
              if (conditionArgument.indexOf('and') > -1) {
                conditionArgument = conditionArgument.split('and');
              }
              for (c in conditionArgument) {
                calc = conditionArgument[c].trim();
                calc = calc.split(' ');
                for (d in calc) {
                  if ($.inArray(calc[d], Config.DateConditions) > -1) {
                    if (Assistants.Comparison(dateUnit[calc[d]], calc[1], parseInt(calc[2]))) {
                      $('<' + tag + '>' + conditionCase.true + '</' + tag + '>').insertBefore($(this));
                      $(this).remove();
                    } else {
                      $('<' + tag + '>' + conditionCase.false + '</' + tag + '>').insertBefore($(this));
                      $(this).remove();
                    }
                  }
                }
              }
              Log.Write('if', {event: 'Conditional', response: conditionArgument, completed: true});
              break;
            case 'calc':
              try {
                mathOperators = ['abs', 'acos', 'asin', 'atan', 'ceil', 'cos', 'exp', 'floor', 'log', 'round', 'sin', 'sqrt', 'tan'];
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
                calcMath = $.inArray(calcMath, mathOperators) ? calcMath : null;
                $('<' + tag + '>' + Assistants.Calculate(calcString, calcMath || null) + '</' + tag + '>').insertBefore($(this));
                Log.Write('calc', {event: 'Calculation', response: calcObject, completed: true});
              } catch (e) {
                /*
                 assuming tat the math operator will be the main cause of errors
                 execute the Calculate function without it. If it fails, then
                 log an error
                 */
                try {
                  $('<' + tag + '>' + Assistants.Calculate(calcString) + '</' + tag + '>').insertBefore($(this));
                } catch (e) {
                  Log.Write('calc', {event: 'Calculation', response: calcObject, completed: false});
                }
              }
              $(this).remove();
              break;
            case 'date':
              dateString = targetContent.replace('{@date}', '').replace('{/date}', '');
              $('<' + tag + '>' + Assistants.Date(true, 'date') + '</' + tag + '>').insertBefore($(this));
              $(this).remove();
              break;
            case 'ajax':
              let _ajaxTarget = targetItem;
              ajaxString = targetContent.replace('{@ajax}', '').replace('{/ajax}', '');
              ajaxParams = ajaxString.split(',');
              returnedData = '';
              let ajaxObject = Assistants.AjaxParams(ajaxParams);
              Assistants.Ajax(ajaxObject).done(function (result) {
                result = ajaxObject.index !== undefined && ajaxObject.index !== '' ? result[ajaxObject.index] : result;
                if (ajaxObject.repeat === true || ajaxObject.repeat === 'true') {
                  for (r in result) {
                    returnedData += ajaxObject.node !== undefined && ajaxObject.node !== '' ? result[r][ajaxObject.node] !== undefined ? result[r][ajaxObject.node] + ' ' : '' : result[r] + ' ';
                  }
                }
                $('<' + tag + '>' + returnedData + '</' + tag + '>').insertBefore($(_ajaxTarget));
                $(_ajaxTarget).remove();
                Log.Write('ajax', {event: 'AJAX', response: returnedData || null, completed: true});
              }).fail(function () {
                Log.Write('ajax', {event: 'AJAX', response: returnedData || null, completed: false});
                Flash.Build({
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
}
