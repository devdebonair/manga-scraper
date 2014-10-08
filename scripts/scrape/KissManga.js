var network = require('../MangaRequest');
var Queue = require('queue');

var BASE_URL = 'http://kissmanga.com';
var CONCURRENCY = 5;
var TIME_DELAY = 3000;

exports.constructor = constructor;
exports.series = series;
exports.directory = fetchDirectory;
exports.mangaInfo = fetchMangaInfo;
exports.chapter = fetchChapter;




//Public Instance Methods

function constructor(){
    
}

function series( args, callback ){
    
    var manga = {};
    var mangaName = args.mangaName;
    
    console.log('Fetching ' + mangaName); //debug
    
    fetchMangaInfo( { mangaName: mangaName }, function( err, generalInfo ){
            
            if ( !err )
            {
                var queue = new Queue({ 
                    concurrency: CONCURRENCY, 
                    timeout: TIME_DELAY 
                });
                
                manga = generalInfo;
                
                manga.chapters.forEach( function( element ){
                    queue.push( function(){
                        fetchChapter( {
                            mangaName: mangaName,
                            chapterNumber: element.number
                        }, function( err, pages ){
                                if( !err )
                                {
                                    element.pages = pages;
                                }
                                else
                                {
                                    element.pages = null;
                                    return;
                                }
                            }
                        );
                    });
                });
                
                queue.start();
                queue.on('end', function(){
                    callback( null, manga );
                });
            }
            else
            {
                callback( err, null );
            }
    });
}




//Public API Methods

function fetchDirectory( callback ){
    
    helper_directoryPageLinks( function( err, urlList ){

        if( err ){ callback( err, null ); }
        
        else
        {
            helper_directoryScrape( urlList, function( err, directory ){
                if( err ){ callback( err, null ); }
                else{ callback( null, directory ); }
            });
        }
    });
} //debug errors handled

function fetchMangaInfo( args, callback ){
    
    if ( !args.hasOwnProperty('mangaName') )
    {
        var error = buildError( 'InvalidArguments', ('Arguments must have ' +
                                                        'mangaName.' )
        );
        
        callback( error, null );
        return;
    }
    
    var manga = {};
    var mangaName = formatMangaName( args.mangaName );
    var url = BASE_URL + '/manga/' + mangaName + '?confirm=yes';

    sendRequest( { mangaName: mangaName, url: url }, function( err, DOM ){
        
        if ( !err )
        {
            var $ = DOM;
            var title,
                description,
                coverUrl,
                release,
                artist,
                author,
                genres,
                scanOrigin,
                numOfChapters,
                chapters,
                status;
                
            title = $('#leftside a.bigChar').text();
            description = $('span:contains(Summary)').parent().next().text();
            coverUrl = $('#rightside div.barContent img').attr('src');
            artist = $('span:contains(Author)').next().text();
            author = artist;
            
            genres = [];
            $('span:contains(Genres)').parent().find('a').each( function(){
                genres.push( $(this).text() );
            });
            
            scanOrigin = 'KissManga';
            
            var chapterNumberRegex = new RegExp( escapeSpecialCharacters( title ) + '.*\\s(vol.[0-9]+)?(ch.)?([0-9]{1,4})', 'i' );
            
            
            //Check if lastest chapter parse is valid
            if ( chapterNumberRegex.test( $('table.listing a').first().text() ) )
                numOfChapters = $('table.listing a').first().text().match( chapterNumberRegex )[3];
            else
                numOfChapters = null;
                
                
            //Check if status is available    
            if ( /ongoing|completed|suspended/i.test( $('#leftside div.barContent ').html() ) )
                status = $('#leftside div.barContent ').html().match(/ongoing|completed|suspended/i)[0];
            else
                status = null;
                
                
            chapters = [];
            $('table.listing a').each( function(){
                var tempChapter = {};
                
                //Check if chapter number is valid
                if ( chapterNumberRegex.test( $(this).text() ) )
                    tempChapter.number = parseInt($(this).text().match(chapterNumberRegex)[3]);
                else
                    tempChapter.number = null;
                    
                tempChapter.title = $(this).text();
                tempChapter.pages = [];
                chapters.push( tempChapter );
            });
            
            manga.title = title;
            manga.description = description;
            manga.coverUrl = coverUrl;
            manga.release = release;
            manga.artist = artist;
            manga.author = author;
            manga.genres = genres;
            manga.scanOrigin = scanOrigin;
            manga.numOfChapters = numOfChapters;
            manga.status = status;
            manga.chapters = chapters;
            
            callback( null, manga );
        }
        else
        {
            callback( err, null );
        }
    });
} //debug errors handled

function fetchChapter( args, callback ){
    
    if ( !args.hasOwnProperty('mangaName') || !args.hasOwnProperty('chapterNumber'))
    {
        var error = buildError( 'InvalidArguments', ('Arguments must have ' +
                                                        'mangaName & ' + 
                                                            'chapterNumber.') );
        callback( error, null );
        return;
    }
    
    var mangaName = formatMangaName( args.mangaName );
    var chapterNumber = args.chapterNumber;
    
    helper_fetchChapterUrl( { 
        mangaName: mangaName, 
        chapterNumber: chapterNumber }, 
        function( err, chapterUrl ){
            if ( !err )
            {
                helper_fetchChapterPages( {
                    mangaName: mangaName,
                    url: chapterUrl
                }, 
                function( err, pages ){
                    if ( !err )
                    {
                        callback( null, pages );
                    }
                    else
                    {
                        callback( err, null );
                    }
                });
            }
            else
            {
                callback( err, null );
            }
        });
} //debug errors handled





