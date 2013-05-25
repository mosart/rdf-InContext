/*
 * File: module/dataservice.js
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

/// <reference path="../domain/node.js"/>

(function ($) {

  //DataService
  //Responsible to map server data to usable domain objects
  Visualizer.DataService = function (moduleID, sandbox) {

    var AggregateTypeIdentifier = "http://www.openarchives.org/ore/terms/Aggregation";
    var TypePropertyIdentifier = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    var ObjectTypePropertyIdentifier = "http://www.w3.org/2002/07/owl#ObjectProperty";

    var BaseClassTypes = sandbox.getConfig("baseClassTypes");
    var DefaultBaseClassTypeId = "http://www.w3.org/2002/07/owl#Thing";

    //Get identifiers from configuration
    var TitlePropertyIdentifiers = sandbox.getConfig("titleProperties");
    var AnnotationTypeIdentifier = sandbox.getConfig("annotationTypeId");
    var ObjectAnnotationTypeIdentifier = sandbox.getConfig("objectAnnotationTypeId");
    var SubjectAnnotationTypeIdentifier = sandbox.getConfig("subjectAnnotationTypeId");
    var IdPropertyIdentifier = sandbox.getConfig("idProperty");
    var ConcatCharacters = sandbox.getConfig("concatCharacters");

    var dataConnector;
    var schemaService;

    var URI_IDENTIFIER = 'uri';

    var objects = {};

    return {
      init: function () {
        dataConnector = sandbox.getService("dataconnector");
        schemaService = sandbox.getService("schemaservice");
      },

      //returns data from JSON service
      getData: function (id, callback) {
        dataConnector.getData(id, function (data) {
          callback(data);
        });
      },

      //Returns the center object, undefined is center object is not found
      getCenterObject: function (id, callback) {
        var that = this;

        //Call the GetData method
        this.getData(id, function (data) {
          //is the MAPPED data already cached?
          if (!objects[id])
            objects[id] = that.mapJsonData(data); //Map DATA to combine DATA and SCHEMA

          // Get center object from mapped data
          var center = that.getObjectById(objects[id], id);

          //display an error if the center object cannot be found
          if (center == undefined)
            alert("Fatal error: unable to find object " + id);

          // Find the aggregation object
          var aggregate = that.findAggregateObject(objects[id]);

          //display an error if the center object cannot be found
          if (aggregate == undefined)
            alert("Fatal error: unable to find the aggregation object");

          //Is the center object found?
          if (center && !center.isLoaded) {
            //Only do this the first time this object is requested

            //Add aggregate object
            center.aggregate = aggregate;

            // Do something for the regular object
            if (center != aggregate) {
              //Add inverse relations
              center.inverseRelations = that.getInverseRelations(objects[id], center.id);

              //Move relation annotations to the respective relations (are already linked in object as normal relations)
              that.moveRelationAnnotations(center);

              //Remove the aggregation object
              that.removeAggregateFromRelations(center.relations);
              that.removeAggregateFromRelations(center.inverseRelations);

              center.combinedRelations = that.combineRelations(center.relations, center.inverseRelations);

              //Set this object as loaded
              center.isLoaded = true;
            }
            // Do something else for the aggregation object
            else {
              var temprelations = {};

              // Organize related objects according to base class
              for (var relationKey in center.relations) {
                $.each(center.relations[relationKey].objects, function (i, relatedObject) {
                  var baseClass = that.findBaseClass(relatedObject.object.getProperty(TypePropertyIdentifier).valueDescriptor);

                  // No annotations for the aggregation page (objects arent grouped by relationtype)
                  that.addRelation(temprelations, baseClass, relatedObject.object);
                });
              }

              // Clear all relation annotations (they do not show up on the aggregation page)
              delete temprelations[AnnotationTypeIdentifier];

              center.relations = temprelations;
              center.combinedRelations = temprelations;
            }
          }

          //Async function is finished, trigger callback with center object
          callback(center);
        });
      },

      // For the given type find the lowest base class (but take self if #Thing is found)
      // Note that #Thing is compared using the string, not the uri. So adding a specific #Thing
      // (other than the w3 one) is possible
      findBaseClass: function (classDescriptor) {
        // Fallback if no baseclass is ever found (self)
        var foundBaseClass = classDescriptor;

        // Get the parent class (if exists) from the schema (using isSubClassOf)
        var parentClass = schemaService.getParentClassFromSchema(classDescriptor);
        // While a parentClass exists
        while (parentClass) {
          // If the parenclass is no thing and is configured to be a base class, use it
          if (BaseClassTypes[parentClass] && BaseClassTypes[parentClass] != "thing")
            foundBaseClass = parentClass;

          parentClass = schemaService.getParentClassFromSchema(parentClass);
        }

        return foundBaseClass;
      },

      // Find the first base class (this one should have an icon)
      findClosestBaseClass: function (classDescriptor) {
        // If the class is a base class itself return it
        if (BaseClassTypes[classDescriptor])
          return BaseClassTypes[classDescriptor];

        // Get the parent class from the schema
        var parentClass = schemaService.getParentClassFromSchema(classDescriptor);
        // While a parentclass can be found and it's not a base class do some searching
        while (parentClass && !BaseClassTypes[parentClass]) {
          parentClass = schemaService.getParentClassFromSchema(parentClass);
        }

        // If parentclass contains a value then it is the closest baseclass
        if (parentClass) {
          return BaseClassTypes[parentClass];
        }
        // If the parentclass is not set then there is no baseclass, so revert to default base class (w3's #Thing)
        else {
          return BaseClassTypes[DefaultBaseClassTypeId];
        }
      },

      //gets a single object by id. Used the configured id property (if available)
      getObjectById: function (objects, id) {
        //No custom id property
        if (IdPropertyIdentifier == '') {
          return objects[id];
        }
        else {
          //Search for object id match on configured objectid property
          for (var objName in objects) {
            if (objects[objName].getId() == id) return objects[objName];
          }
        }

        sandbox.log("Current object not found", id);
      },

      //Gets all related objects pointing to this object
      getInverseRelations: function (objects, id) {
        var inverseRelations = {};

        //For each object
        for (var objName in objects) {
          var obj = objects[objName];

          //For each relation type
          for (var descriptor in obj.relations) {
            var objectArray = obj.relations[descriptor].objects;

            //For each URI in a relation type array, find the corresponding referenced object
            for (var i = 0; i < objectArray.length; i++) {
              var relatedId = objectArray[i].object.id;

              if (relatedId == id) {
                this.addRelation(inverseRelations, descriptor, obj);
              }
            }
          }
        }

        return inverseRelations;
      },

      // Combine relations with inverseRelations
      combineRelations: function (relations, inverseRelations) {
        // make a local copy of the first relations object
        var combinedRelations = $.extend({}, relations);

        // Traverse the second relations object
        for (var relationType in inverseRelations) {
          var relationObject = inverseRelations[relationType];
          // Determine if there is an inverse relation type, use it if it exists
          var key = relationObject.inverse ? relationObject.inverse : relationObject.descriptor;

          var that = this;
          $.each(relationObject.objects, function (i, relation) {
            // add the found relation to the combinedrelations (using the inverse key)
            that.addRelation(combinedRelations, key, relation.object, relation.annotations);
          });
        }

        return combinedRelations;
      },

      //Fills all relation annotations for 1 object
      moveRelationAnnotations: function (object) {
        //Get all relation annotations from the current data
        for (var key in object.inverseRelations) {
          var deletedIndices = [];

          var objKey = object.inverseRelations[key].objects.length;
          while (objKey--) {
            var relObject = object.inverseRelations[key].objects[objKey];

            //Is it an annotation?
            if (relObject.object.properties[TypePropertyIdentifier].valueDescriptor == AnnotationTypeIdentifier) {

              //Add this relation as annotation
              this.addRelationAnnotation(object, relObject.object);

              //Delete relation annotation as relation object
              object.inverseRelations[key].objects.splice(objKey, 1);
            }
          }
        }

        //If no more objects, delete relation type
        if (object.inverseRelations[key].objects.length == 0) {
          delete object.inverseRelations[key];
        }
      },

      //Add relation annotation
      addRelationAnnotation: function (object, annotation) {

        //Expected OBJECT and SUBJECT
        if (annotation.relations[ObjectAnnotationTypeIdentifier] && annotation.relations[SubjectAnnotationTypeIdentifier]) {

          var objectId = annotation.relations[ObjectAnnotationTypeIdentifier].objects[0].object.id;
          var subjectId = annotation.relations[SubjectAnnotationTypeIdentifier].objects[0].object.id;

          //Look in relations
          for (var key in object.relations) {
            for (var objKey = 0; objKey < object.relations[key].objects.length; objKey++) {

              var relObject = object.relations[key].objects[objKey];

              //Relation object ID same as SUBJECT or OBJECT?
              if (relObject.object.id == objectId || relObject.object.id == subjectId) {
                relObject.annotations.push(annotation);
              }
            }
          }

          //Look in inverse relations
          for (var key in object.inverseRelations) {
            for (var objKey = 0; objKey < object.inverseRelations[key].objects.length; objKey++) {

              var relObject = object.inverseRelations[key].objects[objKey];

              //Relation object ID same as SUBJECT or OBJECT?
              if (relObject.object.id == objectId || relObject.object.id == subjectId) {
                relObject.annotations.push(annotation);
              }
            }
          }
        }
      },

      // Determine the aggregation object in a set of objects
      findAggregateObject: function (objects) {
        for (key in objects) {
          if (objects[key].properties[TypePropertyIdentifier] != undefined && objects[key].properties[TypePropertyIdentifier].valueDescriptor == AggregateTypeIdentifier) {
            return objects[key];
          }
        }
      },

      //Remove aggregate from relations
      removeAggregateFromRelations: function (relationsObject) {

        //Get all inverse-relations from the current data
        for (var key in relationsObject) {
          for (var objKey = 0; objKey < relationsObject[key].objects.length; objKey++) {
            var relObject = relationsObject[key].objects[objKey];

            //Is it the aggregation object?
            if (relObject.object.properties[TypePropertyIdentifier].valueDescriptor == AggregateTypeIdentifier) {

              //Delete relation relation object
              relationsObject[key].objects.splice(objKey, 1);
            }
          }

          //If no more objects, delete relation type
          if (relationsObject[key].objects.length == 0) {
            delete relationsObject[key];
          }
        }

      },

      //Maps the json data to usable objects
      mapJsonData: function (data) {
        var objects = [];

        //Loop through all the objects in the data
        for (var objectId in data) {
          if (IdPropertyIdentifier && !data[objectId][IdPropertyIdentifier])
            continue;

          var externalId = objectId;
          if (IdPropertyIdentifier != "") {
            externalId = data[objectId][IdPropertyIdentifier][0].value;
          }
          var obj = new Visualizer.Node(objectId, externalId);

          //Add properties of object
          for (var propertyDescriptor in data[objectId]) {
            var propertyData = data[objectId][propertyDescriptor];

            var schemaDataType = schemaService.getPropertyTypeFromSchema(propertyDescriptor);

            for (var i = 0; i < propertyData.length; i++) {
              // Current type/value pair
              var typeValue = propertyData[i];

              // is the current type an uri and does it reference an object in the dataset
              if (typeValue.type == URI_IDENTIFIER && data[typeValue.value] && schemaDataType == ObjectTypePropertyIdentifier) {
                //create relation
                this.addRelation(obj.relations, propertyDescriptor, typeValue.value);
              }
              else {
                //Create normal property
                var propertyLabel = schemaService.getPropertyNameFromSchema(propertyDescriptor);

                var property = {
                  descriptor: propertyDescriptor,
                  valueDescriptor: typeValue.value,
                  value: schemaService.getPropertyNameFromSchema(typeValue.value),
                  label: propertyLabel,
                  type: typeValue.type
                };

                this.addProperty(obj, property);
              }
            }
          }
          
          //Determine the object's title
          for (var i = 0; i < TitlePropertyIdentifiers.length; i++) {
            var titlePropertyIdentifier = TitlePropertyIdentifiers[i];
            var value = obj.getPropertyValue(titlePropertyIdentifier);
            if (value != null) {
              //Title found
              obj.title = value;
              //Remove the statement from the object's properties
              delete obj.properties[titlePropertyIdentifier];
              break;
            }
          }
          if (obj.title == null) {
            obj.title = 'Unnamed object';
          }

          //Add to objects collection
          objects[obj.id] = obj;
        }

        //Replace uri by object reference for relations
        this.fillRelationReferences(objects);

        return objects;
      },

      //Add a relation with a specific descriptor to the array
      addRelation: function (relationsObject, descriptor, value, annotations) {
        if (!annotations)
          annotations = [];

        //is this the first relation of this type?
        if (!relationsObject[descriptor]) {
          var label = schemaService.getPropertyNameFromSchema(descriptor);
          var inverse = schemaService.getInverseFromSchema(descriptor);

          //Add relation type
          relationsObject[descriptor] = { descriptor: descriptor, inverse: inverse, label: label, objects: [] }
        }

        //Create object / annotations object
        var relAnnotation = { object: value, annotations: annotations }

        var isFound = false;
        //Try to find object in existing collection (we dont want objects to appear twice)
        for (var rel in relationsObject[descriptor].objects) {

          if (relationsObject[descriptor].objects[rel].object == value) {
            isFound = true;
          }
        }

        //Add to the collection (if it's not already found in the collection)
        if (!isFound) {
          relationsObject[descriptor].objects.push(relAnnotation);
        }
      },

      //Add property value to object
      addProperty: function (obj, property) {
        if ( property.descriptor == TypePropertyIdentifier && property.value == 'http://purl.org/info:eu-repo/semantics/EnhancedPublication' ) {
          //Workaround, do not process RDF type = http://purl.org/info:eu-repo/semantics/EnhancedPublication statements
          //The visualizer does not support multiple RDF type elements and will take the first type
          //The type http://purl.org/info:eu-repo/semantics/EnhancedPublication might mask http://www.openarchives.org/ore/terms/Aggregation
        }
        else {
          if (!obj.properties[property.descriptor]) {
            obj.properties[property.descriptor] = property;
          } else {
            //Concat if property has multiple values
            //We can't concatenate RDF type statements
            if (property.descriptor != TypePropertyIdentifier) {
              obj.properties[property.descriptor].value += ConcatCharacters + property.value;
            }
          }
        }
      },

      //Replace uri by object reference for relations
      fillRelationReferences: function (objects) {
        //For each object
        for (var objName in objects) {
          var obj = objects[objName];

          //For each relation type
          for (var descriptor in obj.relations) {
            var objectArray = obj.relations[descriptor].objects;

            //For each URI in a relation type array, find the corresponding referenced object
            for (var i = 0; i < objectArray.length; i++) {
              objectArray[i].object = objects[objectArray[i].object];
            }
          }
        }
      }
    };
  };
})(jQuery);