/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { LoadingProvider } from './components/loading/LoadingProvider';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { AuthPortal } from './components/AuthPortal';
import { ClientPortalPage } from './components/ClientPortalPage';
import ClickSpark from './components/ui/ClickSpark';
import { SmartRefreshNotifier } from './components/common/SmartRefreshNotifier';
import { useSmartRefresh } from './hooks/useSmartRefresh';

function AppContent() {
  const { isAuthenticated, currentUser, refreshAllData } = useProject();

  // Task 2: Smart Data Refresh Notification System
  const {
    hasPendingUpdate,
    pendingUpdate,
    isRefreshing,
    triggerRefresh,
    dismissUpdate
  } = useSmartRefresh({
    onRefresh: refreshAllData,
    checkIntervalMs: 45000,
    enabled: isAuthenticated && currentUser?.role !== 'USER'
  });

  // Public Guest Client Portal Access via direct SPA query parameters or token
  const urlParams = new URLSearchParams(window.location.search);
  const viewMode = urlParams.get('view');
  const targetProjectId = urlParams.get('projectId');
  const portalToken = urlParams.get('portalToken') || urlParams.get('token') || (
    window.location.href.match(/[?&](?:portalToken|token)=([^&/#]+)/)?.[1]
  );

  const isClientPortal = viewMode === 'client' || !!portalToken || window.location.pathname.includes('/portal');

  if (isClientPortal) {
    return (
      <ClientPortalPage 
        projectId={targetProjectId || undefined}
        tokenParam={portalToken || undefined} 
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthPortal />;
  }

  // Permission Check: If role is USER (unapproved), show approval waiting screen
  if (currentUser?.role === 'USER') {
    return <AuthPortal />;
  }

  return (
    <>
      <Layout>
        <DashboardView />
      </Layout>
      <SmartRefreshNotifier
        hasPendingUpdate={hasPendingUpdate}
        pendingUpdate={pendingUpdate}
        isRefreshing={isRefreshing}
        onRefresh={triggerRefresh}
        onDismiss={dismissUpdate}
      />
    </>
  );
}

export default function App() {
  return (
    <LoadingProvider>
      <ProjectProvider>
        <AppWithSpark />
      </ProjectProvider>
    </LoadingProvider>
  );
}

function AppWithSpark() {
  const { theme } = useProject();
  const isDarkMode = typeof document !== 'undefined'
    ? document.documentElement.classList.contains('dark') || (theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches))
    : false;
  const sparkColor = isDarkMode ? '#ffffff' : '#2563eb';

  return (
    <ClickSpark
      sparkColor={sparkColor}
      sparkSize={6}
      sparkRadius={16}
      sparkCount={8}
      duration={350}
    >
      <AppContent />
    </ClickSpark>
  );
}