//Helpers

function helper_directoryPageLinks( callback ){
    
    var mangaName = 'KissManga_Directory';
    var url = BASE_URL + '/MangaList';
    
    sendRequest( { mangaName: mangaName, url: url }, function( err, DOM ){

        if ( err )
        {
            callback( err, null );
            return;
        }
        
        var $ = DOM;
        var urlList = [];
        var numOfPages = parseInt( $('ul.pager a').last().attr('page') );
        
        if ( isNaN( numOfPages ) )
        {
            var error = buildError( 
                    'ParseError', 
                    'Could not retrieve number of directory pages.' 
            );
            callback( error, null );
            return;
        }

        for( var i = 1; i <= numOfPages; i++ )
        {
            urlList.push( BASE_URL + '/MangaList?page=' + i );
        }
        
        callback( null, urlList );
    });
} //debug errors handled

function helper_directoryScrape( pages, callback ){
    
    var directory = [];
    var queue = new Queue({ concurrency: 1, timeout: 1000 });
    
    pages.forEach( function( element ){
        
        var mangaName = 'KissManga_Directory';
        var url = element;
        
        queue.push( function(){
            console.log( element ); //Debug
            
            sendRequest({ mangaName: mangaName, url: url },
                function( err, DOM ){
                    
                    if( err ){ callback( err, null ); return; }

                    var $ = DOM;
                    
                    $('table.listing tr').each( function(){
                        
                        var title = $(this).
                                        children().
                                            first().
                                                find('a').
                                                    attr('href');
                                                    
                        if ( title || typeof title !== 'undefined' )
                        {
                            directory.push( title.replace( '/Manga/', "") );
                        }
                    });
                }
            );
        });
    });
    
    queue.start();
    
    queue.on( 'end', function(){
        callback( null, directory );
    });
    
    queue.on( 'error', function( error ){
        callback( error, null );
        queue.end();
    });
} //debug errors handled

function helper_fetchChapterUrl( args, callback ){
    
    var mangaName = args.mangaName;
    var chapterNumber = args.chapterNumber;
    var url = BASE_URL + '/manga/' + 
                    formatMangaName( mangaName ) + '?confirm=yes';
    
    sendRequest( { mangaName: mangaName, url: url }, function( err, DOM ){
        
        if ( !err )
        {
            var $ = DOM;
            var chapterUrl;
            var title = $('#leftside a.bigChar').text();
            
            $('table.listing a').each( function(){
                
                var regexString = escapeSpecialCharacters( title ) + '.*\\s(vol.[0-9]+)?(ch.)?([0-9]{1,4})';
                var regex = new RegExp( regexString, 'i' );
                
                var stringContainingChapterNumber = $(this).text();
                                                            
                if ( regex.test( stringContainingChapterNumber ) )
                {
                    stringContainingChapterNumber = $(this).
                                                        text().
                                                            match( regex )[3];
                }
                
                var comparedChapter = parseInt( stringContainingChapterNumber );                                            
                if ( !isNaN( comparedChapter ) && chapterNumber === comparedChapter )
                {
                    chapterUrl = removeSymbols( BASE_URL + $(this).attr('href') );
                }

            });
            
            if ( !chapterUrl )
            {
                var error = buildError( 
                        'ParseError', 'Could not retrieve chapter number ' + 
                                                                chapterNumber + '.'
                    );
                callback( error, null );
            }
            
            callback( null, chapterUrl );
        }
        else
        {
            callback( err, null );
        }
    });
} //debug errors handled

function helper_fetchChapterPages( args, callback ){
    
    var mangaName = args.mangaName;
    var url = args.url + '?confirm=yes';
    
    sendRequest( { url: url, mangaName: mangaName },
        function( err, DOM ){
            if( !err )
            {
                var $ = DOM;
                
                var regex = /http:\/\/.+\..+\..+(\.jpg|\.jpeg|\.png).*"/gi; 
                var html = $('html').html();
                
                if ( !regex.test( html ) )
                {
                    var error = buildError( 'RegExpError', 'Pages not found.');
                    callback( error, null );
                    return;
                }
                
                var pages = [];
                var linkArray = [];
                var rawLinks = html.match( regex );

                for( var url in rawLinks )
                {
                    linkArray.push( rawLinks[url].replace('"', '') );
                }

                linkArray.forEach( function( element, i ){
                    var tempPage = {};
                    tempPage.number = (i+1);
                    tempPage.image = element;
                    
                    pages.push( tempPage );
                });
                
                callback( null, pages );
            }
            else
            {
                callback( err, null );
            }
        }
    );
} //debug errors handled


//Utility

function formatMangaName( string ){
    
    return escapeSpecialCharacters( string.replace( /\s/g, '-' ).toLowerCase() );
}

function unformatMangaName( string ){
    
    return string.replace( /-/gi, ' ' ).toLowerCase();
}

function removeSymbols( string ){
    
    if ( /[^\x00-\x7F]/g.test( string ) )
        return string.replace( /[^\x00-\x7F]/g, "" );
    else
        return string;
}

function escapeSpecialCharacters( string ){
    
    var regex = [ '.','$','^','{','[','(','|',')',']','}','*','+','?','\\','/' ];
    var newString = '';
    
    for( var i = 0; i < string.length; i++ )
    {
        if ( regex.indexOf( string[i] ) !== -1 )
            newString += '\\' + string[i];
        else
            newString += string[i];
    }
    
    return newString;
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

function buildError( name, message ){
    
    var error = new Error();
    error.name = name;
    error.message = message;
    
    return error;
}