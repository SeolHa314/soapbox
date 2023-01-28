import React from 'react';

import { HStack, Stack, Text } from 'soapbox/components/ui';

import { generateText, randomIntFromInterval } from '../utils';

const PlaceholderGroupCard = () => {
  const groupNameLength = randomIntFromInterval(5, 25);
  const roleLength = randomIntFromInterval(5, 15);
  const privacyLength = randomIntFromInterval(5, 15);

  return (
    <div className='overflow-hidden animate-pulse'>
      <Stack className='bg-white dark:bg-primary-900 border border-solid border-gray-300 dark:border-primary-800 rounded-lg sm:rounded-xl'>
        <div className='bg-primary-100 dark:bg-gray-800 h-[120px] relative -m-[1px] mb-0 rounded-t-lg sm:rounded-t-xl'>
          <div className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2'>
            <div className='h-16 w-16 rounded-full bg-primary-500 ring-2 ring-white dark:ring-primary-900' />
          </div>
        </div>
        <Stack className='p-3 pt-9' alignItems='center' space={3}>
          <Text size='lg' weight='bold'>{generateText(groupNameLength)}</Text>
          <HStack className='text-gray-700 dark:text-gray-600' space={3} wrap>
            <span>{generateText(roleLength)}</span>
            <span>{generateText(privacyLength)}</span>
          </HStack>
        </Stack>
      </Stack>
    </div>
  );
};

export default PlaceholderGroupCard;
