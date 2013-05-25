/*
 * File: framework/core.js
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

//http://www.wisecodes.com/2009/10/javascript-scalable-applications/
//http://www.slideshare.net/nzakas/scalable-javascript-application-architecture

(function ($) {
  Visualizer.Core = function (options) {
    // Private Variable
    var modules = {};
    
    var listeners = [];

    var waiters = [];

    //Default configuration values
    var defaults = {
      "maxWidth": 700,
      "debug": false,
      "dataUrl": '',
      "dataFormat": 'application/rdf+xml',
      "schemaUrl": '',
      "schemaFormat": 'application/rdf+xml',
      "idProperty": '',
      "titleProperties": [],
      "dontShowProperties": null,
      "inverseTypeId": "http:\/\/www.w3.org\/2002\/07\/owl#inverseOf",
      "symmetricTypeId": "http:\/\/www.w3.org\/2002\/07\/owl#SymmetricProperty",
      "imageTypeId": "",
      "annotationTypeId": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement",
      "objectAnnotationTypeId": "http://www.w3.org/1999/02/22-rdf-syntax-ns#object",
      "subjectAnnotationTypeId": "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
      "descriptionAnnotationTypeId": "http://purl.org/dc/terms/description",
      "useHistoryManager": true,
      "showProperties": true,
      "linkTarget": "_blank",
      "objectLinkTarget": "_blank",
      "concatCharacters" : " | ",
      "baseClassTypes": {
        // Default OWL base class
        "http:\/\/www.w3.org\/2002\/07\/owl#Thing": "thing",
        // Default supported ORE types
        "http:\/\/www.openarchives.org\/ore\/terms\/Aggregation": "aggregation",
        // Default supported Foaf types
        "http:\/\/xmlns.com\/foaf\/0.1\/Document": "document",
        "http:\/\/xmlns.com\/foaf\/0.1\/Image": "image",
        "http:\/\/xmlns.com\/foaf\/0.1\/Group": "group",
        "http:\/\/xmlns.com\/foaf\/0.1\/Organization": "organization",
        "http:\/\/xmlns.com\/foaf\/0.1\/Person": "person",
        "http:\/\/xmlns.com\/foaf\/0.1\/Project": "project",
        // Default supported w3 SKOS types
        "http:\/\/www.w3.org\/2004\/02\/skos\/core#Concept": "concept"
      }
    }

    //Merge default and supplied config values
    var options = $.extend(true, defaults, options);

    // Instance Creams
    function createInstance(core, moduleID) {
      return modules[moduleID].creator(moduleID, new Visualizer.Sandbox(moduleID, core));
    };

    function getEventRegex(eventType) {
      return new RegExp("^" + eventType.replace("*", "[^\.]*") + "$");
    };

    //  Public methods
    return {
      log: function (moduleID, message, data) {
        if (options["debug"] && window["console"] != null) {
          console.log(moduleID + ": " + message + " with data: ", data);
        }
      },
      getConfig: function (name) {
        return options[name];
      },
      setConfig: function (name, value) {
        options[name] = value;
      },
      getService: function (moduleID) {
        return modules[moduleID].instance;
      },
      register: function (moduleID, creator) {
        modules[moduleID] = {
          creator: creator,
          instance: null
        };
      },
      start: function (moduleID) {
        modules[moduleID].instance = createInstance(this, moduleID);
        if (modules[moduleID].instance.init)
          modules[moduleID].instance.init();

        this.notify("core", "module-started", moduleID);
      },
      stop: function (moduleID) {
        var data = modules[moduleID];
        if (data.instance) {
          if (data.instance.destroy)
            data.instance.destroy();
          data.instance = null;
        }

        this.notify("core", "module-stopped", moduleID);
      },
      startAll: function () {
        for (var moduleID in modules) {
          if (modules.hasOwnProperty(moduleID)) {
            this.start(moduleID);
          }
        }

        this.notify("core", "all-modules-started");
      },
      stopAll: function () {
        for (var moduleID in modules) {
          if (modules.hasOwnProperty(moduleID)) {
            this.stop(moduleID);
          }
        }

        this.notify("core", "all-modules-stopped");
      },
      //Accepts notify events from the sandbox and notify's subscribed modules
      notify: function (moduleID, eventType, data) {
        this.log(moduleID, "Event fired: " + moduleID + "." + eventType, data);

        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          if ((moduleID + "." + eventType).match(listener.regex)) {
            listener.callback.call(listener.obj, { type: eventType, data: data });
          }
        }

        for (var i = 0; i < waiters.length; i++) {
          var waiter = waiters[i];
          for (var regexKey = 0; regexKey < waiter.regexArray.length; regexKey++) {
            if ((moduleID + "." + eventType).match(waiter.regexArray[regexKey])) {
              waiter.regexArray.splice(regexKey, 1);
              waiter.data[moduleID + "." + eventType] = data;
            }
            if (waiter.regexArray.length == 0) {
              waiters.splice(i, 1);
              waiter.callback.call(waiter.obj, { data: waiter.data });
            }
          }
        }
      },
      //Wait for first occurrence of a combined set of events
      waitFor: function (eventTypes, callback, obj) {
        var regexArray = [];

        for (var key = 0; key < eventTypes.length; key++) {
          regexArray.push(getEventRegex(eventTypes[key]));
        }

        waiters.push({ regexArray: regexArray, callback: callback, obj: obj, data: [] });
      },
      //Start listening to events
      subscribe: function (moduleID, eventType, callback, obj) {
        var regex = getEventRegex(eventType);

        //Add to listeners array
        listeners.push({ eventType: eventType, regex: regex, callback: callback, obj: obj, moduleID: moduleID });
      },
      //Stop listening to a specific event
      unsubscribe: function (moduleID, eventType, sender) {
        //Unsubscribe
        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          if (listener.eventType == eventType && listener.moduleID == moduleID) {
            listeners.splice(i, 1);
          }
        }
      }
    };
  }
})(jQuery);