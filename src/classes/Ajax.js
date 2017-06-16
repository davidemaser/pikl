/**
 * Created by David Maser on 16/06/2017.
 */
import {Config} from '../components/Config';
import {Flash} from '../components/Flash';
import {Index} from '../components/Index';
import {Assistants} from '../components/Assistants';
import {Content} from './Content';

export class Ajax{
  constructor(){
    this.Json();
  }
  Json() {
    let ajaxCallUrl;
    let useFormat = $('html').attr('pikl-use');
    let useSource = $('html').attr('pikl-src');
    if (useFormat !== undefined && useFormat == 'json') {
      if (useSource !== undefined && useSource !== '') {
        ajaxCallUrl = Config.Ajax.root+useSource || Config.Ajax.default;
      } else {
        ajaxCallUrl = Config.Ajax.default;
      }
    }
    /*
     find all json nodes form the source file and
     place them in a global object
     */
    $.ajax({
      url: ajaxCallUrl,
      method: 'GET',
      success: function (data) {
        $.each(data, function (key, value) {
          Index[key] = value;
        })
      }, error: function () {
        Flash.Build({
          type: 'error',
          title: 'JSON Error',
          message: 'Unable to load JSON data. Verify that the json file exists',
          delay: 10000
        })
      }, complete: function () {
        /*
         ondce all indexes have been stored in the
         Index object, we can start searching in the
         html for Pikl template objects
         */
        $.when(Assistants.PiklWrapper()).done(function () {
          new Content('[pikl="true"]', 'fr');
        }).done(function () {
          $('[pikl="true"]').addClass('loaded');
          console.log('pikl is running');//herere
        });
      }
    });
  }
}
