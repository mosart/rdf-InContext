/*!
 * File: domain/node.js
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
  Visualizer.Node = function (id, externalId) {
    this.id = id;
    this.externalId = externalId;

    this.properties = {};
    this.relations = {};
    this.inverseRelations = {};
    
    this.title = null;
  };

  Visualizer.Node.prototype = {
    id: null,
    externalId: null,
    properties: null,
    relations: null,
    inverseRelations: null,
    aggregate: null,
    isLoaded: false,

    getProperty: function (identifier) {
      return this.properties[identifier];
    },

    getPropertyLabel: function (identifier) {
      if (this.properties[identifier])
        return this.properties[identifier].label;

      return null;
    },

    getPropertyValue: function (identifier) {
      if (this.properties[identifier])
        return this.properties[identifier].value;

      return null;
    },

    getTitle: function() {
      return this.title;
    },
    
    //Returns External ID if available, else normal id
    getId: function () {
      if (this.externalId)
        return this.externalId;
      else
        return this.id;
    }
  };
})(jQuery);