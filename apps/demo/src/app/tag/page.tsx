import { MyceliaIndex } from '@mycelia/ssr/src/nextjs/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Tags',
  description: 'Browse content by tags and categories.',
};

export default function TagIndexPage() {
  return (
    <MyceliaIndex
      of="tag"
      title="All Tags"
      sortBy="title"
      showCounts={true}
    />
  );
}