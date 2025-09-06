import { nextjs } from '@mycelia/ssr';
import type { Metadata } from 'next';

const { 
  MyceliaPage, 
  generateMyceliaStaticParams, 
  getMyceliaContent,
  generateContentMetadata 
} = nextjs;

// Props interface for the page
interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

// Generate static params for all content
export async function generateStaticParams() {
  return await generateMyceliaStaticParams();
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getMyceliaContent(slug);
  
  if (!content) {
    return {
      title: 'Page Not Found'
    };
  }
  
  return generateContentMetadata(content);
}

// The page component
export default async function CatchAllPage({ params }: PageProps) {
  return <MyceliaPage params={params} />;
}