var network = require("../MangaRequest");

function MangaPanda()
{
    this.baseUrl = 'http://www.mangapanda.com';
}

MangaPanda.prototype = {
    
    directory: function()
    {
        var networkOptions = {
            url: this.baseUrl + '/alphabetical',
            manga: 'directory'
        };
        
        network.request({
            options: networkOptions,
            callback: callback_directory
        });
        
        
    },
    
    mangaInfo: function()
    {
        
    },
    
    chapter: function()
    {
        
    },
    
    series: function()
    {
        
    }
}


function callback_directory( err, DOM )
{
    if( err )
    {
        return err;
    }
    
    var $ = DOM;
    var directory = [];
    
    $('.series_col ul a').each(function(){
        var mangaName = $(this).attr("href");
        mangaName = mangaName.replace(/\/?[0-9]*\//gi,'').replace(/.html/gi,'');
        console.log(mangaName);
    });
}

function buildError( name, message )
{
    var error = new Error( message );
    error.name = name;
    return error;
}

module.exports = MangaPanda;