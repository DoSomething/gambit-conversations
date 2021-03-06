'use strict';

require('dotenv').config();

const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const httpMocks = require('node-mocks-http');
const underscore = require('underscore');

const helpers = require('../../../../../../lib/helpers');
const stubs = require('../../../../../helpers/stubs');

chai.should();
chai.use(sinonChai);

// module to be tested
const validateCampaign = require('../../../../../../lib/middleware/messages/member/campaign-validate');

const sandbox = sinon.sandbox.create();

test.beforeEach((t) => {
  sandbox.stub(helpers, 'sendErrorResponse')
    .returns(underscore.noop);
  t.context.req = httpMocks.createRequest();
  t.context.res = httpMocks.createResponse();
});

test.afterEach((t) => {
  sandbox.restore();
  t.context = {};
});

test('validateCampaign should call replies.noCampaign if not request.hasCampaign', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(false);
  sandbox.stub(helpers.replies, 'noCampaign')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.hasCampaign.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.noCampaign.should.have.been.calledWith(t.context.req, t.context.res);
});

test('validateCampaign should call replies.campaignClosed if request.isClosedCampaign', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.request, 'isClosedCampaign')
    .returns(true);
  sandbox.stub(helpers.replies, 'campaignClosed')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.hasCampaign.should.have.been.calledWith(t.context.req);
  helpers.request.isClosedCampaign.should.have.been.calledWith(t.context.req);
  next.should.not.have.been.called;
  helpers.replies.campaignClosed.should.have.been.calledWith(t.context.req, t.context.res);
});

test('validateCampaign should call next if request.hasCampaign and campaign is not closed', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  sandbox.stub(helpers.request, 'hasCampaign')
    .returns(true);
  sandbox.stub(helpers.request, 'isClosedCampaign')
    .returns(false);
  sandbox.stub(helpers.replies, 'campaignClosed')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  helpers.request.hasCampaign.should.have.been.calledWith(t.context.req);
  helpers.request.isClosedCampaign.should.have.been.calledWith(t.context.req);
  next.should.have.been.called;
  helpers.replies.campaignClosed.should.not.have.been.called;
});

test('validateCampaign should call sendErrorResponse if request.hasCampaign throws', async (t) => {
  const next = sinon.stub();
  const middleware = validateCampaign();
  const error = stubs.getError();
  sandbox.stub(helpers.request, 'hasCampaign')
    .throws(error);
  sandbox.stub(helpers.request, 'isClosedCampaign')
    .returns(false);
  sandbox.stub(helpers.replies, 'campaignClosed')
    .returns(underscore.noop);

  // test
  await middleware(t.context.req, t.context.res, next);

  next.should.have.not.been.called;
  helpers.sendErrorResponse.should.have.been.calledWith(t.context.res, error);
});
