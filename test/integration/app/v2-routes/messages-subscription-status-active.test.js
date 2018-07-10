'use strict';

const test = require('ava');
const chai = require('chai');
const nock = require('nock');


const templatesHelper = require('../../../../lib/helpers/template');
const integrationHelper = require('../../../helpers/integration');
const Message = require('../../../../app/models/Message');
const Conversation = require('../../../../app/models/Conversation');
const stubs = require('../../../helpers/stubs');
const northstarConfig = require('../../../../config/lib/northstar');

const origin = 'subscriptionStatusActive';


const should = chai.should();

test.before(async () => {
  await integrationHelper.hooks.db.connect();
});

test.beforeEach((t) => {
  integrationHelper.hooks.app(t.context);
});

test.afterEach(async () => {
  await integrationHelper.hooks.db.messages.removeAll();
  await integrationHelper.hooks.db.conversations.removeAll();
  nock.cleanAll();
});

test.after.always(async () => {
  await integrationHelper.hooks.db.disconnect();
});

/**
 * PATCH /api/v2/messages/:id
 */

test('POST /api/v2/messages?origin=subscriptionStatusActive should return 401 if not using valid credentials', async (t) => {
  const res = await t.context.request.post(integrationHelper.routes.v2.messages(null, { origin }));
  res.status.should.be.equal(401);
});

test('POST /api/v2/messages?origin=subscriptionStatusActive without a northstarId should return an error', async (t) => {
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: null });
  res.status.should.be.equal(422);
});

test('POST /api/v2/messages?origin=subscriptionStatusActive should create convo if none found as well as an outbound welcome message', async (t) => {
  const user = stubs.northstar.getUser(true);
  const subscriptionStatusActiveData = templatesHelper.getSubscriptionStatusActive();
  /**
   * intercept request to get Northstar user by mobile.
   * TODO: Should be using routes integration helper
   */
  nock(integrationHelper.routes.northstar.baseURI)
    .get(`/users/${northstarConfig.getUserFields.id}/${stubs.getUserId()}`)
    .reply(200, user);

  // test
  const res = await t.context.request
    .post(integrationHelper.routes.v2.messages(null, { origin }))
    .set('Authorization', `Basic ${integrationHelper.getAuthKey()}`)
    .send({ northstarId: stubs.getUserId() });

  res.status.should.be.equal(200);

  // Let's confirm the conversation and message were indeed created
  const conversation = await Conversation.findOne({ userId: user.data.id });
  should.exist(conversation);
  const outboundMessage = await Message.findOne({ conversationId: conversation.id });
  should.exist(outboundMessage);
  outboundMessage.template.should.be.equal(subscriptionStatusActiveData.name);
  outboundMessage.text.should.be.equal(subscriptionStatusActiveData.text);
});