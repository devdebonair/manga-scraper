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
            manga: 'directory'
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
                
                $('.series_col ul a').each(function(){
                    var mangaName = $(this).attr("href");
                    mangaName = mangaName.replace(/\/?[0-9]*\//gi,'').replace(/.html/gi,'');
                    directory.push(mangaName);
                });
                callback( null, directory );
            }
        });
    },
    
    mangaInfo: function( args )
    {
        var mangaName = args.mangaName;
        
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