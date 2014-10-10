var network = require("../MangaRequest");

function MangaPanda()
{
    this.baseUrl = 'http://www.mangapanda.com';
}

MangaPanda.prototype = {
    
    directory: function( callback )
    {
        var networkOptions = {
            url: this.baseUrl + '/alphabetical',
            mangaName: 'directory'
        };
        
        network.request({
            options: networkOptions,
            callback: function( err, DOM )
            {
                if( err )
                {
                    callback( err, null );
                    return;
                }
                
                var $ = DOM;
                var directory = [];
                
                //Returns link with prepended directories and top level domains - /369/ziggy-ziggy.html
                $('.series_col ul a').each(function(){
                    var mangaName = $(this).attr("href");
                    mangaName = mangaName.replace(/\/?[0-9]*\//gi,'').replace(/.html/gi,'');
                    directory.push(mangaName);
                });
                callback( null, directory );
            }
        });
    },
    
    mangaInfo: function( args, callback )
    {
        /*
            title
            description
            coverUrl
            release
            artist
            author
            genres []
            scanOrigin
            numOfChapters
            status
            chapters [ number, title, pages [empty] ]
        */
        var mangaName = args.mangaName;
        var requestUrl = this.baseUrl + '/' + mangaName;
        var networkOptions = {
            url: requestUrl,
            mangaName: mangaName
        }
        
        network.request({
            options: networkOptions,
            callback: function( err, DOM ){
                
                var $ = DOM;
            
                var title = $('.aname').text();
                var description = $('#readmangasum p').text();
                var coverUrl = $('#mangaimg img').attr('src');
                var release = $('#mangaproperties table tr').eq(2).children('td').eq(1).text();
                var artist = $('#mangaproperties table tr').eq(5).children('td').eq(1).text();
                var author = $('#mangaproperties table tr').eq(4).children('td').eq(1).text();
                var genres = [];
                var scanOrigin = "MangaPanda";
                var numOfChapters = $('#latestchapters ul li a').eq(0).text().replace(title,"").trim();
                var status = $('#mangaproperties table tr').eq(3).children('td').eq(1).text();
                var chapters = [];
                
                $('#mangaproperties table tr').eq(7).children('td').eq(1).children('a').each(function(){
                    var genre = $(this).children('span').text();
                    genres.push(genre);
                });
                
                $('#listing tr').each(function( index, element ){
                    if( index === 0 )
                    {
                        return;
                    }
                    //Returns date chapter number and title - 'Naruto 1 : All you have!! 07/23/2014 (tons of spacing)
                    var rawTitle = $(this).text();
                    rawTitle = rawTitle.trim();
                    rawTitle = rawTitle.replace(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/gi,'').trim();
                    
                    var number = rawTitle.match(/[0-9]+/)[0];
                    var chapterTitle = rawTitle.replace(title + ' ' + number + ' : ','');
                    chapters.push({ number: number, title: chapterTitle, pages: [] });
                });
                
                var mangaObject = {
                    title: title,
                    description: description,
                    coverUrl: coverUrl,
                    release: release,
                    artist: artist,
                    author: author,
                    genres: genres,
                    scanOrigin: scanOrigin,
                    numOfChapters: numOfChapters,
                    status: status,
                    chapers: chapters
                };
                
                callback( null, mangaObject );
            }
        });
        
    },
    
    chapter: function()
    {
        
    },
    
    series: function()
    {
        
    }
}



function buildError( name, message )
{
    var error = new Error( message );
    error.name = name;
    return error;
}

module.exports = MangaPanda;