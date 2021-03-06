'use strict';

module.exports = {
  clientOptions: {
    baseUri: process.env.FRONT_API_BASEURI || 'https://api2.frontapp.com',
    apiSecret: process.env.FRONT_API_SECRET,
    apiToken: process.env.FRONT_API_TOKEN,
    signatureHeader: 'x-front-signature',
  },
  channels: {
    support: process.env.FRONT_API_SUPPORT_CHANNEL,
  },
  crypto: {
    algorithm: 'sha1',
    encoding: 'base64',
  },
};
