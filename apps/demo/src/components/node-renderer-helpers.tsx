import React from 'react';
import { Badge } from './ui/badge';

// Helper components used across multiple renderers
export function StatusBadge({ status, className = '' }: { status?: string; className?: string }) {
  if (!status) return null;
  
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    completed: 'default',
    'in-progress': 'secondary',
    active: 'secondary',
    planned: 'outline',
    archived: 'outline'
  };
  
  return (
    <Badge variant={variants[status] || 'outline'} className={className}>
      {status.replace('-', ' ')}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };
  
  return (
    <Badge className={colors[priority] || 'bg-gray-100 text-gray-800'}>
      {priority}
    </Badge>
  );
}

export function TaskStatusIcon({ status }: { status?: string }) {
  const icons: Record<string, string> = {
    completed: '✅',
    'in-progress': '🔄',
    pending: '⏳',
    blocked: '🚫'
  };
  
  return <span className="text-lg">{icons[status || 'pending'] || '📝'}</span>;
}

export function ProficiencyBar({ level }: { level: string }) {
  const levels: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  };
  
  const percentage = levels[level] || 50;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}