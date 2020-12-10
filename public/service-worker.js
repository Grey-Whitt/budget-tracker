//the prefix of our website
const APP_PREFIX = 'BudgetTracker-';
//the websites version
const VERSION = 'version_01';
//the name of the cache
const CACHE_NAME = APP_PREFIX + VERSION;

//these are the files that will be cached for offline use
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./js/idb.js"
]

// we use self here because service workers run before the window object is created
self.addEventListener('install', function (event) {
    //tell the browser to wait until the work is complete before terminating the service worker
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

//this is used to clear old data from the cache
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

//listen for a fetch - if the requested file is cached return it, else get it from the server
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            return request || fetch(e.request)
        })
    )
})