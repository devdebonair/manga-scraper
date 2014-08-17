var Queue = require('queue');
var fs = require('fs');
var oop = require('oop-module');
var KissManga = oop.class('./KissMangaNew');
var MangaEden = oop.class('./scripts/scrape/MangaEden');

var kissManga = new KissManga();
var mangaEden = new MangaEden();

kissManga.directory( function( err, data ){
    
    if(err)
    {
        console.log(err);
        return;
    }
    
    var directory = data;
    var queue = new Queue( { concurrency: 5, timeout: 4000 } );
    var series = [];
    var fails = [];
    
    directory.forEach( function( element, i ){
      
        queue.push( function(){
            kissManga.series( { mangaName: element }, function( err, data ){
                if(!err)
                    series.push( { i: data } );
                else
                {
                    fails.push( { manga: element, error: err } );
                }
                
            });
        });
    });
    
    queue.start();
    
    queue.on('end', function(){
        fs.writeFile( './manga.txt', series, function(err){
            if(err)
            {
                console.log(err);
            }
            
            else
            {
                console.log('File Write Successful!');
                console.log('---------------------------------------------------');
            }
                
        });
        
        fs.writeFile( './fails.txt', fails, function(err){
            if(err)
            {
                console.log(err);
            }
            
            else
            {
                console.log('File Write Successful!');
                console.log('---------------------------------------------------');
            }
                
        });
    });
});