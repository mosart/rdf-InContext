/*!
 * File: utils/rdfxmlparser.js
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
  Visualizer.RdfXmlParser = function () {

    return {
      parse: function (dataUrl, callback) {
        var kb = new $rdf.IndexedFormula();

        $.ajax({
          url: dataUrl,
          dataType: ($.browser.msie) ? "text" : "xml",
          async: false,
          success: function(data) {
            var xml;
            if ($.browser.msie) {
              xml = new ActiveXObject("Microsoft.XMLDOM");
              xml.async = false;
              xml.loadXML(data);
            }
            else {
              xml = data;
            }

            var rdfxmlparser = new $rdf.RDFParser(kb);
            rdfxmlparser.reify = true;
            rdfxmlparser.parse(xml, '', '');
            
            var statements = kb.statements;
            
            var jsonData = {};
            for(var statementIdx = 0, statementCount = statements.length ; statementIdx < statementCount ; statementIdx++) {
              var statement = statements[statementIdx];
              var subject = statement.subject.value;
              var predicate = statement.predicate.value;
              
              if(jsonData[subject] == undefined) {
                jsonData[subject] = {};
              }
              var jsonDataPredicates = jsonData[subject];

              if(jsonData[subject][predicate] == undefined) {
                jsonData[subject][predicate] = [];
              }
              var jsonDataObjects = jsonData[subject][predicate];
              
              var jsonDataObject = {
                  value: statement.object.value
                };

              switch(statement.object.termType)
              {
                case 'literal':
                  jsonDataObject.type = 'literal';
                  break;
                case 'bnode':
                  jsonDataObject.type = 'bnode';
                  break;
                default:
                  jsonDataObject.type = 'uri';
              }

              if(jsonDataObject.lang) {
                jsonDataObject.lang = statement.object.lang;
              }
              
              jsonDataObjects.push(jsonDataObject);
            }
            callback(jsonData);
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Failed to parse RDF/XML data: " + textStatus + " (" +  errorThrown +")");
          }
        });
      }
    }
  };
})(jQuery);