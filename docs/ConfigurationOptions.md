#summary Description of the available configuration options.

= Introduction =

This page describes the configuration options of the visualiser.

Configuration options are passed to the visualiser as an associative array during the initialization:
{{{
var app = new VisualizerApp("visualizer_canvas", "123",
	{
		debug: true,
		dataUrl: "Example/example_data.rdf",
		schemaUrl: "Example/example_schema.rdf",
		... more configuration options ...
	}
});
}}}

Options with default values do not need to be set unless a different value than the default value is desired.

For more information about installing InContext see [Installation].

= Configuration options =

===maxWidth===
  * Default: 700
  * Optional
  * Maximum width of the visualizer canvas in pixels.

===debug===
  * Default: false
  * Optional
  * When set to true, all fired events will be logged to the browser console.

===dataUrl===
  * Default: Empty
  * Mandatory
  * URL where the RDF data can be found.

===dataFormat===
  * Default: application/rdf+xml
  * Optional
  * Data format, can be application/rdf+xml for RDF/XML or application/json for RDF/JSON.

===schemaUrl===
  * Default: Empty
  * Mandatory
  * URL where the RDF schema data can be found.

===schemaFormat===
  * Default: application/rdf+xml
  * Optional
  * Schema format, can be application/rdf+xml for RDF/XML or application/json for RDF/JSON.

===idProperty===
  * Default: Empty
  * Optional
  * This property will be used as ID property for all external communication with the visualizer. If it's not specified, the default RDF ID will be used.
  * Example: http://purl.utwente.nl/ns/escape-system.owl#id

===titleProperties===
  * Default: Empty
  * Mandatory
  * Defines the fields that holds the object's title. This field will be displayed in the visualization. The value must be an array of identifiers.
  * Example: `['http://purl.org/dc/elements/1.1/title', 'http://xmlns.com/foaf/0.1/name']`

===dontShowProperties===
  * Default: Empty
  * Optional
  * Defines which fields should not be displayed in the visualization. The value must be an array of identifiers.
  * Example: `['http://foo.bar/system/someProperty']`

===inverseTypeId===
  * Default: http://www.w3.org/2002/07/owl#inverseOf
  * Optional
  * Indicates the identifier of the InverseOf object in the RDF Schema. Used to find inverse relation.

===symmetricTypeId===
  * Default: http://www.w3.org/2002/07/owl#SymmetricProperty
  * Optional
  * Identifier for symmetric properties in the RDF Schema.

===imageTypeId===
  * Default: Empty
  * Optional
  * Defines the field that holds an URI that can be shown as an image. When specified, the field will not be shown as property, only as actual image.
  * Example: http://xmlns.com/foaf/0.1/img  

===annotationTypeId===
  * Default: http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement
  * Optional
  * Type identifier that indicates an object is an annotation on a relation between to objects. See: [RelationAnnotations Relation Annotations].

===objectAnnotationTypeId===
  * Default: http://www.w3.org/1999/02/22-rdf-syntax-ns#object
  * Optional
  * Identifier for the property that holds the URI to the object of the annotation. See: [RelationAnnotations Relation Annotations].

===subjectAnnotationTypeId===
  * Default: http://www.w3.org/1999/02/22-rdf-syntax-ns#subject
  * Optional
  * Identifier for the property that holds the URI to the subject of the annotation. See: [RelationAnnotations Relation Annotations].

===descriptionAnnotationTypeId===
  * Default: http://purl.org/dc/terms/description
  * Optional
  * Indicates the property identifier for the property on the annotation object that holds the description. See: [RelationAnnotations Relation Annotations].

===useHistoryManager===
  * Default: true
  * Optional
  * If true, the browser's history will be used to be able to navigate back and forward between objects. Deeplinking to objects will work. If false, URL won't be changed and navigating back and forward using the browser controls won't work.

===showProperties===
  * Default: true
  * Optional
  * It false, the central object will not show it's metadata. This saves space, so if the visualizer is intended for navigation only, set this property to false.

===linkTarget===
  * Default: Empty
  * Optional
  * Specifies the target of link properties.
  * Examples:
    * `_self`, links will open in the current window
    * `_blank`, links will open in a new window
    * `_none`, will be rendered as link, but link won't open (only "uri-click" event is fired)
    * (Empty), value will be rendered as plain text

===objectLinkTarget===
  * Default: _blank
  * Optional
  * Specifies if the link to view the source of an object is rendered and the behavior of the link.
  * Examples:
    * `_self`, object view link will open in the current window
    * `_blank` (default), object view link will open in a new window
    * `_none`, object view link will be rendered, but link won't open (only "object-uri-click" event is fired)
    * (Empty), the option to view the object will not be rendered

===concatCharacters===
  * Default: " | "
  * Optional
  * Used to concat properties that have multiple values.

===baseClassTypes===
  * Default:
{{{
"http://www.w3.org/2002/07/owl#Thing": "thing",
"http://www.openarchives.org/ore/terms/Aggregation": "aggregation",
"http://xmlns.com/foaf/0.1/Document": "document",
"http://xmlns.com/foaf/0.1/Image": "image",
"http://xmlns.com/foaf/0.1/Group": "group",
"http://xmlns.com/foaf/0.1/Organization": "organization",
"http://xmlns.com/foaf/0.1/Person": "person",
"http://xmlns.com/foaf/0.1/Project": "project",
"http://www.w3.org/2004/02/skos/core#Concept": "concept"
}}}
  * Optional
  * Specifies the class types to use for the visualize. This configuration has two effects:
    * The aggregation page has a grouping based on base classes. It finds the deepest defined base class for a data node (out of this configuration) that is not defined as "thing". If no base class is found, the grouping occurs based on the class of the node itself.
    * In CSS it is possible to declare styles based on base class. Icons, for instance, are defined in CSS based on the first base class found (out of this configuration).
  * NB. The value is used as a class identifier in CSS, it is therefore not allowed to use non-CSS class characters in it (allowed characters are: a-z, A-Z, 0-9,- and `_`).
 
