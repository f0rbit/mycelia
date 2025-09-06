import { nextjs } from '@mycelia/ssr';
import type { Metadata } from 'next';

const { 
  MyceliaPage, 
  getMyceliaContent,
  generateContentMetadata,
  getMyceliaProvider
} = nextjs;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [];
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getMyceliaContent([`project`, id]);
  
  if (!content) {
    return {
      title: 'Project Not Found'
    };
  }
  
  return generateContentMetadata(content);
}

// The page component
export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  
  return <MyceliaPage params={Promise.resolve({ slug: ['project', id] })} />;
}