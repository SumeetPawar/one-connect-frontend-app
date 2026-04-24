'use client';

import { useEffect, useState } from 'react';
import {
  disconnectGoogleFit,
  fetchStepsFromServer,
  isGoogleFitConnected,
  setGoogleFitConnected,
  startGoogleFitAuth,
} from '../../lib/googleFit';

interface Props {
  onStepsFetched: (steps: number) => void;
  returnUrl?: string;
}

interface BackendStatus {
  connected: boolean;
  connected_since?: string;
  last_synced?: string;
}

type State = 'disconnected' | 'fetching' | 'connected' | 'error' | 'needs_reconnect';

export function GoogleFitConnect({ onStepsFetched, returnUrl }: Props) {
  const [uiState, setUiState] = useState<State>('disconnected');
  const [fetchedSteps, setFetchedSteps] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  const fetchBackendStatus = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://cbiqa.dev.honeywellcloud.com/socialapi'}/api/googlefit/status`,
        { credentials: 'include' }
      );
      if (res.ok) setBackendStatus(await res.json() as BackendStatus);
    } catch {
      // non-critical
    }
  };

  const doSync = async () => {
    setIsSyncing(true);
    const result = await fetchStepsFromServer();
    setIsSyncing(false);

    if (result.needsReconnect) {
      setGoogleFitConnected(false);
      setUiState('needs_reconnect');
      return;
    }

    if (result.connected) {
      setFetchedSteps(result.steps);
      if (result.steps > 0) {
        onStepsFetched(result.steps);
      }
      setUiState('connected');
      fetchBackendStatus();
    } else {
      setUiState('error');
    }
  };

  // On mount: if previously connected, auto-sync
  useEffect(() => {
    if (isGoogleFitConnected()) {
      setUiState('fetching');
      doSync();
      fetchBackendStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    startGoogleFitAuth(returnUrl ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined));
  };

  const handleSync = () => {
    setUiState('fetching');
    doSync();
  };

  const handleDisconnect = async () => {
    await disconnectGoogleFit();
    setFetchedSteps(null);
    setBackendStatus(null);
    setUiState('disconnected');
  };

  if (uiState === 'disconnected' || uiState === 'needs_reconnect') {
    return (
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleConnect}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#fff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
          }}
        >
          <GoogleFitIcon />
          {uiState === 'needs_reconnect' ? 'Reconnect Google Fit' : 'Connect Google Fit'}
        </button>
        {uiState === 'needs_reconnect' && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', textAlign: 'center' }}>
            Session expired. Please reconnect.
          </p>
        )}
        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
          Auto-fill steps from Google Fit · iOS requires Google Fit app
        </p>
      </div>
    );
  }

  if (uiState === 'fetching') {
    return (
      <div
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: '#64748b',
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            border: '2.5px solid #a855f7',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'gfit-spin 0.8s linear infinite',
            flexShrink: 0,
          }}
        />
        Fetching steps from Google Fit…
        <style>{`@keyframes gfit-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span>Could not reach Google Fit</span>
        <button
          onClick={handleSync}
          style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  // connected state
  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '12px 16px',
        background: '#f0fdf4',
        border: '1.5px solid #bbf7d0',
        borderRadius: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✅</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>
              Google Fit
              {fetchedSteps !== null && fetchedSteps > 0 && (
                <span style={{ fontWeight: 400, color: '#15803d' }}>
                  {' '}· {fetchedSteps.toLocaleString()} steps auto-filled
                </span>
              )}
              {fetchedSteps === 0 && (
                <span style={{ fontWeight: 400, color: '#15803d' }}> · No steps yet today</span>
              )}
            </div>
            {backendStatus?.last_synced && (
              <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '2px' }}>
                Last synced: {formatRelativeTime(backendStatus.last_synced)}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              fontWeight: 600,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              opacity: isSyncing ? 0.5 : 1,
            }}
          >
            {isSyncing ? '…' : 'Sync'}
          </button>
          <button
            onClick={handleDisconnect}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 400, cursor: 'pointer', fontSize: '12px' }}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

function GoogleFitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#EA4335" opacity="0.15" />
      <path d="M12 5.5C8.41 5.5 5.5 8.41 5.5 12S8.41 18.5 12 18.5 18.5 15.59 18.5 12 15.59 5.5 12 5.5z" fill="none" stroke="#EA4335" strokeWidth="1.5" />
      <path d="M12 8v4l2.5 2.5" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
