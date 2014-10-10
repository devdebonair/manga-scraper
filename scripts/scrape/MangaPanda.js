var network = require("../MangaRequest");
var Queue = require("queue");

var MangaPanda = function()
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
        var mangaName = args.mangaName;
        var requestUrl = this.baseUrl + '/' + mangaName;
        var networkOptions = {
            url: requestUrl,
            mangaName: mangaName
        };
        
        network.request({
            options: networkOptions,
            callback: function( err, DOM )
            {
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
                    chapters: chapters
                };
                
                callback( null, mangaObject );
            }
        });
        
    },
    
    chapter: function( args, callback )
    {
        var mangaName = args.mangaName;
        var chapterNumber = args.chapterNumber;
        
        var networkOptions = {
            url: this.baseUrl + '/' + mangaName + '/' + chapterNumber,
            mangaName: mangaName
        };
        
        network.request({
            options: networkOptions,
            callback: function( err, DOM )
            {
                if(err)
                {
                    callback( err, null );
                }
                
                //Grab first 2 pages, compare the difference, and infer the rest of pages
                var $ = DOM;
                var pageOne = $('#img').attr('src');
                
                //Second page is within a script
                var pageTwo = $('head').html()
                                        .match(/document\['pu'\]\s=\s'http.*/)[0]
                                        .replace('document[\'pu\'] = ','');
                                        
                var regexPageLinkNum = /[0-9]+\.(jpg|png|jpeg)/;
                var chapterBaseUrl = pageOne.replace(pageOne.match(regexPageLinkNum)[0],'');
                var topLevelDomain = pageOne.match(/\.(jpg|png|jpeg)/)[0];
                
                var pageOneNum = parseInt(pageOne.match(regexPageLinkNum)[0].replace(/\.(jpg|png|jpeg)/,''));
                var pageTwoNum = parseInt(pageTwo.match(regexPageLinkNum)[0].replace(/\.(jpg|png|jpeg)/,''));
                var diffToInfer = pageTwoNum - pageOneNum;
                var numOfPages = $('#pageMenu').children('option').length;
                
                var chapter = [];
                
                chapter.push({ number: 1, image: pageOne });
                
                var currentChapterDiff = diffToInfer;
                for(var i = 2; i <= numOfPages; i++)
                {
                    var page = {};
                    page.number = i;
                    
                    var image = chapterBaseUrl + (pageOneNum + currentChapterDiff) + topLevelDomain;
                    page.image = image;
                    chapter.push(page);
                    currentChapterDiff += diffToInfer;
                }
                callback(null, chapter);
            }
        });
    },
    
    series: function( args, callback )
    {
        var mangaName = args.mangaName;
        var queue = new Queue({ concurrency: 5, timeout: 3000 });
        var manga = null;
        
        var mangapanda = this;
                    
        this.mangaInfo({ mangaName: mangaName }, function( err, info ){
            if(err)
            {
                callback(err, null);
                return;
            }
            
            var manga = info;
            manga.chapters.forEach( function( element ){
                queue.push(function(){
                    
                    mangapanda.chapter({ mangaName: mangaName, chapterNumber: element.number },
                        
                        function( err, pages ){
                            if(err)
                            {
                                callback(err, null);
                                return;
                            }
                            element.pages = pages;
                        }
                    );
                });
            });

            queue.start();
            queue.on('end', function(){
                callback(null, manga);
            });
        });
    }
};



function buildError( name, message )
{
    var error = new Error( message );
    error.name = name;
    return error;
}

module.exports = MangaPanda;