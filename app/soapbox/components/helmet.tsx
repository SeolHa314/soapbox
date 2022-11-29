import React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet';

import { useAppSelector, useInstance, useSettings } from 'soapbox/hooks';
import { RootState } from 'soapbox/store';
import FaviconService from 'soapbox/utils/favicon-service';

FaviconService.initFaviconService();

const getNotifTotals = (state: RootState): number => {
  const notifications = state.notifications.unread || 0;
  const chats = state.chats.items.reduce((acc: any, curr: any) => acc + Math.min(curr.get('unread', 0), 1), 0);
  const reports = state.admin.openReports.count();
  const approvals = state.admin.awaitingApproval.count();
  return notifications + chats + reports + approvals;
};

const Helmet: React.FC = ({ children }) => {
  const instance = useInstance();
  const unreadCount = useAppSelector((state) => getNotifTotals(state));
  const demetricator = useSettings().get('demetricator');

  const hasUnreadNotifications = React.useMemo(() => !(unreadCount < 1 || demetricator), [unreadCount, demetricator]);

  const addCounter = (string: string) => {
    return hasUnreadNotifications ? `(${unreadCount}) ${string}` : string;
  };

  const updateFaviconBadge = () => {
    if (hasUnreadNotifications) {
      FaviconService.drawFaviconBadge();
    } else {
      FaviconService.clearFaviconBadge();
    }
  };

  React.useEffect(() => {
    updateFaviconBadge();
  }, [unreadCount, demetricator]);

  return (
    <ReactHelmet
      titleTemplate={addCounter(`%s | ${instance.title}`)}
      defaultTitle={addCounter(instance.title)}
      defer={false}
    >
      {children}
    </ReactHelmet>
  );
};

export default Helmet;
