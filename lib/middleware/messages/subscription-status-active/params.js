'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('origin=subscriptionStatusActive', { body }, req);
    let error;

    helpers.request.setUserId(req, body.northstarId);
    if (!req.userId) {
      error = new UnprocessibleEntityError('Missing required northstarId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setPlatform(req, body.platform);

    // Set subscriptionStatusActive template properties
    const template = helpers.template.getSubscriptionStatusActive();

    logger.debug('template', template);
    helpers.request.setOutboundMessageTemplate(req, template.name);
    helpers.request.setOutboundMessageText(req, template.text);

    return next();
  };
};