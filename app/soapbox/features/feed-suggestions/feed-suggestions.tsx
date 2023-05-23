import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import VerificationBadge from 'soapbox/components/verification-badge';
import { useAppSelector } from 'soapbox/hooks';

import { Card, CardBody, CardTitle, HStack, Stack, Text } from '../../components/ui';
import ActionButton from '../ui/components/action-button';

import type { Account } from 'soapbox/schemas';

const messages = defineMessages({
  heading: { id: 'feed_suggestions.heading', defaultMessage: 'Suggested Profiles' },
  viewAll: { id: 'feed_suggestions.view_all', defaultMessage: 'View all' },
});

interface ISuggestionItem {
  account: Account
}

const SuggestionItem: React.FC<ISuggestionItem> = ({ account }) => {
  return (
    <Stack space={3} className='w-52 shrink-0 rounded-md border border-solid border-gray-300 p-4 dark:border-gray-800 md:w-full md:shrink md:border-transparent md:p-0 dark:md:border-transparent'>
      <Link
        to={`/@${account.acct}`}
        title={account.acct}
      >
        <Stack space={3} className='mx-auto w-40 md:w-24'>
          <img
            src={account.avatar}
            className='mx-auto block h-16 w-16 min-w-[56px] rounded-full object-cover'
            alt={account.acct}
          />

          <Stack>
            <HStack alignItems='center' justifyContent='center' space={1}>
              <Text
                weight='semibold'
                dangerouslySetInnerHTML={{ __html: account.display_name_html }}
                truncate
                align='center'
                size='sm'
                className='max-w-[95%]'
              />

              {account.verified && <VerificationBadge />}
            </HStack>

            <Text theme='muted' align='center' size='sm' truncate>@{account.acct}</Text>
          </Stack>
        </Stack>
      </Link>

      <div className='text-center'>
        <ActionButton account={account} />
      </div>
    </Stack>
  );
};

const FeedSuggestions = () => {
  const intl = useIntl();
  const suggestedProfiles = useAppSelector((state) => state.suggestions.items);
  const isLoading = useAppSelector((state) => state.suggestions.isLoading);

  if (!isLoading && suggestedProfiles.size === 0) return null;

  return (
    <Card size='lg' variant='rounded' className='space-y-6'>
      <HStack justifyContent='between' alignItems='center'>
        <CardTitle title={intl.formatMessage(messages.heading)} />

        <Link
          to='/suggestions'
          className='text-primary-600 hover:underline dark:text-accent-blue'
        >
          {intl.formatMessage(messages.viewAll)}
        </Link>
      </HStack>

      <CardBody>
        <HStack space={4} alignItems='center' className='overflow-x-auto md:space-x-0 lg:overflow-x-hidden'>
          {suggestedProfiles.slice(0, 4).map((suggestedProfile) => (
            <SuggestionItem key={suggestedProfile.account} accountId={suggestedProfile.account} />
          ))}
        </HStack>
      </CardBody>
    </Card>
  );
};

export default FeedSuggestions;
