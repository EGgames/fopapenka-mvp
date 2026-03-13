import { Before } from '@cucumber/cucumber';
import { engage, Cast } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://localhost:4001/api' });

Before(async function () {
  engage(
    Cast.where(actor =>
      actor.whoCan(
        BrowseTheWebWithWebdriverIO.using(browser),
        CallAnApi.using(apiClient),
      )
    )
  );
  // Clear auth state from previous scenarios
  await browser.url('/');
  await browser.execute(() => localStorage.clear());
});
