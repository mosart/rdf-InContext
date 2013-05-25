/*
 * File: module/htmldrawservice.js
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

/// <reference path="../dependencies/jquery-1.4.1.js"/>

(function ($) {

  //DrawService
  Visualizer.HtmlDrawService = function (moduleID, sandbox) {

    //Identifiers defined in config:
    var IdPropertyIdentifier = sandbox.getConfig("idProperty");
    var ImagePropertyIdentifier = sandbox.getConfig("imageTypeId");

    var DescriptionAnnotationPropertyIdentifier = sandbox.getConfig("descriptionAnnotationTypeId");

    var TypePropertyIdentifier = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

    var dontShowProperties = [IdPropertyIdentifier, TypePropertyIdentifier, ImagePropertyIdentifier];
    if (sandbox.getConfig("dontShowProperties")) {
      dontShowProperties = dontShowProperties.concat(sandbox.getConfig("dontShowProperties"));
    }

    var maxWidth = sandbox.getConfig("maxWidth");
    var LinkTarget = sandbox.getConfig("linkTarget");
    var ObjectLinkTarget = sandbox.getConfig("objectLinkTarget");

    var innerWidth = maxWidth - 20; // width minus padding;


    //Service references:
    var historyManager;
    var dataService;
    var cloudService;
    var animationService;

    //The DIV defined in HTML
    var outerCanvas;

    //Inner DIV with our own specified ID and CLASS
    var innerCanvas;

    //Holds the current visible visualization
    var currentStateCanvas;
    var currentObject;

    var popups = [];

    return {
      init: function () {
        historyManager = sandbox.getService("historymanager");
        dataService = sandbox.getService("dataservice");
        cloudService = sandbox.getService("cloudservice");
        animationService = sandbox.getService("animationservice");

        //Create the innerCanvas when the document is ready
        sandbox.subscribe("document.ready", function () {
          outerCanvas = $("#" + sandbox.getConfig("canvasId"));
          if (!outerCanvas.length) {
            alert("Fatal error: canvas not found!");
          }
          else {
            if (!outerCanvas.hasClass("visualizer_canvas")) {
              outerCanvas.addClass("visualizer_canvas");
            }
            innerCanvas = $('<div id="visualizer_innercanvas" class="visualizer_innercanvas"></div>');
            outerCanvas.append(innerCanvas);

            outerCanvas.css("width", maxWidth);
          }
        }, this);
      },

      //Get the property label for an URI
      beginDraw: function (object) {

        //Draw new canvas
        var newStateCanvas = $('<div class="visualizer_statecanvas"></div>');

        // Move the new canvas out of the screen while computing (display: none will disrupt height and width calculations)
        newStateCanvas.css('visibility', 'hidden');

        //Hide it before adding it to the innerCanvas (animation service will show it)
        innerCanvas.append(newStateCanvas);

        //Draw main Aggregation title bar
        this.drawTitleBar(newStateCanvas, object);

        //Draw clouds
        this.drawClouds(newStateCanvas, object);

        //Execute fixes for IE
        if ($.browser.msie) {
          this.fixIE(object);
        }

        //Start animation
        animationService.beginTransition(innerCanvas, currentObject, currentStateCanvas, object, newStateCanvas, function () {
          //Callback when animation is finished

          //Always remove current state canvas
          if (currentStateCanvas)
            currentStateCanvas.remove();

          //Always show newStateCanvas and change height of innerCanvas
          newStateCanvas.css('visibility', 'visible');
          innerCanvas.css('height', newStateCanvas.outerHeight());
          
          currentStateCanvas = newStateCanvas;
          currentObject = object;
          
        });

      },

      //Dwars title bar which holds Aggregation name
      drawTitleBar: function (canvas, object) {
        var that = this;

        var divTitlebar = $('<div class="titlebar"></div>');
        canvas.append(divTitlebar);

        this.drawBreadCrumbs(canvas, divTitlebar);

        var h2Title = $('<h2><span class="text">' + object.aggregate.getTitle() + '</span></h2>');
        var popup;

        //Navigate to aggregation on click
        h2Title.click(function (event) {
          sandbox.notify("object-click", object.aggregate.getId());
        })
				.mouseover(function () {
				  $(this).addClass('hover');
				  if (!popup) {
				    popup = that.openPopup(h2Title, 'Show aggregation overview', { positionClass: 'bottom', maxWidth: 200 });
				  }
				  if (!popup.isOpen)
				    popup.open();
				})
        .mouseout(function () {
          $(this).removeClass('hover');
          if (popup && popup.isOpen)
            popup.close();
        });

        divTitlebar.append(h2Title);
      },

      //Draw breadcrums using historymanager
      drawBreadCrumbs: function (canvas, titlebar) {
        var divBreadcrumbs = $('<div class="breadcrumbs"></div>');
        titlebar.append(divBreadcrumbs);

        var that = this;
        var historyArray = historyManager.getHistory(5);
        if (historyArray.length > 0) {
          var ul = $('<ul />').appendTo(divBreadcrumbs);
          $.each(historyArray, function (i, historyObject) {
            if (historyObject) {
              var aBreadcrumb;
              if (i == historyArray.length - 1) {
                aBreadcrumb = $('<span>' + historyObject.getId() + '</span>')
							  .addClass("breadcrumb")
							  .addClass(dataService.findClosestBaseClass(historyObject.getProperty(TypePropertyIdentifier).valueDescriptor));
              }
              else {
                var popup;

                aBreadcrumb = $('<a href="#">' + historyObject.getId() + '</a>')
							  .attr("rel", historyObject.getId())
							  .addClass("breadcrumb")
							  .addClass(dataService.findClosestBaseClass(historyObject.getProperty(TypePropertyIdentifier).valueDescriptor))
							  .click(function (event) {
							    event.preventDefault();
							    sandbox.notify("history-click", historyArray.length - 1 - i);
							  })
                .mouseover(function () {
                  if (!popup) {
                    popup = that.openPopup(aBreadcrumb, that.contentBreadCrumbPopup(historyObject), { positionClass: 'bottom', maxWidth: 200 });
                  }
                  if (!popup.isOpen)
                    popup.open();
                })
                .mouseout(function () {
                  if (popup && popup.isOpen)
                    popup.close();
                })
                .click(function () {
                  if (popup && popup.isOpen)
                    popup.close();
                });
              }

              var li = $('<li />').append(aBreadcrumb);

              li.appendTo(ul);
            }
          });
        }
      },

      contentBreadCrumbPopup: function (object) {
        var div = $('<div class="breadcrumb_popup">' +
          '<div class="type">' + object.getPropertyValue(TypePropertyIdentifier) + '</div>' +
          '<div class="title">' + object.getTitle() + '</div>' +
        '</div>');

        return div;
      },

      drawClouds: function (canvas, object) {
        // Get all clouds ordered by descending weight (combination of number and total textlength)
        var clouds = cloudService.gatherClouds(object.combinedRelations);

        // Exception rule for 1 relation type
        if (clouds.length == 0) {
          // draw row 1 with only the centerobject in it
          var container = $('<div class="cloud_row"/>');
          canvas.append(container);
          this.drawEmptyCloud(container, 3);
          this.drawCenterObject(container, object);
          this.drawEmptyCloud(container, 4);
        }
        else if (clouds.length == 1) {
          // first draw row 1 with only the centerobject in it
          var container = $('<div class="cloud_row"/>');
          canvas.append(container);
          this.drawEmptyCloud(container, 3);
          this.drawCenterObject(container, object);
          this.drawEmptyCloud(container, 4);

          // then draw row 2 with the only cloud in it
          var container = $('<div class="cloud_row"/>');
          canvas.append(container);
          this.drawEmptyCloud(container, 8);
          this.drawRelationCloud(container, 1, clouds[0], 3);
          this.drawEmptyCloud(container, 7);
        }
        // Exception rule for 2 relation types
        else if (clouds.length == 2) {
          // draw only one row with the centerobject and both clouds in it
          var container = $('<div class="cloud_row"/>');
          canvas.append(container);

          this.drawRelationCloud(container, 3, clouds[0]);
          this.drawCenterObject(container, object);
          this.drawRelationCloud(container, 4, clouds[1]);
        }
        // Exception rule for 2 relation types
        else if (clouds.length == 3) {
          // draw row 1 with the centerobject and cloud 2 and 3 in it
          var row1container = $('<div class="cloud_row"/>');
          canvas.append(row1container);

          var pos3div = this.drawRelationCloud(row1container, 3, clouds[1]);
          var center = this.drawCenterObject(row1container, object);
          var pos4div = this.drawRelationCloud(row1container, 4, clouds[2]);

          // create a temporary container
          var row2Container = $('<div class="cloud_row"/>');
          canvas.append(row2Container);

          this.drawEmptyCloud(row2Container, 5);
          // Draw as two columns for test purposes
          var tempDiv = this.drawRelationCloud(row2Container, 1, clouds[0], 2);

          // If the two column version of the first cloud would look nice floated against the left
          if (pos3div.outerHeight() - Math.max(center.outerHeight(), pos4div.outerHeight()) > (tempDiv.outerHeight() / 2)) {
            row1container.append(tempDiv);
            row2Container.remove();
          }
        }
        // General rule for more than 3 relation types
        // 8   2   7
        // 3   -1  4
        // 5   1   6
        else {
          var row1container = $('<div class="cloud_row"/>');
          canvas.append(row1container);

          var row2container = $('<div class="cloud_row"/>');
          canvas.append(row2container);

          var row3container = $('<div class="cloud_row"/>');
          canvas.append(row3container);

          var position1allowedColumns = 1;
          if (clouds.length < 6)
            position1allowedColumns = 2;
          if (clouds.length < 5)
            position1allowedColumns = 3;

          var position2allowedColumns = 1;
          if (clouds.length < 8)
            position2allowedColumns = 2;
          if (clouds.length < 7)
            position2allowedColumns = 3;

          // Draw topleft corner if there are 8 or more clouds
          if (clouds.length >= 8) {
            this.drawRelationCloud(row1container, 8, clouds[7]);
          }
          else {
            // Draw empty cloud if cloud 2 doesn't have enough objects for 3 columns
            if (clouds[1].objects.length < 3) {
              this.drawEmptyCloud(row1container, 8);
            }
          }

          // Draw top
          this.drawRelationCloud(row1container, 2, clouds[1], position2allowedColumns);

          // Draw topright corner if there are 7 or more clouds
          if (clouds.length >= 7) {
            this.drawRelationCloud(row1container, 7, clouds[6]);
          }
          else {
            // Draw empty cloud if cloud 2 doesn't have enough objects for 2 columns
            if (clouds[1].objects.length < 2) {
              this.drawEmptyCloud(row1container, 7);
            }
          }

          // Draw left
          var pos3div = this.drawRelationCloud(row2container, 3, clouds[2]);

          // Draw center
          var centerdiv = this.drawCenterObject(row2container, object);

          // Draw right
          var pos4div = this.drawRelationCloud(row2container, 4, clouds[3]);

          // Draw bottomleft corner if there are 5 or more clouds
          if (clouds.length >= 5) {
            this.drawRelationCloud(row3container, 5, clouds[4]);
          }
          else {
            // Draw empty cloud if cloud 1 doesn't have enough objects for 3 columns
            if (clouds[0].objects.length < 3) {
              this.drawEmptyCloud(row3container, 5);
            }
          }

          var appendOneLeftoverToColumn3 = false;

          // create a temporary container
          var temporaryContainer = $('<div class="cloud_row"/>');
          canvas.append(temporaryContainer);

          // Draw as two columns for test purposes
          var tempDiv = this.drawRelationCloud(temporaryContainer, 1, clouds[0], 2);

          // If the two column version of the first cloud would look nice floated against the left append it to row 2
          if (pos3div.outerHeight() - Math.max(centerdiv.outerHeight(), pos4div.outerHeight()) > (tempDiv.outerHeight() / 2)) {
            row2container.append(tempDiv);

            // There should be a position left over for a leftover cloud on row 3
            appendOneLeftoverToColumn3 = true;
          }
          // else create a new cloud and append it to row 3
          else {
            this.drawRelationCloud(row3container, 1, clouds[0], position1allowedColumns);
          }

          // remove the temporary container
          temporaryContainer.remove();

          // Draw bottomright corner if there are 6 or more clouds
          if (clouds.length >= 6) {
            this.drawRelationCloud(row3container, 6, clouds[5]);
          }
          else {
            // Draw empty cloud if cloud 1 doesn't have enough objects for 2 columns
            if (clouds[0].objects.length < 2) {
              this.drawEmptyCloud(row3container, 5);
            }
          }

          // All leftover rows should be appended to new rows (except maybe the first)
          if (clouds.length > 8) {
            var start = 8;

            if (appendOneLeftoverToColumn3) {
              this.drawRelationCloud(row3container, 9, clouds[8]);
              var start = 9;
            }

            if (clouds.length > start) {
              var counter = 0;
              var rowContainer;

              for (var i = start; i < clouds.length; i++) {
                if (i % 3 == 0) {
                  rowContainer = $('<div class="cloud_row"/>');
                  canvas.append(rowContainer);
                }

                this.drawRelationCloud(rowContainer, i + 1, clouds[i]);
                counter++;
              }
            }
          }
        }
      },

      //Draws the main center object
      drawCenterObject: function (container, object) {
        var divCenterObject = $('<div class="centerobject"/>');
        divCenterObject.css("width", Math.floor(innerWidth / 3) + "px");

        var divPadding = $('<div class="padding"/>');
        divCenterObject.append(divPadding);

        container.append(divCenterObject);

        var divTypeIcon = $('<div class="type_icon" />');
        var spanCenter = $('<span class="' + dataService.findClosestBaseClass(object.getProperty(TypePropertyIdentifier).valueDescriptor) + '"></span>');

        divTypeIcon.append(spanCenter);
        divPadding.append(divTypeIcon);

        var divType = $('<div class="type">' + object.getPropertyValue(TypePropertyIdentifier) + '</div>');
        divPadding.append(divType);

        var divTitle = $('<div class="title">' + object.getTitle() + '</div>');
        divPadding.append(divTitle);

        //Don't show properties when false is specified in config for showProperties setting
        if (sandbox.getConfig("showProperties")) {
          var divProperties = $('<div class="properties" />');

          var that = this;

          //Show all properties, except properties in the dontShowProperties array
          $.each(object.properties, function (i, o) {
            if ($.inArray(o.descriptor, dontShowProperties) == -1) {

              //Draw link when property type is uri and value strarts with http://
              if (o.type == 'uri') {
                divProperties.append(that.drawLinkProperty(o.label, o.value));
              }
              else {
                //Default: draw property as plain text label label
                var propertyDiv = $('<div class="property"/>');
                var labelDiv = $('<div class="label">' + o.label + '</div>');
                var valueDiv = $('<div class="value">' + o.value + '</div>');

                propertyDiv.append(labelDiv);
                propertyDiv.append(valueDiv);

                divProperties.append(propertyDiv);
              }
            }
          });

          divPadding.append(divProperties);

          //Always draw image last
          if (object.properties[ImagePropertyIdentifier]) {
            var imageDiv = $('<div class="image"/>');
            var image = $('<img src="' + object.properties[ImagePropertyIdentifier].value + '" class="centerobjectimage" />');

            imageDiv.append(image);
            divProperties.append(imageDiv);
          }

        }

        var divObjectLink = this.drawObjectLinkProperty(object.id, object.getId());
        if (divObjectLink) {
          divPadding.append(divObjectLink);
        }

        return divCenterObject;
      },

      //Draws a link property based on the configured LinkTarget
      drawLinkProperty: function (name, value) {

        var propertyDiv = $('<div class="property"/>');
        var labelDiv = $('<div class="label">' + name + '</div>');
        var valueDiv = $('<div class="value"></div>');

        propertyDiv.append(labelDiv);
        propertyDiv.append(valueDiv);

        //Only create a link if the LinkTarget is specified
        if (LinkTarget && LinkTarget.length > 0) {

          var viewUrl = value;

          if (value.indexOf('http://') == 0) {

            //Strip URL to only show domain name
            viewUrl = this.getSmallUrl(value);
          }
          else if (value.indexOf('mailto:') == 0) {
            //Strip URL to only show domain name
            viewUrl = value.replace('mailto:', '');
          }
          else if (value.indexOf('tel:') == 0) {
            viewUrl = value.replace('tel:', '');
          }
          else if (value.toLowerCase().indexOf('urn:nbn:nl:ui:') == 0) {            
            viewUrl = value;
            value = 'http://persistent-identifier.nl/?identifier='+value;
            labelDiv.html("Persistent Identifier");
          }

          var anchor = $('<a href="' + value + '">' + viewUrl + '</a>');
          valueDiv.append(anchor);

          var iconSpan = $('<span class="externalLink"></span>');
          if (LinkTarget == "_blank") {
            anchor.append(iconSpan);
          }

          //Set target
          anchor.attr('target', LinkTarget);
          anchor.click(function (event) {

            //Do not open the actual link if the target is _none
            if (LinkTarget == '_none') {
              event.preventDefault();
            }

            //Notify (external) application using uri-click event
            sandbox.notify("uri-click", value);
          });
        }
        else {
          //no LinkTarget specified, set value as plain text
          valueDiv.text(value);
        }

        return propertyDiv;
      },

      //Draws the OBJECT link property based on the configured ObjectLinkTarget
      drawObjectLinkProperty: function (id, externalId) {

        //Only create a link if the LinkTarget is specified
        if (ObjectLinkTarget && ObjectLinkTarget.length > 0) {
          var propertyDiv = $('<div />');

          var anchor = $('<a class="objectLink" href="' + id + '">More info</a>');
          propertyDiv.append(anchor);

          var iconSpan = $('<span class="externalLink"></span>');
          if (ObjectLinkTarget == "_blank") {
            anchor.append(iconSpan);
          }

          //Set target
          anchor.attr('target', ObjectLinkTarget);

          anchor.click(function (event) {

            //Do not open the actual link if the target is _none
            if (ObjectLinkTarget == '_none') {
              event.preventDefault();
            }

            //Notify (external) application using uri-click event
            sandbox.notify("object-uri-click", { "id": id, "externalId": externalId });
          });

          return propertyDiv;

        }

      },

      //Strip URL to only show domain name
      getSmallUrl: function (url) {
        var startDomain = url.indexOf('//');

        if (startDomain > 0) {
          var endDomain = url.indexOf('/', startDomain + 2)

          //If no end slash is found, use full URL
          if (endDomain == -1)
            endDomain = url.length;

          return url.substring(0, endDomain);
        }

        return url;

      },

      //Draws an empty cloud to take space but don't show anything
      drawEmptyCloud: function (container, position) {
        var cloudDiv = $('<div class="cloud position' + position + '"/>');
        cloudDiv.css("width", Math.floor(innerWidth / 3) + "px");

        container.append(cloudDiv);

        return cloudDiv;
      },

      //Draws a relation cloud showing the related objects
      drawRelationCloud: function (container, position, relationObject, allowedColumns) {
        if (!allowedColumns)
          allowedColumns = 1;

        var columns = 1;

        if (position == 1 || position == 2) {
          if (relationObject.objects.length > 1)
            columns = Math.min(allowedColumns, 2);
          if (relationObject.objects.length % 3 == 0 || relationObject.objects.length > 4)
            columns = Math.min(allowedColumns, 3);
        }

        var cloudDiv = $('<div class="cloud position' + position + ' columns' + columns + '"></div>');
        cloudDiv.css("width", Math.floor((columns / 3) * innerWidth) + "px");

        var cloudFieldset = $('<fieldset class="cloud"></fieldset>');
        cloudDiv.append(cloudFieldset);
        var cloudFieldsetLegend = $('<legend>' + relationObject.label + '</legend>');
        cloudFieldset.append(cloudFieldsetLegend);

        var that = this;
        var counter = 0;
        var cloudObjects;

        // Sort the objects based on title
        relationObject.objects.sort(function (a, b) {
          var aTitle = a.object.getTitle();
          var bTitle = b.object.getTitle();

          if (aTitle < bTitle) return -1;
          if (aTitle > bTitle) return 1;
          return 0;
        });

        //Draw each object for this relation
        $.each(relationObject.objects, function (i, o) {
          if (counter % Math.ceil(relationObject.objects.length / columns) == 0) {
            cloudObjects = $('<ul class="objects"></ul>');
            cloudFieldset.append(cloudObjects);
          }

          //Draw object
          var liObject = that.drawObject(cloudObjects, o.object);

          //Draw annotations
          that.drawAnnotations(liObject, o.annotations);

          counter++;
        });

        container.append(cloudDiv);

        return cloudDiv;
      },

      //Draws a related object inside a relation cloud
      drawObject: function (container, object) {
        var previousObject = historyManager.getPreviousObject();

        var liObject = $('<li class="object' +
              (previousObject && previousObject.getId() == object.getId() ? ' previous' : '') +
              '">' +
              '<div class="padding">' +
						    '<div class="type_icon">' +
                  '<span class="' + dataService.findClosestBaseClass(object.getProperty(TypePropertyIdentifier).valueDescriptor) + '"></span>' +
                '</div>' +
                '<div class="type">' +
                  object.getPropertyValue(TypePropertyIdentifier) +
                '</div>' +
                '<div class="title">' +
                  '<a class="objectlink" href="#" rel="' +
                  object.getId() +
                  '">' +
                  object.getTitle() +
                  '</a>' +
                '</div>' +
                '<div class="annotations"/>' +
                '<div class="gradient" />' +
              '</div>' +
            '</li>');

        container.append(liObject);

        //Handle object click
        liObject.click(function (event) {
          event.preventDefault();

          // Do not navigate after a click on the annotations div
          if (!$(event.target).closest(".annotations").length) {
            var id = $(this).find(".objectlink").attr("rel");

            sandbox.notify("object-click", id);
          }
        });

        return liObject;
      },

      //Create (html)content for annotation popup
      contentAnnotationsPopup: function (annotations) {

        var html = '<div class="annotations_title">Relation annotations (' + annotations.length + ')</div>';

        html += '<ul class="annotations_list">';
        $.each(annotations, function (i, o) {
          html += '<li'
          if (i == annotations.length - 1) {
            html += ' class="last"';
          }
          html += '>'
          if (o.properties[DescriptionAnnotationPropertyIdentifier]) {
            html += o.properties[DescriptionAnnotationPropertyIdentifier].value + "";
          }
          html += '</li>';
        });
        html += '</ul>';

        return html;
      },

      //Draws annotation link inside object representation
      //Able to hover and click on this link
      drawAnnotations: function (container, annotations) {
        if (annotations.length > 0) {
          var divAnnotations = container.find('.annotations');
          var aAnnotations = $('<a class="annotation_indication" href="#">Relation annotations (' + annotations.length + ')</a>');

          var that = this;

          var clickPopup;
          var hoverPopup;

          //Show popup on click
          aAnnotations.click(function (event) {
            event.preventDefault();

            that.closePopups();

            if (!clickPopup)
              clickPopup = that.openPopup(aAnnotations, that.contentAnnotationsPopup(annotations), { closeButton: true, maxWidth: (Math.floor(innerWidth / 3) * 2) });

            if (!clickPopup.isOpen)
              clickPopup.open();
          });

          //Show hover menu on mouseover
          aAnnotations.mouseover(function () {
            if (!clickPopup || !clickPopup.isOpen) {
              if (!hoverPopup) {
                hoverPopup = that.openPopup(aAnnotations, '<span class="indicator-text">' + aAnnotations.text() + '</span>', { positionClass: 'top' });
              }

              if (!hoverPopup.isOpen)
                hoverPopup.open();
            }
          });

          //Hide hovermenu on mouseout
          aAnnotations.mouseout(function () {
            if (hoverPopup && hoverPopup.isOpen)
              hoverPopup.close();
          });

          divAnnotations.append(aAnnotations);

          return divAnnotations;
        }
      },


      openPopup: function (openingElement, content, options) {
        var popup = new Visualizer.HtmlPopup(innerCanvas, openingElement, options);
        popups.push(popup);

        popup.setContent(content);
        popup.open();

        return popup;
      },

      closePopups: function () {
        $.each(popups, function (i, popup) {
          popup.close();
        });
      },

      // Fix IE6
      fixIE: function (object) {
        if ($.browser.version == 6) {
          $('li.object').mouseover(function () {
            $(this).addClass("hover");
          });

          $('li.object').mouseout(function () {
            $(this).removeClass("hover");
          });
        }

        // Fix everything but IE8 and higher
        if ($.browser.version < 8) {
          $('div.gradient').each(function () {
            $(this).css({ "margin": "0px", "position": "absolute", "left": "0px", "bottom": "0px" });
            $(this).width($(this).parent().innerWidth());

            var borderWidth = $(this).outerWidth() - $(this).innerWidth();
            if (borderWidth > 0) {
              $(this).width($(this).width() - borderWidth);
            }
          });
        }
      }
    };
  }
})(jQuery);