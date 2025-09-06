import { MyceliaIndex } from '@mycelia/ssr/src/nextjs/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Projects',
  description: 'A comprehensive list of all projects in the portfolio.',
};

export default function ProjectIndexPage() {
  return (
    <MyceliaIndex
      of="project"
      title="All Projects"
      sortBy="status"
      groupBy="status"
      showCounts={false}
    />
  );
}