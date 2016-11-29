/****************************************************************************
    url.js-extensions.js, 

    (c) 2016, FCOO

    https://github.com/FCOO/url.js-extensions
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    //Using html5-history-api as polyfill for IE9
    var location = window.history.location || window.location;

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
    updateSearchAndHash
    *******************************************/
    function updateSearchAndHash( searchStr, hashStr, push, triggerPopState ){
        searchStr = this._correctSearchOrHash( searchStr, '?' ); 
        hashStr   = this._correctSearchOrHash( hashStr, '#' );
        var newUrl = //window.location.pathname + 
                     window.location.protocol + "//" + window.location.host + (window.location.host ? "/" : "") + window.location.pathname +
                        (searchStr ? '?' + encodeURI(searchStr) : '') + 
                        (hashStr  ? '#' + encodeURI(hashStr)  : '');

        //If the search is unchanged => only change the hash
        if (this._correctSearchOrHash(window.location.search, '?') == searchStr){
            window.location.hash = hashStr;            
//            return this;
        }        
        else 
            this._updateAll( newUrl, push, triggerPopState );          
        return newUrl;
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
        return this.updateSearchAndHash( 
                   window.location.search,
                   window.location.hash
               );
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
    updateHashParam
    Same as updateSearchParam but for the hash
    *******************************************/
    function updateHashParam(hashParam, value, push, triggerPopState){
        var hashParsed = this.parseHash();
        if (value === undefined){
            delete hashParsed[hashParam];
        }
        else {
            if (hashParsed[hashParam] === value)
                return this;
            hashParsed[hashParam] = value;
        }
        return this.updateSearchAndHash( 
                    window.location.search, 
                    this.stringify(hashParsed), 
                    push, triggerPopState ); 
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
    function onHashChange(){
        this.adjustUrl();
    }

    //Extend window.Url with the new methods
    $.extend( window.Url, {
        updateSearchAndHash : updateSearchAndHash,
        _correctSearchOrHash: _correctSearchOrHash,
        adjustUrl           : adjustUrl,
        hashString          : hashString,
        parseHash           : parseHash,
        updateHashParam     : updateHashParam,
        validateValue       : validateValue,
        _parseObject        : _parseObject,
        parseAll            : parseAll,
        onHashChange        : onHashChange
    });


    $(window).on( 'hashchange', $.proxy( onHashChange, window.Url ) );



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
