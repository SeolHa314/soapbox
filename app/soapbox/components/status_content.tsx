import classNames from 'clsx';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Icon from 'soapbox/components/icon';
import { useSoapboxConfig } from 'soapbox/hooks';
import { addGreentext } from 'soapbox/utils/greentext';
import { onlyEmoji as isOnlyEmoji } from 'soapbox/utils/rich_content';

import { isRtl } from '../rtl';

import Poll from './polls/poll';
import './status-content.css';

import type { Status, Mention } from 'soapbox/types/entities';

const MAX_HEIGHT = 642; // 20px * 32 (+ 2px padding at the top)
const BIG_EMOJI_LIMIT = 10;

type Point = [
  x: number,
  y: number,
]

interface IReadMoreButton {
  onClick: React.MouseEventHandler,
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick }) => (
  <button className='flex items-center text-gray-900 dark:text-gray-300 border-0 bg-transparent p-0 pt-2 hover:underline active:underline' onClick={onClick}>
    <FormattedMessage id='status.read_more' defaultMessage='Read more' />
    <Icon className='inline-block h-5 w-5' src={require('@tabler/icons/chevron-right.svg')} fixedWidth />
  </button>
);

interface IStatusContent {
  status: Status,
  onClick?: () => void,
  collapsable?: boolean,
  translatable?: boolean,
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = ({ status, onClick, collapsable = false, translatable }) => {
  const history = useHistory();

  const [collapsed, setCollapsed] = useState(false);
  const [onlyEmoji, setOnlyEmoji] = useState(false);

  const startXY = useRef<Point>();
  const node = useRef<HTMLDivElement>(null);

  const { greentext } = useSoapboxConfig();

  const onMentionClick = (mention: Mention, e: MouseEvent) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      history.push(`/@${mention.acct}`);
    }
  };

  const onHashtagClick = (hashtag: string, e: MouseEvent) => {
    hashtag = hashtag.replace(/^#/, '').toLowerCase();

    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      history.push(`/tags/${hashtag}`);
    }
  };

  /** For regular links, just stop propogation */
  const onLinkClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const updateStatusLinks = () => {
    if (!node.current) return;

    const links = node.current.querySelectorAll('a');

    links.forEach(link => {
      // Skip already processed
      if (link.classList.contains('status-link')) return;

      // Add attributes
      link.classList.add('status-link');
      link.setAttribute('rel', 'nofollow noopener');
      link.setAttribute('target', '_blank');

      const mention = status.mentions.find(mention => link.href === `${mention.url}`);

      // Add event listeners on mentions and hashtags
      if (mention) {
        link.addEventListener('click', onMentionClick.bind(link, mention), false);
        link.setAttribute('title', mention.acct);
      } else if (link.textContent?.charAt(0) === '#' || (link.previousSibling?.textContent?.charAt(link.previousSibling.textContent.length - 1) === '#')) {
        link.addEventListener('click', onHashtagClick.bind(link, link.text), false);
      } else {
        link.setAttribute('title', link.href);
        link.addEventListener('click', onLinkClick.bind(link), false);
      }
    });
  };

  const maybeSetCollapsed = (): void => {
    if (!node.current) return;

    if (collapsable && onClick && !collapsed && status.spoiler_text.length === 0) {
      if (node.current.clientHeight > MAX_HEIGHT) {
        setCollapsed(true);
      }
    }
  };

  const maybeSetOnlyEmoji = (): void => {
    if (!node.current) return;
    const only = isOnlyEmoji(node.current, BIG_EMOJI_LIMIT, true);

    if (only !== onlyEmoji) {
      setOnlyEmoji(only);
    }
  };

  useEffect(() => {
    maybeSetCollapsed();
    maybeSetOnlyEmoji();
    updateStatusLinks();
  });

  const handleMouseDown: React.EventHandler<React.MouseEvent> = (e) => {
    startXY.current = [e.clientX, e.clientY];
  };

  const handleMouseUp: React.EventHandler<React.MouseEvent> = (e) => {
    if (!startXY.current) return;
    const target = e.target as HTMLElement;
    const parentNode = target.parentNode as HTMLElement;

    const [startX, startY] = startXY.current;
    const [deltaX, deltaY] = [Math.abs(e.clientX - startX), Math.abs(e.clientY - startY)];

    if (target.localName === 'button' || target.localName === 'a' || (parentNode && (parentNode.localName === 'button' || parentNode.localName === 'a'))) {
      return;
    }

    if (deltaX + deltaY < 5 && e.button === 0 && !(e.ctrlKey || e.metaKey) && onClick) {
      onClick();
    }

    startXY.current = undefined;
  };

  const parsedHtml = useMemo((): string => {
    const html = translatable && status.translation ? status.translation.get('content')! : status.contentHtml;

    if (greentext) {
      return addGreentext(html);
    } else {
      return html;
    }
  }, [status.contentHtml, status.translation]);

  if (status.content.length === 0) {
    return null;
  }

  const withSpoiler = status.spoiler_text.length > 0;

  const baseClassName = 'text-gray-900 dark:text-gray-100 break-words text-ellipsis overflow-hidden relative focus:outline-none';

  const content = { __html: parsedHtml };
  const directionStyle: React.CSSProperties = { direction: 'ltr' };
  const className = classNames(baseClassName, 'status-content', {
    'cursor-pointer': onClick,
    'whitespace-normal': withSpoiler,
    'max-h-[300px]': collapsed,
    'leading-normal big-emoji': onlyEmoji,
  });

  if (isRtl(status.search_index)) {
    directionStyle.direction = 'rtl';
  }

  if (onClick) {
    const output = [
      <div
        ref={node}
        tabIndex={0}
        key='content'
        className={className}
        style={directionStyle}
        dangerouslySetInnerHTML={content}
        lang={status.language || undefined}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />,
    ];

    if (collapsed) {
      output.push(<ReadMoreButton onClick={onClick} key='read-more' />);
    }

    const hasPoll = status.poll && typeof status.poll === 'string';
    if (hasPoll) {
      output.push(<Poll id={status.poll} key='poll' status={status.url} />);
    }

    return <div className={classNames({ 'bg-gray-100 dark:bg-primary-800 rounded-md p-4': hasPoll })}>{output}</div>;
  } else {
    const output = [
      <div
        ref={node}
        tabIndex={0}
        key='content'
        className={classNames(baseClassName, 'status-content', {
          'leading-normal big-emoji': onlyEmoji,
        })}
        style={directionStyle}
        dangerouslySetInnerHTML={content}
        lang={status.language || undefined}
      />,
    ];

    if (status.poll && typeof status.poll === 'string') {
      output.push(<Poll id={status.poll} key='poll' status={status.url} />);
    }

    return <>{output}</>;
  }
};

export default React.memo(StatusContent);
