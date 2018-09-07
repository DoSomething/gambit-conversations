'use strict';

require('dotenv').config();
const test = require('ava');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('heroku-logger');
const rewire = require('rewire');

const stubs = require('../../../helpers/stubs');

// setup "x.should.y" assertion style
chai.should();
chai.use(sinonChai);

// module to be tested
const cacheHelper = rewire('../../../../lib/helpers/cache');

// stubs
const rivescriptCacheId = 'contentApi';
const rivescript = '+ hello\n- hi';

const sandbox = sinon.sandbox.create();

test.beforeEach(() => {
  stubs.stubLogger(sandbox, logger);
});

test.afterEach(() => {
  sandbox.restore();
  cacheHelper.__set__('rivescriptCache', undefined);
});

/**
 * Rivescript cache
 */
test('rivescript.get should return object when cache exists', async () => {
  cacheHelper.__set__('rivescriptCache', {
    get: () => Promise.resolve(rivescript),
  });
  const result = await cacheHelper.rivescript.get(rivescriptCacheId);
  result.should.deep.equal(rivescript);
});

test('rivescript.get should return falsy when cache undefined', async (t) => {
  cacheHelper.__set__('rivescriptCache', {
    get: () => Promise.resolve(null),
  });
  const result = await cacheHelper.rivescript.get(rivescriptCacheId);
  t.falsy(result);
});

test('rivescript.get should throw when cache set fails', async (t) => {
  cacheHelper.__set__('rivescriptCache', {
    get: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.rivescript.get(rivescriptCacheId));
});

test('rivescript.set should return an object', async () => {
  cacheHelper.__set__('rivescriptCache', {
    set: () => Promise.resolve(JSON.stringify(rivescript)),
  });
  const result = await cacheHelper.rivescript.set(rivescriptCacheId);
  result.should.deep.equal(rivescript);
});

test('rivescript.set should throw when cache set fails', async (t) => {
  cacheHelper.__set__('rivescriptCache', {
    set: () => Promise.reject(new Error()),
  });
  await t.throws(cacheHelper.rivescript.set(rivescriptCacheId));
});
