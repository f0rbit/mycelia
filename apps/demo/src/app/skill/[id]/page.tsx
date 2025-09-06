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
  const provider = getMyceliaProvider();
  const nodesByType = await provider.getNodesByType?.();
  
  if (!nodesByType || !nodesByType.skill) {
    return [];
  }
  
  return nodesByType.skill.map((node: any) => {
    const cleanId = node.hierarchicalPath?.replace('/skill/', '') || node.id.replace('skill-', '');
    return { id: cleanId };
  });
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