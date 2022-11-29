import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account';
import Icon from 'soapbox/components/icon';
import { HStack, Text } from 'soapbox/components/ui';

import type { Account as AccountEntity } from 'soapbox/types/entities';

interface IMovedNote {
  from: AccountEntity,
  to: AccountEntity,
}

const MovedNote: React.FC<IMovedNote> = ({ from, to }) => (
  <div className='account__moved-note'>
    <HStack className='mb-2' alignItems='center' space={1.5}>
      <Icon
        src={require('@tabler/icons/briefcase.svg')}
        className='text-primary-600 dark:text-primary-400 flex-none'
      />

      <div className='truncate'>
        <Text theme='muted' size='sm' truncate>
          <FormattedMessage
            id='notification.move'
            defaultMessage='{name} moved to {targetName}'
            values={{
              name: <span dangerouslySetInnerHTML={{ __html: from.display_name_html }} />,
              targetName: to.acct,
            }}
          />
        </Text>
      </div>
    </HStack>

    <Account account={to} withRelationship={false} />
  </div>
);

export default MovedNote;
