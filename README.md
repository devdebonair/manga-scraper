Debonair-Manga-Scraper
=========

Debonair-Manga-Scraper is web crawler that scrapes various manga from different sites.

Supported Manga Sites
=====================

- KissManga
- MangaEden 

Markdown is a lightweight markup language based on the formatting conventions that people naturally use in email.  As [John Gruber] writes on the [Markdown site] [1]:

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable 
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

This text you see here is *actually* written in Markdown! To get a feel for Markdown's syntax, type some text into the left window and watch the results in the right.  

Version
----

0.0.1

Tech
-----------

Manga-Scraper uses a number of open source projects to work properly:
- [Cheerio] - Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
- [Queue] - asynchronous function queue with adjustable concurrency
- [Oop-Module] - Node.js library to transform modules into classes
- [Request] - Simplified HTTP request client.
- [xml2js] - Simple XML to JavaScript object converter.



Installation
--------------

```sh
npm install debonair-manga-scraper
```


API
===

Initialize
```javascript
//Replace Manga with desired manga site [CamelCasing]
var KissManga = require("debonair-manga-scraper").KissManga;
var scraper = new KissManga();

//Use desired method from API
var scraper.info( {mangaName: 'naruto'}, function( err, data ){
   console.log( data );
});
```


###mangaInfo
returns general information about manga without chapter pages
```javascript
scraper.mangaInfo( {mangaName: name_of_manga}, callback(err ,mangaObject) );
```
#####Arguments
- object
    - must contain ```{mangaName} //casing and naming matters!```
- callback
    - returns ```callback(err,data)```
- output
    - title
    - description
    - release
    - author
    - genres
    - scanOrigin
    - numOfChapters
    - status
    - chapters




###directory
returns the directory of manga site
```javascript
scraper.directory( callback(err , arrayOfStrings) );
```
#####Arguments
- string
- callback
    - returns ```callback(err,data)```
- output
    - array of [Strings]






###chapter
returns general information about manga
```javascript
scraper.mangaInfo( {mangaName: name_of_manga, chapterNumber: chapter_number},    callback(err ,arrayOfObjects) );
```
#####Arguments
- object
    - must contain ```{mangaName,chapterNumber} //casing and naming matters!```
- callback
    - returns ```callback(err,data)```
- output
    - number
    - image





###series
returns manga in its entirety - "Including pages and images for each chapter"
```javascript
scraper.series( {mangaName: name_of_manga}, callback(err ,mangaObject) );
```
#####Arguments
- object
    - must contain ```{mangaName} //casing and naming matters!```
- callback
    - returns ```callback(err,data)```
- output
    - title
    - description
    - release
    - author
    - genres
    - scanOrigin
    - numOfChapters
    - status
    - chapters [refer to chapter to see what object contains]



Example
=======


####mangaInfo
```javascript
var KissMangaScraper = require("debonair-manga-scraper").KissManga;
var kissmanga = new KissMangaScraper();

kissmanga.mangaInfo({ mangaName: 'naruto'}, function( err, data ){
    if(err){ console.log(err); }
    console.log(data);
});

/* Returns - shortened from actual output

{ title: 'Naruto',
  description: 'Twelve years before the events at the focus of the series, the nine-tailed demon fox attacked Konohagakure. It was a powerful demon fox; a single swing of one of its nine tails would raise tsunamis and flatten mountains. It raised chaos and slaughtered many people, until the leader of the Leaf Village - the Fourth Hokage - defeated it by sacrificing his own life to seal the demon inside a newly-born child. That child\'s name was Naruto Uzumaki.',
  coverUrl: 'http://www.kissmanga.coverUrl.com/...',
  release: undefined,
  artist: 'Kishimoto Masashi',
  author: 'Kishimoto Masashi',
  genres: 
   [ 'Action',
     'Adventure',
     'Comedy',
     'Drama',
     'Fantasy',
     'Manga',
     'Martial Arts',
     'Shounen' ],
  scanOrigin: 'KissManga',
  numOfChapters: '694',
  status: 'Ongoing',
  chapters: 
   [ { number: 694,
       title: '\nNaruto 694: Naruto and Sasuke',
       pages: [] },
     { number: 693, title: '\nNaruto 693: Once Again...', pages: [] }
*/
```


####chapter
```javascript
var KissMangaScraper = require("debonair-manga-scraper").KissManga;
var kissmanga = new KissMangaScraper();

kissmanga.chapter({ mangaName: 'naruto', chapterNumber: 694 }, 
    
    function( err, data ){
        if(err){ console.log(err); }
        console.log(data);
    }
);

/*  Returns - shortened from actual output
    [ { number: 1, image: 'http://www.kissmanga.image.com/...' },
        { number: 2, image: 'http://www.kissmanga.image.com/...' },
        { number: 3, image: 'http://www.kissmanga.image.com/...' } ]
*/
```



####directory
```javascript
var KissMangaScraper = require("debonair-manga-scraper").KissManga;
var kissmanga = new KissMangaScraper();

kissmanga.directory( function( err, data ){
    if(err){ console.log(err); }
    console.log(data);
});

/*  Returns - shortened from actual output
    [ 'naruto','bleach','one-piece' ]   
    
    //there will be hyphens to sererate spaces
    //will be in abc order
*/
```





####series
```javascript
var KissMangaScraper = require("debonair-manga-scraper").KissManga;
var kissmanga = new KissMangaScraper();

kissmanga.series({ mangaName: 'naruto'}, function( err, data ){
    if(err){ console.log(err); }
    console.log(data);
});

/* Returns - shortened from actual output

{ title: 'Naruto',
  description: 'Twelve years before the events at the focus of the series, the nine-tailed demon fox attacked Konohagakure. It was a powerful demon fox; a single swing of one of its nine tails would raise tsunamis and flatten mountains. It raised chaos and slaughtered many people, until the leader of the Leaf Village - the Fourth Hokage - defeated it by sacrificing his own life to seal the demon inside a newly-born child. That child\'s name was Naruto Uzumaki.',
  coverUrl: 'http://www.kissmanga.coverUrl.com/...',
  release: undefined,
  artist: 'Kishimoto Masashi',
  author: 'Kishimoto Masashi',
  genres: 
   [ 'Action',
     'Adventure',
     'Comedy',
     'Drama',
     'Fantasy',
     'Manga',
     'Martial Arts',
     'Shounen' ],
  scanOrigin: 'KissManga',
  numOfChapters: '694',
  status: 'Ongoing',
  chapters: 
   [ { number: 694,
       title: '\nNaruto 694: Naruto and Sasuke',
       pages: [{ number: 1, image: 'http://www.kissmanga.image.com/...' },
                { number: 2, image: 'http://www.kissmanga.image.com/...' },
                { number: 3, image: 'http://www.kissmanga.image.com/...' }] }
*/
```

License
----

MIT

[cheerio]: https://www.npmjs.org/package/cheerio
[queue]: https://www.npmjs.org/package/queue
[oop-module]: https://www.npmjs.org/package/cheerio
[request]: https://www.npmjs.org/package/queue
[xml2js]: https://www.npmjs.org/package/queue
