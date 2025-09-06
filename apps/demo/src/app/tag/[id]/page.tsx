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
  
  if (!nodesByType || !nodesByType.tag) {
    return [];
  }
  
  return nodesByType.tag.map((node: any) => {
    const cleanId = node.hierarchicalPath?.replace('/tag/', '') || node.id.replace('tag-', '');
    return { id: cleanId };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getMyceliaContent([`tag`, id]);
  
  if (!content) {
    return {
      title: 'Tag Not Found'
    };
  }
  
  return generateContentMetadata(content);
}

export default async function TagPage({ params }: PageProps) {
  const { id } = await params;
  
  return <MyceliaPage params={Promise.resolve({ slug: ['tag', id] })} />;
}