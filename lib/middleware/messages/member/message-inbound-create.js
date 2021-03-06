'use strict';

const helpers = require('../../../helpers');

module.exports = function createInboundMessage() {
  return (req, res, next) => {
    // If this is a retry request, we already loaded the message
    if (req.isARetryRequest() && req.inboundMessage) {
      return next();
    }

    return req.conversation.createMessage('inbound', req.inboundMessageText, null, req)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
