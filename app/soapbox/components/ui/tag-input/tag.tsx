import React from 'react';

import IconButton from '../icon-button/icon-button';
import Text from '../text/text';

interface ITag {
  /** Name of the tag. */
  tag: string,
  /** Callback when the X icon is pressed. */
  onDelete: (tag: string) => void,
}

/** A single editable Tag (used by TagInput). */
const Tag: React.FC<ITag> = ({ tag, onDelete }) => {
  return (
    <div className='inline-flex p-1 rounded bg-primary-500 items-center whitespace-nowrap'>
      <Text theme='white'>{tag}</Text>

      <IconButton
        iconClassName='w-4 h-4'
        src={require('@tabler/icons/x.svg')}
        onClick={() => onDelete(tag)}
        transparent
      />
    </div>
  );
};

export default Tag;