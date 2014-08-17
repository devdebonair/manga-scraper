var oop = require('oop-module');
var KissManga = oop.class('./scripts/scrape/KissManga');
var MangaEden = oop.class('./scripts/scrape/MangaEden');

var kissManga = new KissManga();
var mangaEden = new MangaEden();

// kissManga.mangaInfo( { mangaName: '–-and-–', chapterNumber: 687 }, function( err, info ){
    
//     if( err )
//         console.log( err );
//     else
//         console.log( info );
// });


mangaEden.series( { mangaName: 'limit' }, function( err, data ){
    if ( err )
        console.log( err );
    else
        console.log( data );
});
