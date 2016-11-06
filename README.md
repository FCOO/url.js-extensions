# url.js-extensions
[url.js]: https://github.com/jillix/url.js


## Description
Extensions to [url.js]

## Installation
### bower
`bower install https://github.com/FCOO/url.js-extensions.git --save`

## Demo
http://FCOO.github.io/url.js-extensions/demo/ 

## Methods

### Original [url.js] methods

#### [`queryString(name, notDecoded)`](https://github.com/jillix/url.js#querystringname-notdecoded)

#### [`parseQuery(search)`](https://github.com/jillix/url.js#parsequerysearch)

#### [`stringify(queryObj)`](https://github.com/jillix/url.js#stringifyqueryobj)

#### [`updateSearchParam(param, value, push, triggerPopState)`](https://github.com/jillix/url.js#updatesearchparamparam-value-push-triggerpopstate)

#### [`hash(newHash, triggerPopState)`](https://github.com/jillix/url.js#hashnewhash-triggerpopstate)


### New methods

#### `adjustUrl()`
Check and correct the url by removing strings that are not decodeable. 
Also called on window-event `hashchange`

Eg. `?test=1,2,3,4,%5,6,7,9` => `?test=1,2,3,4,,6,7,9`

#### `hashString(name, notDecoded)`
Same as `queryString` but for the hash

#### `parseHash()`
Same as `parseQuery` but for the hash

#### `updateHashParam(hashParam, value, push, triggerPopState)`
Same as `updateSearchParam` but for the hash

#### `validateValue( value, validator )`
Validates `value` using `validator`

 `validator` = regular expression `String` | `function( value )` return `Boolean` | `array of validator`

**Special validator to validate format**
- `"BOOLEAN"` : return `true` if `value == "true"` or `value = "false"`
- `"NUMBER"`  : return `true`if `value` is a valid number-string
- `"JSON"`    : return `true`if `value` is a valid stringify json-object
- `"NOTEMPTY"`: return `true` if `value` in not empty

The validations will be preformed in the order of the array 
Eg. `Url.validateValue( myValue, ["_number", function( v ){ return parseFloat(v) > 0; } ] );` will return `true` if `myValue` is a number and greater than zero



#### `parseAll( validatorObj, defaultObj, options )

Returns a object with `id: value` for both query-string and hash-tags

`validatorObj`: object with `id:validator`. Failed values are removed 
`defaultObj  `: object with `id:value`. Values to be used if `id` is missing or fails validation 

`options: {`
`convertBoolean`: `Boolean` (default = `true` ) If `true` all values == `"true"` or `"false"` are converted into `Boolean`
`convertNumber` : `Boolean` (default = `true`  ) If `true` all values representing a number is converted to float
`convertJSON`  : `Boolean` (default = `true` ) If true all values representing a stringify json-object is converted to a real json-object
`queryOverHash`: `Boolean` (default = `true` ) If `true` and the same `id` is given in both query-string and hash-tag the value from query-string is returned. If `false` the value from hash-tag is returned

`}`


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/url.js-extensions/LICENSE).

Copyright (c) 2016 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgements
#### [jillix gmbh](https://github.com/jillix)