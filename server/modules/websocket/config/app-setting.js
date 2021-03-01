const winston = require('winston');
 
const appSettings = {
    winston: {
        logConfig : {
            format: winston.format.json(),
            defaultMeta: { timestamp: new Date, pid: process.pid },
            transports: [
              //
              // - Write to all logs with level `info` and below to `combined.log` 
              // - Write all logs error (and below) to `error.log`.
              //
              new winston.transports.File({ filename: './log/websocketError.log', level: 'error' }),
              new winston.transports.File({ filename: './log/websocketCombined.log' }),
              new winston.transports.File({ filename: './log/websocketIncomingData.log', level: 'debug' }),
            ]
        },
    }
};
 
module.exports = appSettings;