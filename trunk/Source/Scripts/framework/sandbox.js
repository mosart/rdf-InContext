/*
 * File: framework/sandbox.js
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
  Visualizer.Sandbox = function (moduleID, core) {
    return {
      //Get configuration setting from core
      getConfig: function (name) {
        return core.getConfig(name);
      },

      //Get reference to server registered at the core
      getService: function (moduleID) {
        return core.getService(moduleID);
      },

      //Log to the core
      log: function (message, data) {
        core.log(moduleID, message, data);
      },

      //Send notify event to subscribers
      notify: function (eventType, data) {
        core.notify(moduleID, eventType, data);
      },

      //Subscribe to event
      subscribe: function (eventType, callback, obj) {
        core.subscribe(moduleID, eventType, callback, obj);
      },

      //Unsubscribe from event
      unsubscribe: function (eventType) {
        core.unsubscribe(moduleID, eventType);
      },

      //Wait for multiple events
      waitFor: function (eventTypes, callback, obj) {
        core.waitFor(eventTypes, callback, obj);
      }
    }
  };
})(jQuery);