// create express app
const express = require('express');
const app = express();

// enable cors
const cors = require('cors');
app.use(cors());

// root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to QuickLink!');
});

// short url endpoint
app.get('/api/shorturl', (req, res) => {
  
    // get url from query
    const url = req.query.url;

    // if no url, return error
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // validate url
    const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/;
    if (!urlRegex.test(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // generate short url
    const shortUrl = Math.random().toString(36).substring(2, 8);

    // map short url to original url
    app.locals.urls = app.locals.urls || {};
    app.locals.urls[shortUrl] = url;

    // return json response with both urls
    res.json({
        original_url: url,
        short_url: shortUrl
    });
});

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