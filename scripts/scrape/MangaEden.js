var oop = require('oop-module');
var network = require('../MangaRequest.js');

var baseUrl = 'http://www.mangaeden.com';
var directory;

var CONCURRENCY = 10;
var TIME_DELAY = 2000;

exports.constructor = constructor;
exports.series = series;
exports.directory = fetchDirectory;
exports.mangaInfo = fetchMangaInfo;
exports.chapter = fetchChapter;




//Public Instance Methods
function constructor(){
    
}

function series( args, callback ){
    
    var mangaName = args.mangaName;
    
    checkDirectory( function(){
        helper_series( { mangaName: mangaName }, callback );
    });
}




//Public API Methods

function fetchDirectory( callback ){

    if ( !callback )
    {
        var error = buildError(
            'InvalidArguments',
            'Callback must be specified.'
        );
        callback( error, null );
        return;
    }
    
    sendRequest( 
        { url: baseUrl + '/api/list/0', 
            mangaName: 'MangaEden_Directory' }, 
            function( err, data ){
                if ( err )
                {
                    callback( err, null );
                    return;
                }
                
                var rawDirectory = [];
                var newData = JSON.parse( data );
                            
                for ( var key in newData.manga )
                {
                    rawDirectory.push( 
                        newData.manga[ key ]    
                    );
                }
                
               helper_formatDirectory( rawDirectory, 
                    function( err, data ){
                        if ( err )
                        {
                            callback( err, null );
                            return;
                        }
                        callback( null, data );
                    }
                );
    });
}

function fetchMangaInfo( args, callback ){
    
    checkDirectory( 
        function(){
            helper_fetchMangaInfo( args , callback );
        }
    );
}

function fetchChapter( args, callback ){
    
    if ( !callback )
    {
        var error = buildError(
            'InvalidArguments',
            'Callback must be specified.'
        );
        throw error;
    }
    
    var mangaName = args.mangaName || args.manga.title;
    var chapterNumber = args.chapterNumber;

    helper_selectChapter( args, function( chapter ){
        
        console.log( 'Fetching ' + mangaName +
                    ' Chapter ' + chapterNumber + '.'); //Debug
        
        var url = baseUrl + '/api/chapter/' + chapter.edenId;
        var params = { url: url, mangaName: mangaName };
        
        sendRequest( params, function( err, data ){

            if ( err )
            {
                callback( err, null );
            }
            
            var tempChapter = [];
            var parsedData = JSON.parse( data );
            
            parsedData.images.forEach( function( element, i ){
                
                var page = {};
                page.number = element[0]+1;
                page.image = baseUrl + '/img/' + element[1];
                
                tempChapter.push( page );
            });
            
            callback( null, { chapterNumber: chapterNumber,
                        pages: tempChapter }
            );
            
        });
    });
}




//Private Helper Methods

function helper_formatDirectory( rawDirectory, callback ){
    
    if ( !callback )
    {
        var error = buildError(
                    'InvalidArguments',
                    'Callback must me specified.' 
                );
        throw error;
    }
    
    var formattedDirectory = {};
    
    rawDirectory.forEach( function( element, i ){
        
        var alias = element.a;
        var title = element.t;
        var coverUrl = element.im;
        var edenId = element.i;
        var status;
        
        switch ( element.s ){
            
            case 0: status = 'suspended';
                    break;
            case 1: status = 'ongoing';
                    break;
            case 2: status = 'completed';
                    break;
            default: status = 'unknown';
        }
        
        formattedDirectory[ alias ] = {
        
            title: title,
            coverUrl: coverUrl,
            status: status,
            edenId: edenId
        };
        
        directory = formattedDirectory;
    });
        
    callback( null, directory );
}

