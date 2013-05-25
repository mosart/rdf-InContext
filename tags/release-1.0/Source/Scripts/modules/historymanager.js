/*
 * File: module/historymanager.js
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

//SchemaService

(function ($) {
  Visualizer.HistoryManager = function (moduleID, sandbox) {

    var UseHistoryManager = sandbox.getConfig("useHistoryManager");
    var firstTime = true;

    var history = [];

    var currentId;

    return {
      init: function () {

        //Only register event if we use history manager
        if (UseHistoryManager) {

          //Gets notification if URL changes
          $.address.change(function (event) {

            var currentId = event.parameters.id;

            //Do ready event for the first time, with the urlId
            if (firstTime) {
              firstTime = false;
              sandbox.notify("ready", currentId);
            }
            else {
              sandbox.log('Load by URL', currentId);
              sandbox.notify("load-object", currentId);
            }
          });
        }

        // listen to clicks on breadcrumb
        sandbox.subscribe("*.history-click", function (event) {
          var steps = event.data;

          // remove all historical steps after the clicked one
          history = history.slice(0, history.length - 1 - steps);

          // move history back
          window.history.go(-steps);

          // Notify an object clicked event
        }, this);
      },

      // Return an array with history data (optionally with a fixed number)
      getHistory: function (maxNumber) {
        if (maxNumber)
          return history.slice(Math.max(0, history.length - maxNumber));

        return history;
      },

      // Set a current object
      setCurrentObject: function (object) {
        // If the new current object is the previous object, remove the old current object
        if (history[history.length - 2] && object.getId() == history[history.length - 2].getId())
          history.pop();
        // Else put it at the end of the history array
        else
          history.push(object);
      },

      //Gets previous object
      getPreviousObject: function () {
        if (history[history.length - 2]) {
          return history[history.length - 2];
        }
      }
    };
  };
})(jQuery);