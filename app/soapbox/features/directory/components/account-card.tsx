import classNames from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { getSettings } from 'soapbox/actions/settings';
import Badge from 'soapbox/components/badge';
import RelativeTimestamp from 'soapbox/components/relative-timestamp';
import { Stack, Text } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import ActionButton from 'soapbox/features/ui/components/action-button';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';
import { shortNumberFormat } from 'soapbox/utils/numbers';

const getAccount = makeGetAccount();

interface IAccountCard {
  id: string,
}

const AccountCard: React.FC<IAccountCard> = ({ id }) => {
  const me = useAppSelector((state) => state.me);
  const account = useAppSelector((state) => getAccount(state, id));
  const autoPlayGif = useAppSelector((state) => getSettings(state).get('autoPlayGif'));

  if (!account) return null;

  const followedBy = me !== account.id && account.relationship?.followed_by;

  return (
    <div className='flex flex-col divide-y divide-gray-200 dark:divide-primary-700 rounded-lg bg-white dark:bg-primary-800 text-center shadow'>
      <div className='relative'>
        {followedBy && (
          <div className='absolute top-2.5 left-2.5'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}

        <div className='absolute bottom-2.5 right-2.5'>
          <ActionButton account={account} small />
        </div>

        <img
          src={autoPlayGif ? account.header : account.header_static}
          alt=''
          className='object-cover h-32 w-full rounded-t-lg'
        />
      </div>

      <Stack space={4} className='p-3'>
        <AccountContainer
          id={account.id}
          withRelationship={false}
        />

        <Text
          truncate
          align='left'
          className={classNames('[&_br]:hidden [&_p]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate')}
          dangerouslySetInnerHTML={{ __html: account.note_emojified || '&nbsp;' }}
        />
      </Stack>

      <div className='grid grid-cols-3 gap-1 py-4'>
        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.statuses_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.followers_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {account.last_status_at === null ? (
              <FormattedMessage id='account.never_active' defaultMessage='Never' />
            ) : (
              <RelativeTimestamp theme='inherit' timestamp={account.last_status_at} />
            )}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.last_status' defaultMessage='Last active' />
          </Text>
        </Stack>
      </div>
    </div>
  );
};

export default AccountCard;
