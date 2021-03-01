const winston = require('winston');

require('winston-daily-rotate-file');

const myCustomLevels = {
  colors: {
    info: 'blue',
    http: 'green',
    warn: 'yellow',
    error: 'red'
  }
};

winston.addColors(myCustomLevels.colors);

const apiServerTransport = new winston.transports.DailyRotateFile({
  dirname: './logs/api',
  filename: 'api-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  createSymlink : true
});

const websocketServerTransport = new winston.transports.DailyRotateFile({
  dirname: './logs/ws',
  filename: 'ws-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  createSymlink : true
});
 
winston.createLogger({
    format:winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.colorize(),
    )
});

winston.loggers.add('apiServer', {
  format: winston.format.combine(
    winston.format.label({ label: 'apiServer' }),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.colorize(),    
  ),
  transports: [
    apiServerTransport
  ]
});

winston.loggers.add('websocketServer', {
  format: winston.format.combine(
    winston.format.label({ label: 'websocketServer' }),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.colorize(),    
    winston.format.ms()
  ),
  transports: [
    websocketServerTransport
  ]
});

const apiServerLogger = winston.loggers.get('apiServer');
const wsServerLogger = winston.loggers.get('websocketServer');
   
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
    apiServerLogger.add(new winston.transports.Console({
      level: 'debug',
      format: winston.format.simple(),
    }));
    wsServerLogger.add(new winston.transports.Console({
      level: 'debug',
      format: winston.format.simple(),
    }));    
}

apiServerLogger.stream = { 
    write: function(message, encoding){ 
      // use message.trim() to remove empty line between logged lines
      // https://stackoverflow.com/a/28824464/3109731
      apiServerLogger.http(message.trim()); 
    } 
}; 

apiServerLogger.err = (err, description = '') => {
  if( err && err.name && err.message && err.stack){
    // logger.error(description + ' ' + err.name + ': ' + err.message)
    apiServerLogger.error(description + ' ' + err.stack)
  }else{
    apiServerLogger.error(description + ' ' + err)    
  }
}

wsServerLogger.err = (err, description = '') => {
  if( err && err.name && err.message && err.stack){
    // logger.error(description + ' ' + err.name + ': ' + err.message)
    wsServerLogger.error(description + ' ' + err.stack)
  }else{
    wsServerLogger.error(description + ' ' + err)    
  }
}

module.exports = {apiServerLogger, wsServerLogger};
