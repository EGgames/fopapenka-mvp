import SpecReporter from '@wdio/spec-reporter';

export const config = {
  runner: 'local',
  framework: 'cucumber',
  specs: ['./features/**/*.feature'],

  cucumberOpts: {
    require: [
      './screenplay/support/**/*.js',
      './screenplay/steps/**/*.steps.js',
    ],
    tagExpression: 'not @pending',
    timeout: 30000,
  },

  baseUrl: 'http://localhost:5173',

  maxInstances: 1,

  capabilities: [{
    browserName: 'firefox',
    'moz:firefoxOptions': {
      args: ['-headless', '--width=1920', '--height=1080'],
    },
  }],

  logLevel: 'error',
  reporters: [ SpecReporter ],

  serenity: {
    runner: 'cucumber',
    crew: [],
  },
};

