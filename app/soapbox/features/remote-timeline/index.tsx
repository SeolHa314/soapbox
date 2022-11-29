import React, { useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { connectRemoteStream } from 'soapbox/actions/streaming';
import { expandRemoteTimeline } from 'soapbox/actions/timelines';
import IconButton from 'soapbox/components/icon-button';
import SubNavigation from 'soapbox/components/sub-navigation';
import { Column, HStack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useSettings } from 'soapbox/hooks';

import Timeline from '../ui/components/timeline';

import PinnedHostsPicker from './components/pinned-hosts-picker';

const messages = defineMessages({
  heading: { id: 'column.remote', defaultMessage: 'Federated timeline' },
});

interface IRemoteTimeline {
  params?: {
    instance?: string,
  }
}

/** View statuses from a remote instance. */
const RemoteTimeline: React.FC<IRemoteTimeline> = ({ params }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const instance = params?.instance as string;
  const settings = useSettings();

  const stream = useRef<any>(null);

  const timelineId = 'remote';
  const onlyMedia = !!settings.getIn(['remote', 'other', 'onlyMedia']);

  const pinned: boolean = (settings.getIn(['remote_timeline', 'pinnedHosts']) as any).includes(instance);

  const disconnect = () => {
    if (stream.current) {
      stream.current();
    }
  };

  const handleCloseClick: React.MouseEventHandler = () => {
    history.push('/timeline/fediverse');
  };

  const handleLoadMore = (maxId: string) => {
    dispatch(expandRemoteTimeline(instance, { maxId, onlyMedia }));
  };

  useEffect(() => {
    disconnect();
    dispatch(expandRemoteTimeline(instance, { onlyMedia, maxId: undefined }));
    stream.current = dispatch(connectRemoteStream(instance, { onlyMedia }));

    return () => {
      disconnect();
      stream.current = null;
    };
  }, [onlyMedia]);

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent withHeader={false}>
      <div className='px-4 pt-4 sm:p-0'>
        <SubNavigation message={instance} />

        {instance && <PinnedHostsPicker host={instance} />}

        {!pinned && (
          <HStack className='mb-4 px-2' space={2}>
            <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/x.svg')} onClick={handleCloseClick} />
            <Text>
              <FormattedMessage
                id='remote_timeline.filter_message'
                defaultMessage='You are viewing the timeline of {instance}.'
                values={{ instance }}
              />
            </Text>
          </HStack>
        )}
      </div>

      <Timeline
        scrollKey={`${timelineId}_${instance}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}:${instance}`}
        onLoadMore={handleLoadMore}
        emptyMessage={
          <FormattedMessage
            id='empty_column.remote'
            defaultMessage='There is nothing here! Manually follow users from {instance} to fill it up.'
            values={{ instance }}
          />
        }
        divideType='space'
      />
    </Column>
  );
};

export default RemoteTimeline;
