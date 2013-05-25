/*
 * File: module/navigationservice.js
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
  Visualizer.NagivationService = function (moduleID, sandbox) {

    var historymanager;

    return {
      init: function () {
        historymanager = sandbox.getService("historymanager");

        //Listen to object clicks
        sandbox.subscribe("*.object-click", function (event) {
          var objectId = event.data;

          var previousObject = historymanager.getPreviousObject();

          // If the clicked object is the previous one, let the historymanager handle the moving back
          if (sandbox.getConfig("useHistoryManager") && previousObject && previousObject.getId() == objectId) {
            sandbox.notify("history-click", 1);
          }
          // else notify that the object should be loaded
          else {
            //Set address if history manager is used
            if (sandbox.getConfig("useHistoryManager")) {
              $.address.value('?id=' + encodeURIComponent(objectId));
            }
            else {
              //Else, load objects
              sandbox.notify("load-object", objectId);
            }
          }
        }, this);

        //Listen to load object
        sandbox.subscribe("*.load-object", function (event) {
          //Only proceed if all services are ready
          var dataService = sandbox.getService("dataservice");
          var drawService = sandbox.getService("drawservice");
          var historyManager = sandbox.getService("historymanager");

          // assign id from event.data
          var id = event.data;

          // If there is no object id passed to the event, take the default id
          if (!event.data)
            id = sandbox.getConfig("startObjectId");

          //historyManager.setCurrentObjectId(id);

          //Load data and draw
          dataService.getCenterObject(id, function (centerObj) {
            historyManager.setCurrentObject(centerObj);

            drawService.beginDraw(centerObj);
            sandbox.notify("load-object-ready", centerObj.getId());
          });
        }, this);
      }
    }
  };
})(jQuery);