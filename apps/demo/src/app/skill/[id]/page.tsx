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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getMyceliaContent([`skill`, id]);
  
  if (!content) {
    return {
      title: 'Skill Not Found'
    };
  }
  
  return generateContentMetadata(content);
}

export default async function SkillPage({ params }: PageProps) {
  const { id } = await params;
  
  return <MyceliaPage params={Promise.resolve({ slug: ['skill', id] })} />;
}