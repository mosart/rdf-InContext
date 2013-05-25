/*
 * File: module/schemaconnector.js
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
  //SchemaConnector
  //Responsible for JSON requests

  Visualizer.SchemaConnector = function (moduleID, sandbox) {
    var jsonSchema;

    return {
      init: function () {
        try {


        } catch (ex) {
          alert("sandbox not found");
        }
      },

      destroy: function () {
        //Destructor  

      },
      getSchema: function (callback) {
        //Is the data already in memory?
        if (jsonSchema) {
          callback(jsonSchema);
        }
        else {
          //Get RDF/JSON data using web service
          var url = sandbox.getConfig("schemaUrl");

          if (sandbox.getConfig("schemaFormat") == 'application/json') {
            var url = sandbox.getConfig("schemaUrl");

            //Get RDF/JSON data using web service
            $.getJSON(url, function (data) {
              jsonSchema = data;
              callback(jsonSchema);
            });
          }
          else if (sandbox.getConfig("schemaFormat") == 'application/rdf+xml') {
            var url = sandbox.getConfig("schemaUrl");
            
            var rdfXmlParser = new Visualizer.RdfXmlParser();
            
            //Get RDF/XML data using web service
            rdfXmlParser.parse(url, function (data) {
              jsonSchema = data;
              callback(jsonSchema);
            });
          }
          else {
            alert('Unsupported schema format: ' + sandbox.getConfig("schemaFormat"));
          }
        }
      }
    };
  };
})(jQuery);