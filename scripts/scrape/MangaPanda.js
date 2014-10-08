var network = require("../MangaRequest");

function MangaPanda()
{
    this.baseUrl = 'http://www.mangapanda.com';
}

MangaPanda.prototype = {
    
    directory: function()
    {
        
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

function buildError( name, message )
{
    var error = new Error( message );
    error.name = name;
    return error;
}