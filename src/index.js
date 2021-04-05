var argv = require('minimist')(process.argv.slice(2));
var app = require('./app');

switch ( argv.cmd ) {
case 'fetch-locations':
  app('cmd.fetch-locations').call();
  break;
case 'analysis':
  app('cmd.analysis').call();
  break;
}
