/*!
 * File: visualizer.js
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

/// <reference path="../framework/core.js"/>

(function ($) {
  // define Visualizer namespace in the global scope
  window.Visualizer = function () { }

  // Put the visualizer app into the global scope, so it can be initialized from outside
  window.VisualizerApp = function (canvasId, startObjectId, options, modules) {
    // Make sure the whole app can find the htmlId
    options["canvasId"] = canvasId;
    options["startObjectId"] = startObjectId;

    var core = new Visualizer.Core(options);
    var servicesReady = false;

    var useHistoryManager = core.getConfig("useHistoryManager");

    var defaultModules = {
      "historymanager": Visualizer.HistoryManager,
      "dataconnector": Visualizer.SyncDataConnector,
      "schemaconnector": Visualizer.SchemaConnector,
      "schemaservice": Visualizer.SchemaService,
      "dataservice": Visualizer.DataService,
      "navigationservice": Visualizer.NagivationService,
      "cloudservice": Visualizer.CloudService,
      "animationservice": Visualizer.AnimationService,
      "drawservice": Visualizer.HtmlDrawService
    }

    var modules = $.extend(defaultModules, modules);

    for (moduleID in modules) {
      core.register(moduleID, modules[moduleID]);
    }

    // Wait for application critical events to be fired
    var waitForEvents = ["document.ready", "core.all-modules-started", "schemaservice.ready"];
    //Also wait for the history manager (if used)
    if (useHistoryManager) {
      waitForEvents.push("historymanager.ready");
    }

    core.waitFor(waitForEvents, function (event) {
      var currentUrlId;

      //Url is already init with an id, take that ID if available
      //Else, take normal startObjectId
      if (event && event.data && event.data['historymanager.ready']) {
        currentUrlId = event.data['historymanager.ready'];
      }

      core.notify("VisualizerApp", "load-object", currentUrlId);
    }, this);

    // Make sure the DOM is loaded
    $(document).ready(function () { core.notify("document", "ready"); });

    // Start all modules
    core.startAll();

    return {

      subscribe: function (eventType, callback, sender) {
        core.subscribe("external", eventType, callback, sender);
      },

      unsubscribe: function (eventType, sender) {
        core.subscribe("external", eventType, sender);
      },

      //Do we want to be able to let externals call events?
      notify: function (eventType, data) {
        core.notify("external", eventType, data);
      },

      waitFor: function (eventTypes, callback, sender) {
        core.waitFor("external", eventTypes, sender);
      },

      stop: function () {
        core.stopAll();
      },

      loadObject: function (objectId) {
        core.notify("external", "object-click", objectId);
      },

      onObjectLoaded: function (callback, sender) {
        core.subscribe("external", "*.load-object-ready", function (objectId) {
          callback.call(sender, objectId);
        });
      }
    };
  };
})(jQuery);