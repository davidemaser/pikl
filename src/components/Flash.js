/**
 * Created by David Maser on 16/06/2017.
 */
import {Config} from './Config';
import {Animations} from './Animations';
export const Flash = {
  /*
   Creates a notification panel at the bottom of the page
   that advises the user when an event is triggered
   */
  Template: '<section pikl-widget="flash" pikl-flash="{{type}}" {{style}}><div class="pikl __flash_{{type}} title">{{title}}</div><div class="pikl __flash_{{type}} body">{{body}}<div></div></div></section>',
  Build: function (obj) {
    let override = typeof obj === 'object' && obj.override !== undefined ? obj.override : false;
    let target = 'section[pikl-widget="flash"]', type, title, message, delay, style, codeBlock;
    if ($(target).length !== 0 && override !== true) {
      console.log('Flash object is already open');
    } else {
      $(target).remove();
      if (obj !== undefined && typeof obj === 'object') {
        type = obj.type;
        title = obj.title;
        message = obj.message;
        delay = parseInt(obj.delay) || 2500;
        style = 'style="bottom:-160px;"';
        codeBlock = Flash.Template.replace(/{{type}}/g, type).replace('{{title}}', title).replace('{{body}}', message).replace('{{style}}', style);
        $(Config.defaults.domRoot).prepend(codeBlock);
        $.when(
          Animations.SlideIntoPosition({
            object: 'section[pikl-widget="flash"]',
            direction: 'up',
            speed: 250,
            height: 0,
            remove: false
          })
        ).done(function () {
          setTimeout(function () {
            Animations.SlideIntoPosition({
              object: 'section[pikl-widget="flash"]',
              direction: 'down',
              speed: 250,
              remove: true
            });
          }, delay);
        });
      }
    }
    $(Config.defaults.domRoot).on('click', 'section[pikl-widget="flash"]', function () {
      Animations.SlideIntoPosition({
        object: 'section[pikl-widget="flash"]',
        direction: 'down',
        speed: 250,
        remove: true
      });
    })
  }
};