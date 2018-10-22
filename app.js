// const fs = require('fs');
// const { PythonShell } = require('python-shell');
const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const chalk = require('chalk');
const webCrawler = require('./crawlre/crawl_init');
const model = require('./controllers/database.controller');
const app = express();
app.use(morgan('tiny'));
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  debug('listening on port http://%s:%s', host, chalk.green(port));
});

// webCrawler.crawlinit();

