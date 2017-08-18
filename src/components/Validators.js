/**
 * Created by David Maser on 16/06/2017.
 */
import {Flash} from './Flash';
export const Validators = {
  json: function (code) {
    try {
      return JSON.parse(code);
    } catch (e) {
      Flash.Build({
        type: 'error',
        title: 'JSON Parse Error',
        message: `Unable to parse JSON ${e}`,
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
    let doc = document.createElement('div');
    doc.innerHTML = code;
    return ( doc.innerHTML === code );
  }
};