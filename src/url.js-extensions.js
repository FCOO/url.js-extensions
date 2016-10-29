/****************************************************************************
    url.js-extensions.js, 

    (c) 2016, FCOO

    https://github.com/FCOO/url.js-extensions
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";
    
    var ns = window.Url; 

    /******************************************
    correctSearchOrHash
    Check and correct search or hash = ID_VALUE[&ID_VALUE]
        ID_VALUE = 
            ID or
            ID=VALUE or
            ID=VALUE,VALUE2,...,VALUEN
        VALUE contains only a-z 0-9 - _ SPACE
        ID contains only a-z 0-9 - _
    *******************************************/
    function correctSearchOrHash( str, preChar ){
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
        preChar = preChar || '#';
        var strList,
            result = '',
            valueRegEx = new RegExp(/[\w\-_. ]+/),
            idRegEx = new RegExp(/[\w\-_]+/),
            idValues, id, values, value, oneValueOk, i, j;

        //Convert to char
        str = str.replace(/%3D/g, "=");
        str = str.replace(/%2C/g, ",");
        str = str.replace(/%3F/g, "?");
        str = str.replace(/%23/g, "#");

        //Remove pre-#
        while (str.length && (str.charAt(0) == preChar) )
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
                        if ( value && (valueRegEx.exec(value) == value) )
                            oneValueOk = true;
                        else
                            valueList[j] = undefined;
                    }
                }
                if ( oneValueOk ){
                    result += (result ? '&' : '') + id;
                    var firstValue = true;
                    for (j=0; j<valueList.length; j++ ){
                        value = valueList[j];
                        if (value !== undefined){
                            result += (firstValue ? '=' : ',') + (value == 'undefined' ? 'false' : value);
                            firstValue = false;
                        }
                    }
                }
            } //end of correct id
        }
        return result;
    }


    /******************************************
    adjustUrl
    Check and correct the url
    *******************************************/
    function adjustUrl(){
        //Update search string
        var newSearchObj = ns.parseQuery( correctSearchOrHash( window.location.search, '?' ) );
        ns.removeQuery(/*push, trigger*/);
        $.each( newSearchObj, function( param, value){
            ns.updateSearchParam(param, value/*, push, triggerPopState*/);
        });

        //Update hash-tags
        var newHash = correctSearchOrHash( window.location.hash, '#' );
        ns.removeHash(/*push, trigger*/);
        ns.hash( newHash );

        return ns;
    }

    
    /******************************************
    parseHash
    Same as parseQuery but for the hash
    *******************************************/
    function parseHash(){
        return ns.parseQuery( ns.hash() );    
    }

    /******************************************
    updateHashParam
    Same as updateSearchParam but for the hash
    *******************************************/
    function updateHashParam(hashParam, value, triggerPopState){
        var hashParsed = this.parseHash();
        if (value === undefined){
            delete hashParsed[hashParam];
        }
        else {
            if (hashParsed[hashParam] === value){
                return ns;
            }
            hashParsed[hashParam] = value;
        }
        this.hash (this.stringify(hashParsed), triggerPopState);
        return ns;
    }


    /******************************************
    validateValue
    Validate value using validator
    validator = regExp | function( value ) | array of validator
    *******************************************/
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
        }

        var regExp = new RegExp(validator),
            execResult = regExp.exec(value); 
        return !!(execResult && (execResult.length == 1) && (execResult[0] == value));
    }


    /******************************************
    parseAll( validatorObj, defaultObj, options )
    Parse the combined query-string and hash-tags
    Returns a object with `id: value` for both query-string and hash-tags

    validatorObj: object with {id: validator,..}. Failed values are removed 
    defaultObj  : object with {id: value}. Values to be used if `id` is missing or fails validation 
    options: {
        convertBoolean: Boolean (default = true ) If true all values == "true" or "false" are converted into Boolean
        convertNumber : Boolean (default = true ) If true all values representing a number is converted to float
        queryOverHash : Boolean (default = true ) If true and the same id is given in both query-string and hash-tag the value from query-string is returned. 
                                                  If false the value from hash-tag is returned
        updateUrl     : Boolean (default = true ) If true failed {id=value} are removed and any defaultObj {id:value} added to the url
    }

    *******************************************/
    function parseAll( validatorObj, defaultObj, options ){
        validatorObj = validatorObj || {}; 
        defaultObj = defaultObj || {}; 
        options = $.extend( {}, options, { 
            convertBoolean: true, 
            convertNumber : true, 
            queryOverHash : true, 
            updateUrl     : true 
        }); 
        
        var queryObj = this.parseQuery(),
            hashObj = this.parseHash(),
            _this = this;

        function updateObj( obj ){
            $.each( obj, function( id, value ){
                //Validate value
                if ( !_this.validateValue( value, validatorObj[id] ) )
                  value = undefined; 

                //Convert "true" and false" to Boolean
                if ( options.convertBoolean && ( (value == 'true') || (value == 'false') ) )
                  value = (value == 'true');
                
                //Convert String to Float
                if (options.convertNumber && _this.validateValue( value, '_number') ){
                    value = parseFloat( value );
                }
                obj[id] = value;
            });
        }

        updateObj( queryObj );
        updateObj( hashObj );
        
        //Update url
        if (options.updateUrl){
            var searchStr = this.stringify(queryObj),
                hashStr = this.stringify(hashObj);
            this._updateAll( 
                window.location.pathname + 
                (searchStr ? '?'+searchStr : '') + 
                (hashStr ? '#'+hashStr : '')
            );          
        }

        var result = $.extend( options.queryOverHash ? hashObj  : queryObj, 
                               options.queryOverHash ? queryObj : hashObj   ); 
        
        //Insert default values
        $.each( defaultObj, function( id, value ){
            if (result[id] === undefined)
              result[id] = value;
        });
        return result; 
    }

    //Extend window.Url with the new methods
    $.extend( ns, {
        adjustUrl      : adjustUrl,
        parseHash      : parseHash,
        updateHashParam: updateHashParam,
        validateValue  : validateValue,
        parseAll       : parseAll
    });

   

    /******************************************
    Initialize/ready 
    *******************************************/
    $(function() { 

    
    }); //End of initialize/ready
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

Alternative way of getting parts of the url
var parser = document.createElement('a');
parser.href = "http://example.com:3000/pathname/?search=test#hash";

parser.protocol; // => "http:"
parser.hostname; // => "example.com"
parser.port;     // => "3000"
parser.pathname; // => "/pathname/"
parser.search;   // => "?search=test"
parser.hash;     // => "#hash"
parser.host;     // => "example.com:3000"

******************************************/
