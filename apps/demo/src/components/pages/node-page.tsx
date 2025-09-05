// Node page router - determines which specialized component to use
import type { NodePageProps } from './shared'

// Import specialized page components
import { PortfolioPage } from './portfolio-page'
import { ProjectPage } from './project-page'
import { EssayPage } from './essay-page'
import { PersonPage } from './person-page'
import { TaskPage } from './task-page'
import { NotePage } from './note-page'
import { ResearchPage } from './research-page'
import { SkillPage } from './skill-page'
import { TagPage } from './tag-page'
import { BookPage } from './book-page'
import { AchievementPage } from './achievement-page'
import { DefaultNodePage } from './default-page'

export function NodePage(props: NodePageProps) {
  const { node } = props
  
  // Route to specialized component based on node type or specific IDs
  switch (node.type) {
    case 'portfolio':
      return <PortfolioPage {...props} />
    
    case 'project':
      return <ProjectPage {...props} />
    
    case 'essay':
      return <EssayPage {...props} />
    
    case 'person':
      return <PersonPage {...props} />
    
    case 'task':
      return <TaskPage {...props} />
    
    case 'note':
      return <NotePage {...props} />
    
    case 'research':
      return <ResearchPage {...props} />
    
    case 'skill':
      return <SkillPage {...props} />
    
    case 'tag':
      return <TagPage {...props} />
    
    case 'book':
      return <BookPage {...props} />
    
    case 'achievement':
      return <AchievementPage {...props} />
    
    default:
      return <DefaultNodePage {...props} />
  }
}