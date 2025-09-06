import { MyceliaIndex } from '@mycelia/ssr/src/nextjs/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Skills',
  description: 'A comprehensive list of all skills and technologies.',
};

export default function SkillIndexPage() {
  return (
    <MyceliaIndex
      of="skill"
      title="All Skills"
      sortBy="title"
      groupBy="category"
      showCounts={false}
    />
  );
}