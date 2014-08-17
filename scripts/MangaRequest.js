var request = require('request');
var cheerio = require('cheerio');
var xmlParser = require("xml2js").parseString;

exports.constructor = function(){

};

exports.request = function( args ){

    if ( args.hasOwnProperty('options') )
        request( args.options, 
            function( err, resp, body ){
                helper_request( err, resp, body, 
                    { mangaName: args.mangaName, 
                        url: args.options.url, 
                        callback: args.callback } 
            ); 
        });
    else
        request( args.url, function( err, resp, body ){
            helper_request( err, resp, body, args );  
        }); //End of Request
};

function helper_request( err, resp, body, args ){

    if ( !err && typeof resp !== 'undefined' && resp.statusCode === 200 )
        {
            var content_type;
            
            if ( args.hasOwnProperty('responseType') )
            {
                content_type = args.responseType;    
            }
            
            content_type = resp['headers']['content-type'];
            
            if ( content_type.toLowerCase() === 'application/json' )
                args.callback( null, body );
                
            if ( content_type.toLowerCase() === 'text/html; charset=utf-8')   
            {
                var DOM = cheerio.load( body );
                args.callback( null, DOM );
            }
            
            if ( content_type.toLowerCase() === 'application/xml')
            {
                xmlParser( body, function( err, result ){
                    
                    args.callback( JSON.stringify( null, result ) );
                });
            }
        
        }

        else
        {
            var respCode;
            
            if ( typeof resp === 'undefined')
                respCode = null;
            else
                respCode = resp.statusCode;
                
            var error = new Error();
            error.name = 'ConnectionError'
            error.message = 'Could not connect to ' + args.url + '\n' +
                                'Response Code:\t' + respCode + '\n' +
                                'Manga:\t' + args.mangaName;
            args.callback( err, null );
        }
}

