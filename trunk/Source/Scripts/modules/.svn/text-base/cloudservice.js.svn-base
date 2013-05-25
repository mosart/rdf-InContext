/*
 * File: module/cloudservice.js
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

  // Service for the gathering of clouds
  // A cloud is a group of related objects to the center object
  Visualizer.CloudService = function (moduleID, sandbox) {

    return {
      // Order all relation objects in one array based on weight
      gatherClouds: function (relationObjects) {
        // If the parameter is just one relationObject make an array of it
        if (!$.isArray(relationObjects))
          relationObjects = [relationObjects];

        // result array
        var clouds = [];

        // For all relationObjects ...
        $.each(relationObjects, function (i, relationObject) {
          // ... and all types in that object
          for (var relationType in relationObject) {
            // Push it into the result array
            clouds.push(relationObject[relationType]);
          }
        });

        // preserve context
        var that = this;
        // sort the array
        clouds.sort(function (a, b) { return that.sortClouds(a, b); });

        return clouds;
      },

      // sorting method
      sortClouds: function (cloudA, cloudB) {
        // reverse sort (descending by weight)
        return getWeight(cloudB) - getWeight(cloudA);
      }
    };

    // utility method to determine the weight of a cloud
    function getWeight(cloud) {
      var lines = 0;

      $.each(cloud.objects, function (i, o) {
        // each object contributes a type line and some padding and borders
        lines += 2;
        if (o.object.getTitle()) {
          // A text line is average of 4 words, so add (total words / 4)
          lines += o.object.getTitle().split(' ').length / 4;
        }
      });

      return lines;
    }
  };
})(jQuery);