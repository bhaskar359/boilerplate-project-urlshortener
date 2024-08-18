require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const url = require('url');
const dns = require('dns');


app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = [];
let urlCount = 1;

// Function to check if the URL is valid
function isValidUrl(userUrl) {
  const parsedUrl = url.parse(userUrl);
  return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
}

// POST endpoint to shorten the URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(url.parse(originalUrl).hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = urlCount++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
      return res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl, 10);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (urlEntry) {
    return res.redirect(urlEntry.original_url);
  } else {
    return res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
