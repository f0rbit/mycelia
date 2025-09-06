import { MyceliaIndex } from '@mycelia/ssr/src/nextjs/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Tasks',
  description: 'View all tasks organized by status.',
};

export default function TaskIndexPage() {
  return (
    <MyceliaIndex
      of="task"
      title="All Tasks"
      sortBy="status"
      groupBy="status"
      showCounts={false}
    />
  );
}