import React from 'react';

export function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  let badgeClass = 'badge-blue';
  
  if (['analyzed', 'active', 'healthy', 'ready', 'solved'].includes(s)) {
    badgeClass = 'badge-green';
  } else if (['pending', 'under review', 'medium'].includes(s)) {
    badgeClass = 'badge-amber';
  } else if (['critical', 'high', 'error', 'danger'].includes(s)) {
    badgeClass = 'badge-red';
  } else if (['demo', 'simulated'].includes(s)) {
    badgeClass = 'badge-purple';
  } else if (['video', 'audio', 'image'].includes(s)) {
    badgeClass = 'badge-cyan';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status}
    </span>
  );
}
