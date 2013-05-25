/*
 * File: module/animationservice.js
 * 
 * Copyright 2011  SURFfoundation
 * 
 * This file is part of InContext.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * For more information: http://code.google.com/p/surf-incontext/
 */

(function ($) {
  Visualizer.AnimationService = function (moduleID, sandbox) {

    var canvas;
    var animationCanvas;

    var copyStyles = ['font-size', 'font-weight', 'font-style', 'color',
        'text-transform', 'text-decoration', 'letter-spacing', 'word-spacing',
        'line-height', 'text-align', 'vertical-align', 'direction', 'background-color',
        'background-image', 'background-repeat', 'background-position',
        'background-attachment', 'opacity', 'width', 'height',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border-top-width', 'border-right-width', 'border-bottom-width',
        'border-left-width', 'border-top-color', 'border-right-color',
        'border-bottom-color', 'border-left-color', 'border-top-style',
        'border-right-style', 'border-bottom-style', 'border-left-style',
        'display', 'visibility', 'z-index', 'overflow-x', 'overflow-y', 'white-space',
        'clip', 'float', 'clear', 'cursor', 'list-style-image', 'list-style-position',
        'list-style-type', 'marker-offset'];

    var animationStyles = ['font-size', 'color', 'line-height', 'opacity',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'background-color'];

    function isTransparent(value) {
      if (value.indexOf("rgba") != -1)
        return true;
      if (value == 'transparent')
        return true;
    }

    return {

      beginTransitionA: function (_canvas, fromObject, fromStateCanvas, toObject, toStateCanvas, callback) {

        if (callback)
          callback();
      },

      //Starts the transition between the current and new canvas
      beginTransition: function (_canvas, fromObject, fromStateCanvas, toObject, toStateCanvas, callback) {
        canvas = _canvas;

        var that = this;

        if (animationCanvas) {
          animationCanvas.remove();
        }

        // create a canvas for the transition story (the from and to objects moving to their new positions)
        animationCanvas = this.createAnimationLayer(canvas, fromStateCanvas, toStateCanvas);

        // Animate from an object?
        if (fromObject) {
          fromStateCanvas.css('z-index', "3000");

          // Fadeout the previous state
          fromStateCanvas.fadeOut(200);

          var duration = 500;

          if (fromStateCanvas.height() < toStateCanvas.height()) {
            canvas.animate({
              'height': toStateCanvas.outerHeight()
            }, 300);
          }

          // Animate from the aggregation (as centerobject)
          if (fromObject == fromObject.aggregate) {
            this.animateCenterToTitle(fromStateCanvas, toStateCanvas, duration);
          }
          // Animate from an existing object to center
          else {
            var sourceFrom = fromStateCanvas.find('div.centerobject .padding');
            var targetFrom = toStateCanvas.find('div.title a[rel="' + fromObject.getId() + '"]').closest('li.object');

            if (targetFrom.length) {
              this.animateCenterToCloudObject(sourceFrom, targetFrom, duration);
            }
          }

          // Animate to the aggregation (as title)
          if (toObject == toObject.aggregate) {
            this.animateTitleToCenter(fromStateCanvas, toStateCanvas, duration);
          }
          // Regular animation
          else {
            var sourceTo = fromStateCanvas.find('li.object a[rel="' + toObject.getId() + '"]').closest('li.object');
            var targetTo = toStateCanvas.find('div.centerobject .padding');

            if (sourceTo.length) {
              this.animateCloudObjectToCenter(sourceTo, targetTo, duration);
            }
          }

          var wait = setInterval(function () {
            if (animationCanvas) {
              if (!animationCanvas.find(":animated").length) {
                clearInterval(wait);

                if (fromStateCanvas.height() > toStateCanvas.height()) {
                  canvas.animate({
                    'height': toStateCanvas.outerHeight()
                  }, 300);
                }

                toStateCanvas.css('visibility', 'visible');

                that.fadeIn(toStateCanvas, 100, function () {

                  if (animationCanvas) {
                    animationCanvas.fadeOut(200, function () {
                      if (animationCanvas) {
                        animationCanvas.remove(); animationCanvas = null;
                      }
                    });
                  }

                  //Callback when animation is finished
                  if (callback)
                    callback();
                });
              }
            }
          }, 100);
        }
        // Animate without previous state
        else {
          canvas.animate({ "height": toStateCanvas.outerHeight() }, 100, function () {
            toStateCanvas.css('visibility', 'visible');
            that.fadeIn(toStateCanvas, 300, function () {

              animationCanvas.remove();
              animationCanvas = null;

              //Callback when animation is finished
              if (callback)
                callback();
            });
          });
        }
      },

      createAnimationLayer: function (canvas, fromStateCanvas, toStateCanvas) {
        // create a canvas for the transition story (the from and to objects moving to their new positions)
        var animationCanvas = $('<div class="visualizer_statecanvas"></div>');
        canvas.append(animationCanvas);

        animationCanvas.append(toStateCanvas.find('.titlebar').clone());

        var animationCanvasHeight = Math.max(fromStateCanvas ? fromStateCanvas.height() : 0, toStateCanvas.height());

        animationCanvas.css({
          'background-color': 'transparent',
          'z-index': 2000,
          'width': toStateCanvas.width(),
          'height': animationCanvasHeight
        });

        return animationCanvas;
      },

      animateCenterToTitle: function (fromStateCanvas, toStateCanvas, time) {
        var center = fromStateCanvas.find('.centerobject');
        var centerTitle = fromStateCanvas.find('.centerobject .title');
        var title = toStateCanvas.find('.titlebar h2');

        var centerTitleCopy = centerTitle.clone();
        animationCanvas.append(centerTitleCopy);
        centerTitleCopy.css({
          "position": "absolute",
          "color": centerTitle.css("color"),
          'text-align': 'center',
          'width': centerTitle.width(),
          'background-color': center.css("background-color")
        });

        centerTitleCopy.offset(centerTitle.offset());

        centerTitleCopy.animate({
          left: title.offset().left - title.offsetParent().offset().left,
          top: title.offset().top - title.offsetParent().offset().top,
          height: title.height(),
          width: title.width(),
          fontSize: title.css('fontSize'),
          color: title.css('color'),
          backgroundColor: toStateCanvas.parent().css('background-color')
        }, time).fadeOut(100);
      },

      animateTitleToCenter: function (fromStateCanvas, toStateCanvas, time) {

      },

      animateCenterToCloudObject: function (source, target, time) {
        var divSource = this.clone(source);
        animationCanvas.append(divSource);

        divSource.css({
          'position': 'absolute',
          'height': source.height(),
          'width': source.width(),
          'margin': 0,
          'left': source.offset().left - canvas.offset().left,
          'top': source.offset().top - canvas.offset().top
        });

        var targetStyles = this.getComputedStyles(target, animationStyles);
        $.extend(targetStyles, {
          'left': target.offset().left - canvas.offset().left,
          'top': target.offset().top - canvas.offset().top,
          'height': target.height(),
          'width': target.width(),
          'margin-left': 0,
          'margin-top': 0,
          'margin-bottom': 0,
          'margin-right': 0
        });

        divSource.animate(targetStyles, { duration: time });

        // Padding
        var divPadding = $('<div />');
        divSource.append(divPadding);

        var paddingTargetStyles = this.getComputedStyles(target.find('.padding'), animationStyles);
        divPadding.animate(paddingTargetStyles, time);

        // Type
        var divType = this.clone(source.find('.type'));
        divPadding.append(divType);

        divType.html(source.find('.type').html());

        var typeTargetStyles = this.getComputedStyles(target.find('.type'), animationStyles);
        divType.animate(typeTargetStyles, time);

        // Title
        var divTitle = this.clone(source.find('.title'));
        divPadding.append(divTitle);

        divTitle.html(source.find('.title').html());

        var titleTargetStyles = this.getComputedStyles(target.find('.title'), animationStyles);
        divTitle.animate(titleTargetStyles, time);
      },

      animateCloudObjectToCenter: function (source, target, time) {
        var divSource = this.clone(source);
        animationCanvas.append(divSource);

        divSource.css({
          'position': 'absolute',
          'height': source.height(),
          'width': source.width(),
          'margin': 0,
          'left': source.offset().left - canvas.offset().left,
          'top': source.offset().top - canvas.offset().top
        });

        var targetStyles = this.getComputedStyles(target, animationStyles);
        $.extend(targetStyles, {
          'left': target.offset().left - canvas.offset().left,
          'top': target.offset().top - canvas.offset().top,
          'height': target.height(),
          'width': target.width(),
          'margin-left': 0,
          'margin-top': 0,
          'margin-bottom': 0,
          'margin-right': 0
        });

        divSource.animate(targetStyles, { duration: time });

        // Padding
        var divPadding = this.clone(source.find('.padding'));
        divSource.append(divPadding);

        var paddingTargetStyles = { "padding-left": 0, "padding-right": 0, "padding-top": 0, "padding-bottom": 0 };
        divPadding.animate(paddingTargetStyles, time);

        // Type
        var divType = this.clone(source.find('.type'));
        divPadding.append(divType);

        divType.html(source.find('.type').html());

        var typeTargetStyles = this.getComputedStyles(target.find('.type'), animationStyles);
        divType.animate(typeTargetStyles, time);

        // Title
        var divTitle = this.clone(source.find('.title'));
        divPadding.append(divTitle);

        divTitle.html(source.find('.title').text());

        var titleTargetStyles = this.getComputedStyles(target.find('.title'), animationStyles);
        divTitle.animate(titleTargetStyles, time);
      },

      getComputedStyles: function (element, styleArray) {
        var styles = {};
        var that = this;

        $.each(styleArray, function (i, style) {
          if (element.css(style) && (style != "background-color" || !isTransparent(element.css(style)))) {
            styles[style] = element.css(style);
          }
        });

        return styles;
      },

      clone: function (source) {
        var div = $('<div />');

        div.css(this.getComputedStyles(source, copyStyles));

        return div;
      },

      oldTransition: function (canvas, fromObject, fromStateCanvas, toObject, toStateCanvas, callback) {
        var that = this;

        //Is there a fromStateCanvas (is null on first draw)
        if (fromStateCanvas) {

          var sourceFrom = fromStateCanvas.find('div.centerobject');
          var targetFrom = toStateCanvas.find('div.title a[rel="' + fromObject.getId() + '"]').closest('li.object');

          var sourceTo = fromStateCanvas.find('li.object a[rel="' + toObject.getId() + '"]').closest('li.object');
          var targetTo = toStateCanvas.find('div.centerobject');

          if (sourceFrom.length > 0) {
            cloneFrom = sourceFrom.clone();
            animationCanvas.append(cloneFrom);

            cloneFrom.css({
              'position': 'absolute',
              'left': sourceFrom.offset().left - canvas.offset().left,
              'top': sourceFrom.offset().top - canvas.offset().top,
              'width': sourceFrom.width(),
              'height': sourceFrom.height()
            });
          }

          if (sourceTo.length > 0) {
            cloneTo = $('<div class="object"/>').html(sourceTo.html());
            animationCanvas.append(cloneTo);
            cloneTo.find('.gradient').remove();
            cloneTo.find('.annotations').remove();
            cloneTo.find('.title').after(targetTo.find('.properties').clone());

            cloneTo.find('.properties .label').css('color', targetTo.find('.properties .label').css('color'));
            cloneTo.find('.properties .value').css('color', targetTo.find('.properties .value').css('color'));
            cloneTo.find('.properties .value a').css('color', targetTo.find('.properties .value a').css('color'));

            cloneTo.find('.properties').css({ overflow: 'hidden', height: 0 });
            cloneTo.css({
              'position': 'absolute',
              'left': sourceTo.offset().left - canvas.offset().left,
              'top': sourceTo.offset().top - canvas.offset().top,
              'width': sourceTo.width(),
              'height': sourceTo.height(),
              'margin': 0
            });
          }

          that.fadeOut(fromStateCanvas, 300, function () { fromStateCanvas.remove(); });
          canvas.animate({ "height": toStateCanvas.outerHeight() }, 300, function () {
            var animationTime = 200;

            if (cloneTo) {
              if (targetTo.length > 0) {
                cloneTo.find('.properties').animate({ height: targetTo.find('.properties').height() });
                cloneTo
                .animate({
                  left: targetTo.offset().left - canvas.offset().left,
                  top: targetTo.offset().top - canvas.offset().top,
                  height: targetTo.outerHeight(),
                  width: targetTo.outerWidth(),
                  border: 0,
                  backgroundColor: '#6e84c0'
                }, { duration: animationTime, easing: 'easeInOutQuad', queue: false });
              }
              else {
                that.fadeOut(cloneTo, 100);
              }
            }

            if (cloneFrom) {
              if (targetFrom.length > 0) {
                cloneFrom.find('.properties').css('overflow', 'hidden').animate({ height: 0 }, animationTime);
                cloneFrom
                .animate({
                  left: targetFrom.offset().left - canvas.offset().left,
                  top: targetFrom.offset().top - canvas.offset().top,
                  height: targetFrom.outerHeight(),
                  width: targetFrom.outerWidth()
                }, { duration: animationTime, easing: 'easeInOutQuad', queue: false })
                .find('.padding').animate({ backgroundColor: '#ffffff' }, animationTime);
              }
              else {
                that.fadeOut(cloneFrom, 100);
              }
            }
            setTimeout(function () {

            }, animationTime);
          });

        }
        else {
          canvas.animate({ "height": toStateCanvas.outerHeight() }, 100, function () {
            toStateCanvas.css('visibility', 'visible');
            that.fadeIn(toStateCanvas, 300);

            //Callback when animation is finished
            if (callback)
              callback();
          });
        }
      },

      fadeIn: function (element, duration, callback) {
        var divFade = $('<div/>');
        var canvas = element.closest('div.visualizer_statecanvas');
        canvas.append(divFade);

        var parent = element.parent();

        var bgcolor;
        while (parent && !bgcolor) {
          if (parent.css('background-color')) {
            bgcolor = parent.css('background-color');
          }
        }

        divFade.css({
          'background-color': bgcolor ? bgcolor : '#fff',
          'position': 'absolute',
          'left': element.offset().left - canvas.offset().left,
          'top': element.offset().top - canvas.offset().top,
          'height': element.outerHeight(),
          'width': element.outerWidth(),
          'z-index': 1000
        });

        divFade.fadeOut(duration, function () {
          divFade.remove();

          if (callback)
            callback();
        });
      },

      fadeOut: function (element, duration, callback) {
        var divFade = $('<div/>');
        var canvas = element.closest('div.visualizer_statecanvas');
        canvas.append(divFade);

        var parent = element.parent();

        var bgcolor;
        while (parent && !bgcolor) {
          if (parent.css('background-color')) {
            bgcolor = parent.css('background-color');
          }
        }

        divFade.css({
          'background-color': bgcolor ? bgcolor : '#fff',
          'position': 'absolute',
          'left': element.offset().left - canvas.offset().left,
          'top': element.offset().left - canvas.offset().left,
          'height': element.outerHeight(),
          'width': element.outerWidth(),
          'z-index': 1000,
          'display': 'none'
        });

        divFade.fadeIn(duration, function () {
          element.hide();
          divFade.remove();

          if (callback)
            callback();
        });
      }
    }
  };
})(jQuery);