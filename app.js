// create express app
const express = require('express');
const app = express();

// enable cors
const cors = require('cors');
app.use(cors());

// middleware to parse JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// import required modules to validate URLs
const dns = require('dns');
const urlParser = require('url');
const { error } = require('console');

// root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to QuickLink!');
});

// short url endpoint
app.post('/api/shorturl', (req, res) => {
  
    // get url from query
    const { url } = req.body;

    // if no url, return error
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // validate url format
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlRegex.test(url)) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    // parse url to get hostname
    const hostname = urlParser.parse(url).hostname;

    // validate url hostname
    dns.lookup(hostname, (err) => {
        if(err) return res.status(400).json({ error: 'Invalid URL' });

        // generate short url
        const shortUrl = generateShortUrl();

        // map short url to original url
        app.locals.urls = app.locals.urls || {};
        app.locals.urls[shortUrl] = url;

        // return json response with both urls
        res.json({
            original_url: url,
            short_url: shortUrl
        });
    });
});

// generate short url
function generateShortUrl() {

    let shortUrl;
    do{
        shortUrl = Math.floor(Math.random() * 1000000).toString();
    } while (app.locals.urls && app.locals.urls[shortUrl]);

    return shortUrl;
}

// redirect endpoint
app.get('/api/shorturl/:shortUrl', (req, res) => {
    // get short url from params
    const shortUrl = req.params.shortUrl; 

    // if short url not found, return error
    if (!app.locals.urls || !app.locals.urls[shortUrl]) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    // redirect to original url
    const originalUrl = app.locals.urls[shortUrl];
    res.redirect(originalUrl);
});

// export app
module.exports = app;