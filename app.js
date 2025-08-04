// create express app
const express = require("express");
const app = express();

// enable cors
const cors = require("cors");
app.use(cors());

// middleware to parse JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// import required modules to validate URLs
const dns = require("dns");
const urlParser = require("url");
const { error } = require("console");

// root endpoint
app.get("/", (req, res) => {
    res.send("Welcome to QuickLink!");
});

// short url endpoint
app.post("/api/shorturl", (req, res) => {
    console.log("Received request to create short URL");

    // get url from query
    const { url } = req.body;
    console.log(`Received URL: ${url}`);

    // if no url, return error
    if (!url) console.log("No URL provided");
    if (!url) return res.status(400).json({ error: "invalid url" });

    try {
        // parse url
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (e) {
            console.log("Invalid URL format");
            return res.status(400).json({ error: "invalid url" });
        }
        console.log(`Parsed URL: ${parsedUrl}`);

        // Validate protocol
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            console.log("Unsupported protocol");
            return res.status(400).json({ error: "invalid url" });
        }

        // get hostname
        const hostname = parsedUrl.hostname;
        console.log(`Parsed hostname: ${hostname}`);

        if (!hostname) console.log("No hostname found in URL");
        if (!hostname) return res.status(400).json({ error: "invalid url" });

        // validate url hostname
        console.log("About to perform DNS lookup");
        dns.lookup(hostname, (err) => {
            if (err) console.log(`DNS lookup error: ${err.message}`);
            if (err) return res.status(400).json({ error: "invalid url" });

            // generate short url
            const shortUrl = generateShortUrl();

            // map short url to original url
            app.locals.urls = app.locals.urls || {};
            app.locals.urls[shortUrl] = url;

            console.log(`Short URL generated: ${shortUrl} --> ${url}`);

            // return json response with both urls
            res.json({
                original_url: url,
                short_url: shortUrl,
            });
        });
    } catch (e) {
        console.log("Catch block triggered:", e.message);
        return res.status(400).json({ error: "invalid url" });
    }
});

// generate short url
function generateShortUrl() {
    let shortUrl;
    do {
        shortUrl = Math.floor(Math.random() * 1000000).toString();
    } while (app.locals.urls && app.locals.urls[shortUrl]);

    return shortUrl;
}

// redirect endpoint
app.get("/api/shorturl/:shortUrl", (req, res) => {
    // get short url from params
    const shortUrl = req.params.shortUrl;

    // if short url not found, return error
    if (!app.locals.urls || !app.locals.urls[shortUrl]) {
        return res.status(404).json({ error: "Short URL not found" });
    }

    // redirect to original url
    const originalUrl = app.locals.urls[shortUrl];
    res.redirect(originalUrl);
});

// export app
module.exports = app;
