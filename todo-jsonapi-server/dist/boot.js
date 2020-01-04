'use strict';

const CWD = process.cwd();
const { env: { PORT } } = process;
const { Application, config, database } = require('./bundle');

module.exports = new Application(
  Object.assign(config, {
    database,
    path: CWD,
    port: PORT
  })
).catch(err => {
  process.send({
    error: err ? err.stack : void 0,
    message: 'error'
  });
});
