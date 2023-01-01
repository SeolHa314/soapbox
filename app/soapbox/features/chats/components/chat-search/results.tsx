import classNames from 'clsx';
import React, { useCallback, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification-badge';
import useAccountSearch from 'soapbox/queries/search';

interface IResults {
  accountSearchResult: ReturnType<typeof useAccountSearch>
  onSelect(id: string): void
}

const Results = ({ accountSearchResult, onSelect }: IResults) => {
  const { data: accounts, isFetching, hasNextPage, fetchNextPage } = accountSearchResult;

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const renderAccount = useCallback((_index, account) => (
    <button
      key={account.id}
      type='button'
      className='px-2 py-3 w-full rounded-lg flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800'
      onClick={() => onSelect(account.id)}
      data-testid='account'
    >
      <HStack alignItems='center' space={2}>
        <Avatar src={account.avatar} size={40} />

        <Stack alignItems='start'>
          <div className='flex items-center space-x-1 flex-grow'>
            <Text weight='bold' size='sm' truncate>{account.display_name}</Text>
            {account.verified && <VerificationBadge />}
          </div>
          <Text size='sm' weight='medium' theme='muted' truncate>@{account.acct}</Text>
        </Stack>
      </HStack>
    </button>
  ), []);

  return (
    <div className='relative flex-grow'>
      <Virtuoso
        data={accounts}
        itemContent={(index, chat) => (
          <div className='px-2'>
            {renderAccount(index, chat)}
          </div>
        )}
        endReached={handleLoadMore}
        atTopStateChange={(atTop) => setNearTop(atTop)}
        atBottomStateChange={(atBottom) => setNearBottom(atBottom)}
      />

      <>
        <div
          className={classNames('inset-x-0 top-0 flex rounded-t-lg justify-center bg-gradient-to-b from-white to-transparent pb-12 pt-8 pointer-events-none dark:from-gray-900 absolute transition-opacity duration-500', {
            'opacity-0': isNearTop,
            'opacity-100': !isNearTop,
          })}
        />
        <div
          className={classNames('inset-x-0 bottom-0 flex rounded-b-lg justify-center bg-gradient-to-t from-white to-transparent pt-12 pb-8 pointer-events-none dark:from-gray-900 absolute transition-opacity duration-500', {
            'opacity-0': isNearBottom,
            'opacity-100': !isNearBottom,
          })}
        />
      </>
    </div>
  );
};

export default Results;
