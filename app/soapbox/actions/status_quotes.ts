import { AxiosError, AxiosResponse } from 'axios';

import api, { getLinks } from '../api';

import { importFetchedStatuses } from './importer';

import type { RootState } from 'soapbox/store';

export const STATUS_QUOTES_FETCH_REQUEST = 'STATUS_QUOTES_FETCH_REQUEST';
export const STATUS_QUOTES_FETCH_SUCCESS = 'STATUS_QUOTES_FETCH_SUCCESS';
export const STATUS_QUOTES_FETCH_FAIL    = 'STATUS_QUOTES_FETCH_FAIL';

export const STATUS_QUOTES_EXPAND_REQUEST = 'STATUS_QUOTES_EXPAND_REQUEST';
export const STATUS_QUOTES_EXPAND_SUCCESS = 'STATUS_QUOTES_EXPAND_SUCCESS';
export const STATUS_QUOTES_EXPAND_FAIL    = 'STATUS_QUOTES_EXPAND_FAIL';

export type StatusQuotesAction = {
  type: typeof STATUS_QUOTES_FETCH_REQUEST
  | typeof STATUS_QUOTES_FETCH_SUCCESS
  | typeof STATUS_QUOTES_FETCH_FAIL
  | typeof STATUS_QUOTES_EXPAND_REQUEST
  | typeof STATUS_QUOTES_EXPAND_SUCCESS
  | typeof STATUS_QUOTES_EXPAND_FAIL,
  statusId: string,
  statuses?: AxiosResponse<any, any>,
  next?: string | null,
  error?: AxiosError,
} | (() => void)

const noOp = () => new Promise(f => f(null));

export const fetchStatusQuotes = (statusId: string) => 
  (dispatch: React.Dispatch<StatusQuotesAction>, getState: () => RootState) => {
    if (getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      statusId,
      type: STATUS_QUOTES_FETCH_REQUEST,
    });

    return api(getState).get(`/api/v1/pleroma/statuses/${statusId}/quotes`).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch({
        type: STATUS_QUOTES_FETCH_SUCCESS,
        statusId,
        statuses: response.data,
        next: next ? next.uri : null,
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_FETCH_FAIL,
        statusId,
        error,
      });
    });
  };

export const expandStatusQuotes = (statusId: string) =>
  (dispatch: React.Dispatch<StatusQuotesAction>, getState: () => RootState) => {
    const url = getState().status_lists.getIn([`quotes:${statusId}`, 'next'], null);

    if (url === null || getState().status_lists.getIn([`quotes:${statusId}`, 'isLoading'])) {
      return dispatch(noOp);
    }

    dispatch({
      type: STATUS_QUOTES_EXPAND_REQUEST,
      statusId,
    });

    return api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch({
        type: STATUS_QUOTES_EXPAND_SUCCESS,
        statusId,
        statuses: response.data,
        next: next ? next.uri : null,
      });
    }).catch(error => {
      dispatch({
        type: STATUS_QUOTES_EXPAND_FAIL,
        statusId,
        error,
      });
    });
  };