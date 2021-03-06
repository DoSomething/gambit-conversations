module.exports = {
  extends: '@dosomething/eslint-config/server',
  globals: {
    app: true
  },
  rules: {
    'no-underscore-dangle': [
      'error', {
        "allow": [
          // MongoDB ids
          "_id",
          // Front's payload includes this pattern
          "_links"
        ]
      }
    ]
  }
};
