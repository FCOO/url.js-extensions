"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj};(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Url=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o])}return s}({1:[function(require,module,exports){window.addEventListener("popstate",function(e){Url.triggerPopStateCb(e)});var Url=module.exports={_onPopStateCbs:[],_isHash:false,queryString:function queryString(name,notDecoded){name=name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var regex=new RegExp("[\\?&]"+name+"=([^&#]*)"),results=regex.exec(location.search),encoded=null;if(results===null){regex=new RegExp("[\\?&]"+name+"(\\&([^&#]*)|$)");if(regex.test(location.search)){return true}return undefined}else{encoded=results[1].replace(/\+/g," ");if(notDecoded){return encoded}return decodeURIComponent(encoded)}},parseQuery:function parseQuery(search){var query={};if(typeof search!=="string"){search=window.location.search}search=search.replace(/^\?/g,"");if(!search){return{}}var a=search.split("&"),i=0,iequ,value=null;for(;i<a.length;++i){iequ=a[i].indexOf("=");if(iequ<0){iequ=a[i].length;value=true}else{value=decodeURIComponent(a[i].slice(iequ+1))}query[decodeURIComponent(a[i].slice(0,iequ))]=value}return query},stringify:function stringify(queryObj){if(!queryObj||queryObj.constructor!==Object){throw new Error("Query object should be an object.")}var stringified="";Object.keys(queryObj).forEach(function(c){var value=queryObj[c];stringified+=c;if(value!==true){stringified+="="+encodeURIComponent(queryObj[c])}stringified+="&"});stringified=stringified.replace(/\&$/g,"");return stringified},updateSearchParam:function updateSearchParam(param,value,push,triggerPopState){var searchParsed=this.parseQuery();if(value===undefined){delete searchParsed[param]}else{if(searchParsed[param]===value){return Url}searchParsed[param]=value}var newSearch="?"+this.stringify(searchParsed);this._updateAll(window.location.pathname+newSearch+location.hash,push,triggerPopState);return Url},getLocation:function getLocation(){return window.location.pathname+window.location.search+window.location.hash},hash:function hash(newHash,triggerPopState){if(newHash===undefined){return location.hash.substring(1)}if(!triggerPopState){setTimeout(function(){Url._isHash=false},0);Url._isHash=true}return location.hash=newHash},_updateAll:function _updateAll(s,push,triggerPopState){window.history[push?"pushState":"replaceState"](null,"",s);if(triggerPopState){Url.triggerPopStateCb({})}return s},pathname:function pathname(_pathname,push,triggerPopState){if(_pathname===undefined){return location.pathname}return this._updateAll(_pathname+window.location.search+window.location.hash,push,triggerPopState)},triggerPopStateCb:function triggerPopStateCb(e){if(this._isHash){return}this._onPopStateCbs.forEach(function(c){c(e)})},onPopState:function onPopState(cb){this._onPopStateCbs.push(cb)},removeHash:function removeHash(){this._updateAll(window.location.pathname+window.location.search,false,false)},removeQuery:function removeQuery(){this._updateAll(window.location.pathname+window.location.hash,false,false)},version:"2.3.1"}},{}]},{},[1])(1)});
;
/****************************************************************************
    url.js-extensions.js, 

    (c) 2016, FCOO

    https://github.com/FCOO/url.js-extensions
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    //Workaround for event.newURL and event.oldURL
    //let this snippet run before your hashchange event binding code
    if (!window.HashChangeEvent)(
        function(){
            var lastURL= document.URL;
            window.addEventListener("hashchange", function(event){
                Object.defineProperty(event,"oldURL",{enumerable:true,configurable:true,value:lastURL});
                Object.defineProperty(event,"newURL",{enumerable:true,configurable:true,value:document.URL});
                lastURL = document.URL;
            });
        }()
    );


    //Overwrite Url._updateAll to handle Security Error in Safari on Mac that prevent more that 100 history updates in 30 sec
    window.Url._updateAll = function(s, push, triggerPopState) {
        try {
            window.history[push ? "pushState" : "replaceState"](null, "", s);          
        }
        catch (e) {
            //Use 'old' methods - perhaps it will reload the page 
            window.location.replace( s );
        }
        
        if (triggerPopState) {
            window.Url.triggerPopStateCb({});
        }
        return s;
    };


    /******************************************
    anyString(name, notDecoded, search, sep)
    Copy of Url.queryString with optional input string (search) 
    and separaator (sep)
    ******************************************/
    function anyString(name, notDecoded, search, sep){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

        var regex = new RegExp("[\\"+sep+"&]" + name + "=([^&#]*)")
          , results = regex.exec(search)
          , encoded = null
          ;

        if (results === null) {
            regex = new RegExp("[\\"+sep+"&]" + name + "(\\&([^&#]*)|$)");
            if (regex.test(search)) {
                return true;
            }
            return undefined;
        } else {
            encoded = results[1].replace(/\+/g, " ");
            if (notDecoded) {
                return encoded;
            }
            return decodeURIComponent(encoded);
        }
    }


    /******************************************
    _correctSearchOrHash
    Check and correct search or hash = ID_VALUE[&ID_VALUE]
        ID_VALUE = 
            ID or
            ID=VALUE or
            ID=VALUE,VALUE2,...,VALUEN
        VALUE contains only a-z 0-9 - _ SPACE
        ID contains only a-z 0-9 - _
    *******************************************/
    function _correctSearchOrHash( str, preChar ){
        function decodeStr( str ){
            try {
                decodeURIComponent( str ); 
                return decodeURIComponent( str ); 
            }
            catch(err) { 
                return undefined;
            }
        }

        //Chack and correct the parameter and/or hash-tag
        var strList,
            result = '',
            idRegEx = new RegExp(/[\w\-_]+/),
            idValues, id, values, value, oneValueOk, i, j;

        //Convert to char
        str = str.replace(/%3D/g, '=');
        str = str.replace(/%2C/g, ',');
        str = str.replace(/%3F/g, '?');
        str = str.replace(/%23/g, '#');
        str = str.replace(/%7B/g, '{');
        str = str.replace(/%7D/g, '}');
        str = str.replace(/%2B/g, '+');
        str = str.replace(/%22/g, '"');
        str = str.replace(/%3A/g, ':');

        //Remove pre-char
        while (preChar && str.length && (str.charAt(0) == preChar) )
            str = str.slice(1);

        strList = str.split('&'); 

        for (i=0; i<strList.length; i++ ){
            idValues = strList[i].split('=');
            id = decodeStr( idValues[0] );
            values = idValues[1] || undefined; 
            oneValueOk = false;
            if ( id && (idRegEx.exec(id) == id ) ){
                //Correct id
                if (values === undefined){
                    oneValueOk = true;
                    valueList = [];
                }
                else {
                    //Check syntax of values
                    var valueList = values.split(',');
                    for (j=0; j<valueList.length; j++ ){
                        value = decodeStr( valueList[j] );
                        if ( value ){
                            if (value == 'undefined')
                              valueList[j] = 'false';
                            oneValueOk = true;
                        }
                        else
                            valueList[j] = undefined;
                    }
                }
                if ( oneValueOk ){
                    result += (result ? '&' : '') + id;
                    var firstValue = true;
                    for (j=0; j<valueList.length; j++ ){
                        value = valueList[j];
                        result += (firstValue ? '=' : ',') + (value ? value : ''); 
                        firstValue = false;
                    }
                }
            } //end of correct id
        }
        return decodeURIComponent(result);
    }


    /******************************************
    adjustUrl
    Check and correct the url
    *******************************************/
    function adjustUrl(){ 
        var oldSearch = window.location.search,
            newSearch = this._correctSearchOrHash( oldSearch, '?' ),
            oldHash   = window.location.hash,
            newHash   = this._correctSearchOrHash( oldHash, '#' ),
            newUrl    = window.location.pathname +  
                          (newSearch ? '?' + encodeURI(newSearch) : '') + 
                          (newHash   ? '#' + encodeURI(newHash)   : '');

        this._updateAll( newUrl );          
        return newUrl;
    }

    /******************************************
    onHashchange( handler [, context])
    Add handler = function( event) to the event "hashchange"
    Can by omitted if the hash-tag is updated using 
    Url.updateHashParam(..) or Url.updateHash(..)
    *******************************************/
    function onHashchange( handler, context ){
        this.hashchange = this.hashchange || [];
        this.hashchange.push( $.proxy(handler, context) );
    }
   
    /******************************************
    hashString
    Same as queryString but for the hash
    It is a adjusted copy of queryString
    *******************************************/
    function hashString(name, notDecoded){
        return anyString(name, notDecoded, window.location.hash, '#');
    }
    
    /******************************************
    parseHash
    Same as parseQuery but for the hash
    *******************************************/
    function parseHash(){
        return this.parseQuery( this.hash() );    
    }

    /******************************************
    updateHash(hashObj, dontCallHashChange)
    Update hash-tag with the id-value in hashObj
    If dontCallHashChange==true the hashchange-event-functions 
    added with Url.onHashchange( function[, context]) will not be called
    *******************************************/
    function updateHash(hashObj, dontCallHashChange){
        this.dontCallHashChange = dontCallHashChange;
        var newHash = this.stringify( $.extend({}, this.parseHash(), hashObj || {}) );

        //return window.location.hash = '#'+newHash;
        return this._updateAll(window.location.pathname + window.location.search + '#' + newHash, false);
    }
     
    /******************************************
    updateHashParam
    Adds, updates or deletes a hash-tag
    If dontCallHashChange==true the hashchange-event-functions 
    added with Url.onHashchange( function[, context]) will not be called
    *******************************************/
    function updateHashParam(hashParam, value, dontCallHashChange){
        var hashParsed = this.parseHash();
        if (value === undefined){
            delete hashParsed[hashParam];
        }
        else {
            if (hashParsed[hashParam] === value)
                return this;
            hashParsed[hashParam] = value;
        }
        this.dontCallHashChange = dontCallHashChange;

        //return window.location.hash = this.stringify(hashParsed);
        return this._updateAll(window.location.pathname + window.location.search + '#' + this.stringify(hashParsed), false);

    }


    /******************************************
    validateValue
    Validate value using validator
    validator = regExp | function( value ) | array of validator
    *******************************************/
    function validateJSONValue( value ){
        try {
            var jsonObj = JSON.parse( value );
            if ($.type( jsonObj ) == 'object')
                return true;
        }
        catch (e) { 
            return false;
        }
        return false;
    }

    function validateValue( value, validator ){
        //Convert Boolean into String
        if ($.type( value ) === "boolean")
            value = value ? 'true' : 'false';  
        value = value || '';

        if (validator === undefined)
            return true;

        if ( $.isFunction(validator) )
          return !!validator( value );

        if ( $.isArray(validator) ){
            var result = true;
            $.each( validator, function( index, _validator ){
                if ( !validateValue( value, _validator) ){
                    result = false;
                    return false;
                }
            });
            return result;
        }
        switch (validator){
            case 'BOOLEAN' : validator = /true|false/;           break;
            case 'NUMBER'  : validator = /[-+]?[0-9]*\.?[0-9]+/; break;
            case 'NOTEMPTY': validator = /.+/;                   break;

            //Special case for json-object-string
            case 'JSON'    : return validateValue( value, validateJSONValue); 
        }

        var regExp = new RegExp(validator),
            execResult = regExp.exec(value); 
        return !!(execResult && (execResult.length == 1) && (execResult[0] == value));
    }


    /******************************************
    _parseObject( obj, validatorObj, defaultObj, options )
    Parse obj after it is validated and converted acording to
    validatorObj, defaultObj, and options

    validatorObj: object with {id: validator,..}. Failed values are removed 
    defaultObj  : object with {id: value}. Values to be used if `id` is missing or fails validation 
    options: {
        convertBoolean: Boolean (default = true ) If true all values == "true" or "false" are converted into Boolean
        convertNumber : Boolean (default = true ) If true all values representing a number is converted to float
        convertJSON   : Boolean (default = true ) If true all values representing a stringify json-object is converted to a real json-object
        queryOverHash : Boolean (default = true ) If true and the same id is given in both query-string and hash-tag the value from query-string is returned. 
                                                  If false the value from hash-tag is returned
    }
    *******************************************/
    function _parseObject( obj, validatorObj, defaultObj, options ){
        validatorObj = validatorObj || {}; 
        defaultObj = defaultObj || {}; 
        options = $.extend( {}, options, { 
            convertBoolean: true, 
            convertNumber : true, 
            convertJSON   : true,
            queryOverHash : true 
        }); 
        
        var _this = this;

        //Validate all values
        $.each( obj, function( id, value ){
            //Convert '+' to space
            if ( $.type(value) == 'string' )
                value = value.replace(/\+/g, " ");
            
            //Validate value
            if ( !_this.validateValue( value, validatorObj[id] ) )
                value = undefined; 

            //Convert "true" and false" to Boolean
            if ( options.convertBoolean && ( (value == 'true') || (value == 'false') ) )
              value = (value == 'true');
                
            //Convert String to Float
            if (options.convertNumber && _this.validateValue( value, 'NUMBER') ){
                value = parseFloat( value );
            }
                
            //Remove deleted keys
            if (value === undefined)
                delete obj[id];
            else
                obj[id] = value;
        });

        //Convert String to json-object
        if (options.convertJSON)
            $.each( obj, function( id, value ){
                if ( _this.validateValue( value, 'JSON') )
                    obj[id] = JSON.parse( value );
            });        
        
        //Insert default values
        $.each( defaultObj, function( id, value ){
            if (obj[id] === undefined)
              obj[id] = value;
        });

        return obj;
    }

    /******************************************
    parseAll( validatorObj, defaultObj, options )
    Parse the combined query-string and hash-tags
    Returns a object with `id: value` for both query-string and hash-tags
    validatorObj, defaultObj, options: See _parseObject
    *******************************************/
    function parseAll( validatorObj, defaultObj, options ){
        var _this = this,
            queryOverHash = options ? !!options.queryOverHash : true;

        function parseObj( str ){ 
            var obj = _this.parseQuery( str );

            //Use anyString(..) to get adjusted value
            $.each( obj, function( id/*, value*/ ){
                obj[id] = anyString(id, false, '?'+str, '?');
            });

            return _this._parseObject( obj, validatorObj, defaultObj, options ); 
        }

        var queryObj = parseObj( this._correctSearchOrHash( window.location.search, '?' ) ),
            hashObj  = parseObj( this._correctSearchOrHash( window.location.hash,   '#' ) );

        return $.extend( queryOverHash ? hashObj  : queryObj, 
                         queryOverHash ? queryObj : hashObj   ); 
    }

    /******************************************
    onHashChange()
    ******************************************/
    function onHashChange( event ){
        //Adjust the hash-tag
        var oldHash = window.location.hash,
            newHash = this._correctSearchOrHash( oldHash, '#' );

        if ( decodeURIComponent(oldHash.substring(1)) != decodeURIComponent(newHash) ){
          window.location.hash = newHash; //Will trig a new call of onHashChange
        }
        else {
            if (this.dontCallHashChange){
                this.dontCallHashChange = false;
                return;
            }
            //Fire the events added with Url.onHashchange
            this.hashchange = this.hashchange || [];
            for (var i=0; i<this.hashchange.length; i++ )
                this.hashchange[i]( event );
        }
    }

    /******************************************
    //Extend window.Url with the new methods
    ******************************************/
    $.extend( window.Url, {
        _correctSearchOrHash: _correctSearchOrHash,
        adjustUrl           : adjustUrl,
        onHashchange        : onHashchange,
        hashString          : hashString,
        parseHash           : parseHash,
        updateHash          : updateHash,
        updateHashParam     : updateHashParam,
        validateValue       : validateValue,
        _parseObject        : _parseObject,
        parseAll            : parseAll,
        onHashChange        : onHashChange
    });

    //Add the 'global' hashchange-event-methods
    window.addEventListener("hashchange", $.proxy( onHashChange, window.Url ), false);



    /******************************************
    Initialize/ready 
    *******************************************/
    $(function() { 
        window.Url.adjustUrl();
    }); 
    //******************************************



}(jQuery, this, document));

/******************************************
Variables in window.location making up the full url
    
var newURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search + window.location.hash;

window.location.protocol
window.location.host
window.location.pathname
window.location.search 
window.location.hash 

******************************************/
