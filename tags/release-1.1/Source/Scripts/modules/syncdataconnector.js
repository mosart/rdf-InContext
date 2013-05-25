/*
 * File: module/syncdataconnector.js
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

  // SyncDataConnector
  // Responsible for JSON requests for object data
  // Synchronous (whole dataset at once)
  Visualizer.SyncDataConnector = function (moduleID, sandbox) {
    // internal caching
    var jsonData;

    return {
      getData: function (id, callback) {
        //Is the data already in memory?
        if (jsonData) {
          callback(jsonData);
        }
        else {
          if (sandbox.getConfig("dataFormat") == 'application/json') {
            var url = sandbox.getConfig("dataUrl");

            //Get RDF/JSON data using web service
            $.getJSON(url, function (data) {
              jsonData = data;
              callback(jsonData);
            });
          }
          else if (sandbox.getConfig("dataFormat") == 'application/rdf+xml') {
            var url = sandbox.getConfig("dataUrl");
            
            var rdfXmlParser = new Visualizer.RdfXmlParser();
            
            //Get RDF/XML data using web service
            rdfXmlParser.parse(url, function (data) {
              jsonData = data;
              callback(jsonData);
            });
          }
          else {
            alert('Unsupported data format: ' + sandbox.getConfig("dataFormat"));
          }
        }
      }
    };
  };
})(jQuery);