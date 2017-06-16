/**
 * Created by David Maser on 16/06/2017.
 */
import {Config} from './Config';
export const Animations = {
  /*
   Prebuilt animations that can be called directly or
   are used to animate properties in widgets and
   certain template objects
   */
  FadeOutOnClick: function (obj) {
    //{handler:'click',item:'',target:'',speed:500}
    $(Config.defaults.domRoot).on(obj.handler, obj.item, function () {
      $(obj.target).animate({opacity: 0}, obj.speed, function () {
        $(this).remove();
      });
    });
  },
  SlideOutOnClick: function (obj) {
    $(Config.defaults.domRoot).on(obj.handler, obj.item, function () {
      let itemWidth = obj.item.width;
      $(obj.target).animate({left: -itemWidth}, obj.speed);
    });
  },
  SlideIntoPosition: function (obj) {
    let item = obj.object;
    let dir = obj.direction;
    let speed = obj.speed || 300;
    let remove = obj.remove;
    let height = obj.height !== undefined ? obj.height : $(item).height();
    let width = obj.width !== undefined ? obj.width : $(item).width();
    if (dir === 'down') {
      $(item).animate({bottom: -height}, speed, function () {
        remove === true ? $(item).remove() : false;
      });
    } else if (dir === 'up') {
      $(item).animate({bottom: height}, speed, function () {
        remove === true ? $(item).remove() : false;
      });
    } else if (dir === 'left') {
      $(item).animate({left: -width}, speed, function () {
        remove === true ? $(item).remove() : false;
      });
    } else if (dir === 'right') {
      $(item).animate({right: width}, speed, function () {
        remove === true ? $(item).remove() : false;
      });
    }
  },
  GutterStateMotion: function () {
    /*
     private function that handles the gutter menu and
     page section animation when the gutter toggle
     button is clicked
     */
    let animationType = $('section[role="menu"]').attr('pikl-gutter-state') === 'visible' ? 'n' : 'p',
      gutterMenu = $('section[role="menu"]'), pageBody = $('section[role="content"]'), gutterWidth = gutterMenu.width(),
      gutterOffset, gutterState, bodyWidth;
    if (animationType === 'n') {
      gutterOffset = -gutterWidth;
      gutterState = 'invisible';
      bodyWidth = 0;
    } else if (animationType === 'p') {
      gutterOffset = 0;
      gutterState = 'visible';
      bodyWidth = '20%';
    }
    $(gutterMenu).animate({left: gutterOffset}, 500, function () {
      $(this).attr('pikl-gutter-state', gutterState);
    });
    $(pageBody).animate({left: bodyWidth}, 500, function () {
      $(this).attr('pikl-gutter-state', gutterState);
    })
  }
};