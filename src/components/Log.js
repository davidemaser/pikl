/**
 * Created by David Maser on 16/06/2017.
 */
import {Config} from './Config';
export const Log = {
  Store: {},
  Template: '<div>{@each}<div>{{key}} - {{value}}</div>{/each}</div>',
  Display: function (mode) {
    switch (mode) {
      case 'console':
        console.log(log.Store);
        break;
      case 'app':
        break;
    }
  },
  Write: function (origin, obj) {
    /*
     obj format is the following
     {event:'',response:'',completed:''}
     */
    try {
      if (typeof obj === 'object' && Config.log.enabled == true) {
        let _stamp = pa.TimeStamp();
        Log.Store[origin] = {};
        for (let o in obj) {
          Log.Store[origin][o] = obj[o];
        }
        Log.Store[origin]['timeStamp'] = _stamp;
      }
    } catch (e) {

    }
  },
  Flush: function () {

  }
}