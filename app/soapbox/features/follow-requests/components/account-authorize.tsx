import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { authorizeFollowRequest, rejectFollowRequest } from 'soapbox/actions/accounts';
import Avatar from 'soapbox/components/avatar';
import DisplayName from 'soapbox/components/display-name';
import IconButton from 'soapbox/components/icon-button';
import { Text } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

const messages = defineMessages({
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
});

interface IAccountAuthorize {
  id: string,
}

const AccountAuthorize: React.FC<IAccountAuthorize> = ({ id }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const getAccount = useCallback(makeGetAccount(), []);

  const account = useAppSelector((state) => getAccount(state, id));

  const onAuthorize = () => {
    dispatch(authorizeFollowRequest(id));
  };

  const onReject = () => {
    dispatch(rejectFollowRequest(id));
  };

  if (!account) return null;

  const content = { __html: account.note_emojified };

  return (
    <div className='account-authorize__wrapper'>
      <div className='account-authorize'>
        <Link to={`/@${account.acct}`}>
          <div className='account-authorize__avatar'><Avatar account={account} size={48} /></div>
          <DisplayName account={account} />
        </Link>

        <Text className='account__header__content' dangerouslySetInnerHTML={content} />
      </div>

      <div className='account--panel'>
        <div className='account--panel__button'><IconButton title={intl.formatMessage(messages.authorize)} src={require('@tabler/icons/check.svg')} onClick={onAuthorize} /></div>
        <div className='account--panel__button'><IconButton title={intl.formatMessage(messages.reject)} src={require('@tabler/icons/x.svg')} onClick={onReject} /></div>
      </div>
    </div>
  );
};

export default AccountAuthorize;