function helper_fetchMangaInfo( args, callback ){
    
    var manga = {};
    var mangaName = formatMangaName( args.mangaName );
    var requestUrl = baseUrl + 
                        '/api/manga/' + 
                        directory[ mangaName ].edenId;
    if ( !callback )
    {
        var error = buildError(
                    'InvalidArguments',
                    'Callback must me specified.' 
                );
        throw error;
    }
    
    sendRequest(
        { url: requestUrl,
            mangaName: mangaName },
        function( err, data ){
            if ( err )
            {
                callback( err, null );
                return;
            }
            console.log( 'Fetching General Info on "' + 
                            mangaName ); //Debug
                        
            var parsedData = JSON.parse( data );
            
            manga.title = parsedData.title;
            manga.description = parsedData.description;
            
            if ( parsedData.imageURL !== null )
                manga.coverUrl = parsedData.imageURL;
            else
                manga.coverUrl = baseUrl + '/img/' +
                                    parsedData.imageURL;
                                
            manga.release = parsedData.released;
            manga.artist = parsedData.artist;
            manga.author = parsedData.author;
            manga.genres = parsedData.categories;
            manga.scanOrigin = 'MangaEden';
            manga.numOfChapters = parsedData.chapters_len;
            manga.chapters = [];
            
            switch ( parsedData.status ){
                
                case 0: manga.status = 'suspended';
                        break;
                case 1: manga.status = 'ongoing';
                        break;
                case 2: manga.status = 'completed';
                        break;
                default: manga.status = 'unknown';
            }
            
            var parsedChapters = parsedData.chapters;

            parsedChapters.forEach( function( element, i){
                
                var tempChapter = {};
                
                tempChapter.number = element[0];
                tempChapter.title = element[2];
                tempChapter.edenId = element[3];
                tempChapter.pages = [];
                
                manga.chapters.push( tempChapter );
            });
            
            manga.chapters.reverse();
            
            callback( null, manga );
        }
    );
}

function helper_selectChapter( args, callback ){
    
    if ( args.hasOwnProperty('manga') )
    {
        var errorOrChapter = grabChapter( args.manga, 
                                    args.chapterNumber);
        
        //Check if returned object is an error                    
        if ( errorOrChapter.hasOwnProperty('message') )
        {
            callback( errorOrChapter, null );
            return;
        }
        
        callback( errorOrChapter );
    }
         
    else if ( args.hasOwnProperty('mangaName') &&
                args.hasOwnProperty('chapterNumber'))
    {
        fetchMangaInfo( { mangaName: args.mangaName }, 
            function( err, data ){
                if ( err )
                {
                    callback( err, null );
                    return;
                }
        
                //Check if returned object is an error                    
                var errorOrChapter = grabChapter( args.manga, 
                                                    args.chapterNumber);
                if ( errorOrChapter.hasOwnProperty('message') )
                {
                    callback( errorOrChapter, null );
                    return;
                }
                
                callback( errorOrChapter );
            }
        );
    }
    
    else
    {
        var error = buildError( 
            'InvalidArguments', 
            '( manga Object ) or ' + 
            '( mangaName && chapterNumber ) must be specified.' 
        );
        throw error;
    }
}

function helper_series( args, callback ){
    
    var mangaName = args.mangaName;
    var manga;
    
    fetchMangaInfo( { mangaName: mangaName }, function( err, data ){
        
        if ( err )
        {
            callback( err, null );
            return;
        }
        
        manga = data;
        
        var Queue = require('queue');
        
        var queue = new Queue( { 
            concurrency: CONCURRENCY,
            timeout: TIME_DELAY
        });
        
        queue.push( function(){
            
            manga.chapters.forEach( function( element ){
                
                fetchChapter( { 
                    manga: manga,
                    chapterNumber: element.number
                }, function( err, data ){

                    if ( err )
                    {
                        return;
                    }
                    element.pages = data.pages;
                } );
            });
        });
        
        queue.start();
        queue.on( 'end', function(){
            callback( null, manga );
            console.log( 'Manga Loaded!' ); //Debug
        });
    });
}




//Private Utility Methods

function checkDirectory( callback ){
    
    if ( !directory )
    {
        console.log( 'Directory not initialized.' ); //Debug
        console.log( 'Initializing Directory.' ); //Debug
        
        fetchDirectory( callback );
    }
    else
        callback();
}

function formatMangaName( string ){
    
    
    var newString = string.replace( /\s/g, '-' ).toLowerCase();
    
    return newString;
}

function grabChapter( manga, chapterNumber ){
    
    var chapter = null;
    
    manga.chapters.forEach( function( element, i ){
        if ( element.number === chapterNumber )
        {
            chapter = element;
        }
    });
    
    if ( !chapter )
    {
        var error = buildError(
            'NotFound',
            'Chapter ' + chapterNumber + 
            ' is not listed.'
        );
        return error;
    }
    
    return chapter;
}

function buildError( name, message ){
    
    var error = new Error();
    error.name = name;
    error.message = message;
    
    return error;
}

function sendRequest( args, callback ){
    var mangaName = args.mangaName;
    var url = args.url;
    var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36';
    
    var options = {
        url: url,
        headers: {
            'User-Agent': userAgent
        }
    };
    
    network.request({
        options: options,
        mangaName: mangaName,
        callback: callback
    });
}