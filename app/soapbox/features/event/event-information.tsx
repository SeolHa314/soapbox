import React, { useCallback, useEffect, useState } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { fetchStatus } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing-indicator';
import StatusContent from 'soapbox/components/status-content';
import StatusMedia from 'soapbox/components/status-media';
import TranslateButton from 'soapbox/components/translate-button';
import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';
import { useAppDispatch, useAppSelector, useSettings } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';
import { defaultMediaVisibility } from 'soapbox/utils/status';

import type { Status as StatusEntity } from 'soapbox/types/entities';

type RouteParams = { statusId: string };

interface IEventInformation {
  params: RouteParams,
}

const EventInformation: React.FC<IEventInformation> = ({ params }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: params.statusId })) as StatusEntity;

  const settings = useSettings();
  const displayMedia = settings.get('displayMedia') as string;

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));

  useEffect(() => {
    dispatch(fetchStatus(params.statusId)).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });

    setShowMedia(defaultMediaVisibility(status, displayMedia));
  }, [params.statusId]);

  const handleToggleMediaVisibility = () => {
    setShowMedia(!showMedia);
  };

  const handleShowMap: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();

    dispatch(openModal('EVENT_MAP', {
      statusId: status.id,
    }));
  };

  const renderEventLocation = useCallback(() => {
    const event = status?.event;

    return event?.location && (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.location' defaultMessage='Location' />
        </Text>
        <HStack space={2} alignItems='center'>
          <Icon src={require('@tabler/icons/map-pin.svg')} />
          <Text>
            {event.location.get('name')}
            <br />
            {!!event.location.get('street')?.trim() && (<>
              {event.location.get('street')}
              <br />
            </>)}
            {[event.location.get('postalCode'), event.location.get('locality'), event.location.get('country')].filter(text => text).join(', ')}
            {event.location.get('latitude') && (<>
              <br />
              <a href='#' className='text-primary-600 dark:text-accent-blue hover:underline' onClick={handleShowMap}>
                <FormattedMessage id='event.show_on_map' defaultMessage='Show on map' />
              </a>
            </>)}
          </Text>
        </HStack>
      </Stack>
    );
  }, [status]);

  const renderEventDate = useCallback(() => {
    const event = status?.event;

    if (!event?.start_time) return null;

    return (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.date' defaultMessage='Date' />
        </Text>
        <HStack space={2} alignItems='center'>
          <Icon src={require('@tabler/icons/calendar.svg')} />
          <Text>
            <FormattedDate value={event.start_time} year='numeric' month='long' day='2-digit' weekday='long' hour='2-digit' minute='2-digit' />
            {event.end_time && (<>
              {' - '}
              <FormattedDate value={event.end_time} year='numeric' month='long' day='2-digit' weekday='long' hour='2-digit' minute='2-digit' />
            </>)}
          </Text>
        </HStack>
      </Stack>
    );
  }, [status]);

  const renderLinks = useCallback(() => {
    if (!status.event?.links.size) return null;

    return (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.website' defaultMessage='External links' />
        </Text>

        {status.event.links.map(link => (
          <HStack space={2} alignItems='center'>
            <Icon src={require('@tabler/icons/link.svg')} />
            <a href={link.url} className='text-primary-600 dark:text-accent-blue hover:underline' target='_blank'>
              {link.url.replace(/^https?:\/\//, '')}
            </a>
          </HStack>
        ))}
      </Stack>
    );
  }, [status]);

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) return null;

  return (
    <Stack className='mt-4 sm:p-2' space={2}>
      {!!status.contentHtml.trim() && (
        <Stack space={1}>
          <Text size='xl' weight='bold'>
            <FormattedMessage id='event.description' defaultMessage='Description' />
          </Text>

          <StatusContent status={status} collapsable={false} translatable />

          <TranslateButton status={status} />
        </Stack>
      )}

      <StatusMedia
        status={status}
        showMedia={showMedia}
        onToggleVisibility={handleToggleMediaVisibility}
      />

      {status.quote && status.pleroma.get('quote_visible', true) && (
        <QuotedStatus statusId={status.quote as string} />
      )}

      {renderEventLocation()}

      {renderEventDate()}

      {renderLinks()}
    </Stack>
  );
};

export default EventInformation;
