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
  
  if (!nodesByType || !nodesByType.task) {
    return [];
  }
  
  return nodesByType.task.map((node: any) => {
    const cleanId = node.hierarchicalPath?.replace('/task/', '') || node.id.replace('task-', '');
    return { id: cleanId };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getMyceliaContent([`task`, id]);
  
  if (!content) {
    return {
      title: 'Task Not Found'
    };
  }
  
  return generateContentMetadata(content);
}

export default async function TaskPage({ params }: PageProps) {
  const { id } = await params;
  
  return <MyceliaPage params={Promise.resolve({ slug: ['task', id] })} />;
}