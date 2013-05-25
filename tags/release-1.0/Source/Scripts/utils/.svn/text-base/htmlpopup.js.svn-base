/*!
 * File: utils/htmlpopup.js
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
  Visualizer.HtmlPopup = function (container, openingElement, options) {

    var defaultOptions = {
      positionClass: 'top',
      closeButton: false,
      onClose: null,
      minWidth: 0,
      maxWidth: Infinity,
      minHeight: 0,
      maxHeight: Infinity
    };

    var settings = $.extend(defaultOptions, options);

    var canvas = container;
    var divPopup = null;
    var divContent = null;

    var _content = null;

    return {
      isOpen: false,

      setContent: function (content) {
        _content = content;
        if (divContent)
          divContent.html(_content);
      },

      open: function () {
        if (!divPopup) {
          this.draw();
        }

        divPopup.show();
        this.isOpen = true;
      },

      close: function () {
        this.isOpen = false;
        divPopup.hide();

        if (settings.onClose) {
          settings.onClose();
        }
      },

      destroy: function () {
        this.isOpen = false;
        this.close();

        divPopup.remove();
        divPopup = null;
      },

      draw: function () {
        divPopup = $('<div class="hover_popup" />');
        canvas.append(divPopup);
//        divPopup.css("overflow", "hidden");

        var divDirection = $('<div class="direction_hover_popup" />');
        divPopup.append(divDirection);

        var divBackground = $('<div class="bg_hover_popup" />');
        divPopup.append(divBackground);

        divContent = $('<div class="content_hover_popup"/>');
        divPopup.append(divContent);
        divContent.html(_content);

        if (settings.minWidth)
          divContent.css("min-width", settings.minWidth + "px");
        if (settings.maxWidth != Infinity)
          divContent.css("max-width", settings.maxWidth + "px");

        if (settings.closeButton) {
          var aClose = $('<a href="#" class="close_popup">X</a>');
          divPopup.append(aClose);

          var that = this;

          aClose.click(function (event) {
            event.preventDefault();

            that.close();
          });
        }

        // add position for arrow by classname
        divPopup.addClass(settings.positionClass);

        // define positions popup:
        var x = openingElement.offset().left - canvas.offset().left + (openingElement.width()/2)- (divPopup.width() / 2);
        var y = settings.positionClass == 'bottom' ? openingElement.offset().top - canvas.offset().top + (openingElement.height()+5) : openingElement.offset().top - canvas.offset().top - divPopup.height();

        // Change positions if left or right boundary is crossed
        if (x + divPopup.width() > canvas.width()) x = canvas.width() - divPopup.width();
        else if (x < 0) x = 10;

        if (settings.positionClass == 'bottom' && (y + divPopup.height() > canvas.offset().top + canvas.height())) {
          divPopup.removeClass('bottom');
          divPopup.addClass('top');
          y = openingElement.offset().top - canvas.offset().top - divPopup.height();
        } else if (settings.positionClass == 'top' && (y < canvas.offset().top)) {
          divPopup.removeClass('top');
          divPopup.addClass('bottom');
          y = openingElement.offset().top - canvas.offset().top + 20;
        }

        if (divPopup.height() > settings.maxHeight) {
          divContent.css({ "height": settings.maxHeight + "px", "overflow": "auto" });
        }

        // and... position popup
        divPopup.css({
          'left': x + 'px',
          'top': y + 'px'
        });

        // position arrow within popup:
        var dirx = openingElement.offset().left - divPopup.offset().left + 3;
        //if dirx has a negative value it means the arrow is gonna be placed outside the visible box so center it then:
        if(dirx<0) dirx = '50%';
        divDirection.css({
          'left': dirx
        });

        //set height+width for transparent background:
        divBackground.css({
          'height': (divPopup.height()),
          'width': (divPopup.width())
        });
      }
    }
  };
})(jQuery);