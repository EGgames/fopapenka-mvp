import { Actor, actorCalled, actorInTheSpotlight } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://localhost:4001/api' });

export const Admin = () =>
  actorCalled('Admin')
    .whoCan(BrowseTheWebWithWebdriverIO.usingBrowser())
    .whoCan(CallAnApi.using(apiClient));

export const Player = (name = 'Ronaldo') =>
  actorCalled(name)
    .whoCan(BrowseTheWebWithWebdriverIO.usingBrowser())
    .whoCan(CallAnApi.using(apiClient));
