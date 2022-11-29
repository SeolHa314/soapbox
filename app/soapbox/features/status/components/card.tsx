import classnames from 'clsx';
import { List as ImmutableList } from 'immutable';
import React, { useState, useEffect } from 'react';

import Blurhash from 'soapbox/components/blurhash';
import Icon from 'soapbox/components/icon';
import { HStack, Stack, Text } from 'soapbox/components/ui';
import { useSettings } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';
import { addAutoPlay } from 'soapbox/utils/media';

import type { Card as CardEntity, Attachment } from 'soapbox/types/entities';

const trim = (text: string, len: number): string => {
  const cut = text.indexOf(' ', len);

  if (cut === -1) {
    return text;
  }

  return text.substring(0, cut) + (text.length > len ? '…' : '');
};

interface ICard {
  card: CardEntity,
  maxTitle?: number,
  maxDescription?: number,
  onOpenMedia: (attachments: ImmutableList<Attachment>, index: number) => void,
  compact?: boolean,
  defaultWidth?: number,
  cacheWidth?: (width: number) => void,
  horizontal?: boolean,
}

const Card: React.FC<ICard> = ({
  card,
  defaultWidth = 467,
  maxTitle = 120,
  maxDescription = 200,
  compact = false,
  cacheWidth,
  onOpenMedia,
  horizontal,
}): JSX.Element => {
  const settings = useSettings();
  const shouldAutoPlayVideo = settings.get('autoPlayVideo');

  const [width, setWidth] = useState(defaultWidth);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(false);
  }, [card.url]);

  const trimmedTitle = trim(card.title, maxTitle);
  const trimmedDescription = trim(card.description, maxDescription);

  const handlePhotoClick = () => {
    const attachment = normalizeAttachment({
      type: 'image',
      url: card.embed_url,
      description: trimmedTitle,
      meta: {
        original: {
          width: card.width,
          height: card.height,
        },
      },
    });

    onOpenMedia(ImmutableList([attachment]), 0);
  };

  const handleEmbedClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (card.type === 'photo') {
      handlePhotoClick();
    } else {
      setEmbedded(true);
    }
  };

  const setRef: React.RefCallback<HTMLElement> = c => {
    if (c) {
      if (cacheWidth) {
        cacheWidth(c.offsetWidth);
      }

      setWidth(c.offsetWidth);
    }
  };

  const renderVideo = () => {
    const content = { __html: shouldAutoPlayVideo ? addAutoPlay(card.html) : card.html };
    const ratio = getRatio(card);
    const height = width / ratio;

    return (
      <div
        ref={setRef}
        className='status-card__image status-card-video'
        dangerouslySetInnerHTML={content}
        style={{ height }}
      />
    );
  };

  const getRatio = (card: CardEntity): number => {
    const ratio = (card.width / card.height) || 16 / 9;

    // Constrain to a sane limit
    // https://en.wikipedia.org/wiki/Aspect_ratio_(image)
    return Math.min(Math.max(9 / 16, ratio), 4);
  };

  const interactive = card.type !== 'link';
  horizontal = typeof horizontal === 'boolean' ? horizontal : interactive || embedded;
  const className = classnames('status-card', { horizontal, compact, interactive }, `status-card--${card.type}`);
  const ratio = getRatio(card);
  const height = (compact && !embedded) ? (width / (16 / 9)) : (width / ratio);

  const title = interactive ? (
    <a
      onClick={(e) => e.stopPropagation()}
      href={card.url}
      title={trimmedTitle}
      rel='noopener'
      target='_blank'
    >
      <span>{trimmedTitle}</span>
    </a>
  ) : (
    <span title={trimmedTitle}>{trimmedTitle}</span>
  );

  const description = (
    <Stack space={2} className='flex-1 overflow-hidden p-4'>
      {trimmedTitle && (
        <Text weight='bold'>{title}</Text>
      )}
      {trimmedDescription && (
        <Text>{trimmedDescription}</Text>
      )}
      <HStack space={1} alignItems='center'>
        <Text tag='span' theme='muted'>
          <Icon src={require('@tabler/icons/link.svg')} />
        </Text>
        <Text tag='span' theme='muted' size='sm'>
          {card.provider_name}
        </Text>
      </HStack>
    </Stack>
  );

  let embed: React.ReactNode = '';

  const canvas = (
    <Blurhash
      className='absolute w-full h-full inset-0 -z-10'
      hash={card.blurhash}
    />
  );

  const thumbnail = (
    <div
      style={{
        backgroundImage: `url(${card.image})`,
        width: horizontal ? width : undefined,
        height: horizontal ? height : undefined,
      }}
      className='status-card__image-image'
    />
  );

  if (interactive) {
    if (embedded) {
      embed = renderVideo();
    } else {
      let iconVariant = require('@tabler/icons/player-play.svg');

      if (card.type === 'photo') {
        iconVariant = require('@tabler/icons/zoom-in.svg');
      }

      embed = (
        <div className='status-card__image'>
          {canvas}
          {thumbnail}

          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='bg-gray-500/90 dark:bg-gray-700/90 shadow-md rounded-full px-4 py-3 flex items-center justify-center'>
              <HStack space={3} alignItems='center'>
                <button onClick={handleEmbedClick} className='appearance-none text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'>
                  <Icon
                    src={iconVariant}
                    className='w-6 h-6 text-inherit'
                  />
                </button>

                {horizontal && (
                  <a
                    onClick={(e) => e.stopPropagation()}
                    href={card.url}
                    target='_blank'
                    rel='noopener'
                    className='text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                  >
                    <Icon
                      src={require('@tabler/icons/external-link.svg')}
                      className='w-6 h-6 text-inherit'
                    />
                  </a>
                )}
              </HStack>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={className} ref={setRef}>
        {embed}
        {description}
      </div>
    );
  } else if (card.image) {
    embed = (
      <div className={classnames(
        'status-card__image',
        'w-full rounded-l md:w-auto md:h-auto flex-none md:flex-auto',
        {
          'h-auto': horizontal,
          'h-[200px]': !horizontal,
        },
      )}
      >
        {canvas}
        {thumbnail}
      </div>
    );
  } else {
    embed = (
      <div className='status-card__image status-card__image--empty'>
        <Icon src={require('@tabler/icons/file-text.svg')} />
      </div>
    );
  }

  return (
    <a
      href={card.url}
      className={className}
      target='_blank'
      rel='noopener'
      ref={setRef}
      onClick={e => e.stopPropagation()}
    >
      {embed}
      {description}
    </a>
  );
};

export default Card;
