'use client';

import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SemanticNodeRendererProps {
  node: any;
  nodeId: string;
  breadcrumbs: Array<{ id: string; title: string; path: string }>;
  backlinks: Array<{ node: any; path: string }>;
  childNodes: any[];
  referencedNodes: any[];
  htmlContent?: string;
}

export function SemanticNodeRenderer({
  node,
  nodeId,
  breadcrumbs,
  backlinks,
  childNodes,
  referencedNodes,
  htmlContent
}: SemanticNodeRendererProps) {
  // Render based on node type
  const nodeType = node.type?.toLowerCase() || 'unknown';
  
  switch (nodeType) {
    case 'project':
      return <ProjectRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'person':
      return <PersonRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'skill':
      return <SkillRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'task':
      return <TaskRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'essay':
      return <EssayRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'research':
      return <ResearchRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'note':
      return <NoteRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'portfolio':
      return <PortfolioRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    case 'tag':
      return <TagRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
    default:
      return <GenericRenderer {...{ node, nodeId, breadcrumbs, backlinks, childNodes, referencedNodes, htmlContent }} />;
  }
}

// Project Component - Portfolio style
function ProjectRenderer({ node, childNodes, referencedNodes }: SemanticNodeRendererProps) {
  const skills = childNodes.filter(n => n.type === 'skill');
  const tasks = childNodes.filter(n => n.type === 'task');
  const collaborators = childNodes.filter(n => n.type === 'collaborator');
  const tags = childNodes.filter(n => n.type === 'tag');
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{node.attributes?.title || node.id}</h1>
            <p className="text-xl text-gray-600">{node.attributes?.description}</p>
          </div>
          <StatusBadge status={node.attributes?.status} />
        </div>
        
        {/* Project metadata */}
        <div className="flex flex-wrap gap-4 mt-4">
          {node.attributes?.startDate && (
            <div className="text-sm text-gray-600">
              📅 {new Date(node.attributes.startDate).getFullYear()}
              {node.attributes?.endDate && ` - ${new Date(node.attributes.endDate).getFullYear()}`}
            </div>
          )}
          {node.attributes?.url && (
            <a href={node.attributes.url} className="text-sm text-blue-600 hover:underline">
              🔗 View Project
            </a>
          )}
          {node.attributes?.github && (
            <a href={node.attributes.github} className="text-sm text-blue-600 hover:underline">
              💻 Source Code
            </a>
          )}
        </div>
      </div>
      
      {/* Tech Stack */}
      {skills.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill.id} variant="secondary">
                  {skill.attributes?.name || skill.id}
                  {skill.attributes?.level && (
                    <span className="ml-1 text-xs opacity-75">({skill.attributes.level})</span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tasks/Features */}
      {tasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex items-start gap-2">
                  <TaskStatusIcon status={task.attributes?.status} />
                  <div className="flex-1">
                    <a href={`/node/${task.id}`} className="font-medium hover:text-blue-600">
                      {task.attributes?.title || task.id}
                    </a>
                    {task.attributes?.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.attributes.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Collaborators */}
      {collaborators.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {collaborators.map(collab => (
                <div key={collab.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {collab.attributes?.name?.[0] || '?'}
                  </div>
                  <div>
                    <a href={`/node/${collab.attributes?.to || collab.id}`} className="font-medium hover:text-blue-600">
                      {collab.attributes?.name || collab.attributes?.to || collab.id}
                    </a>
                    {collab.attributes?.role && (
                      <div className="text-xs text-gray-600">{collab.attributes.role}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {tags.map(tag => (
            <Badge key={tag.id} variant="outline">
              #{tag.attributes?.value || tag.id}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Person Component - Profile style
function PersonRenderer({ node, childNodes, backlinks }: SemanticNodeRendererProps) {
  const projects = backlinks.filter(b => b.node.type === 'project');
  const skills = childNodes.filter(n => n.type === 'skill');
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {node.attributes?.name?.[0] || node.id[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{node.attributes?.name || node.id}</h1>
          <p className="text-xl text-gray-600 mb-2">{node.attributes?.role || node.attributes?.title}</p>
          {node.attributes?.location && (
            <p className="text-gray-600">📍 {node.attributes.location}</p>
          )}
          <div className="flex gap-4 mt-3">
            {node.attributes?.github && (
              <a href={node.attributes.github} className="text-blue-600 hover:underline">GitHub</a>
            )}
            {node.attributes?.linkedin && (
              <a href={node.attributes.linkedin} className="text-blue-600 hover:underline">LinkedIn</a>
            )}
            {node.attributes?.website && (
              <a href={node.attributes.website} className="text-blue-600 hover:underline">Website</a>
            )}
          </div>
        </div>
      </div>
      
      {/* Bio */}
      {(node.attributes?.bio || node.content) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{node.attributes?.bio || node.content}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Skills */}
      {skills.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center justify-between">
                  <span>{skill.attributes?.name || skill.id}</span>
                  {skill.attributes?.level && (
                    <SkillLevel level={skill.attributes.level} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {projects.map(({ node: project, path }) => (
                <a key={project.id} href={path} className="block p-4 border rounded-lg hover:border-blue-400 transition-colors">
                  <h3 className="font-semibold">{project.attributes?.title || project.id}</h3>
                  {project.attributes?.description && (
                    <p className="text-sm text-gray-600 mt-1">{project.attributes.description}</p>
                  )}
                  <StatusBadge status={project.attributes?.status} className="mt-2" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Skill Component - Focused display
function SkillRenderer({ node, backlinks }: SemanticNodeRendererProps) {
  const projects = backlinks.filter(b => b.node.type === 'project');
  const people = backlinks.filter(b => b.node.type === 'person');
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{node.attributes?.name || node.id}</h1>
        {node.attributes?.level && (
          <div className="flex justify-center mt-4">
            <SkillLevel level={node.attributes.level} size="large" />
          </div>
        )}
      </div>
      
      {node.attributes?.description && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-gray-700">{node.attributes.description}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Used in Projects */}
      {projects.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Used in Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.map(({ node: project, path }) => (
                <a key={project.id} href={path} className="block p-3 rounded hover:bg-gray-50">
                  <div className="font-medium">{project.attributes?.title || project.id}</div>
                  <div className="text-sm text-gray-600">{project.attributes?.description}</div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* People with this skill */}
      {people.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {people.map(({ node: person, path }) => (
                <a key={person.id} href={path} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
                  {person.attributes?.name || person.id}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Task Component
function TaskRenderer({ node }: SemanticNodeRendererProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold">{node.attributes?.title || node.id}</h1>
          <StatusBadge status={node.attributes?.status || 'pending'} />
        </div>
      </div>
      
      {node.attributes?.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700">{node.attributes.description}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Task metadata */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {node.attributes?.priority && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Priority</CardDescription>
            </CardHeader>
            <CardContent>
              <PriorityBadge priority={node.attributes.priority} />
            </CardContent>
          </Card>
        )}
        {node.attributes?.assignee && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Assignee</CardDescription>
            </CardHeader>
            <CardContent>
              {node.attributes.assignee}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Essay/Article Component
function EssayRenderer({ node, htmlContent }: SemanticNodeRendererProps) {
  return (
    <article className="max-w-3xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{node.attributes?.title || node.id}</h1>
        {node.attributes?.date && (
          <time className="text-gray-600">{new Date(node.attributes.date).toLocaleDateString()}</time>
        )}
      </header>
      
      {htmlContent ? (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <div className="prose prose-lg max-w-none">
          <p>{node.content || node.value || 'No content available'}</p>
        </div>
      )}
    </article>
  );
}

// Research Component
function ResearchRenderer({ node, childNodes }: SemanticNodeRendererProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{node.attributes?.title || node.id}</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          {node.attributes?.type && <Badge variant="outline">{node.attributes.type}</Badge>}
          {node.attributes?.status && <StatusBadge status={node.attributes.status} />}
        </div>
      </div>
      
      {node.content && (
        <Card>
          <CardContent className="pt-6 prose max-w-none">
            <p>{node.content}</p>
          </CardContent>
        </Card>
      )}
      
      {childNodes.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {childNodes.map(child => (
                <li key={child.id}>
                  <a href={`/node/${child.id}`} className="text-blue-600 hover:underline">
                    {child.attributes?.title || child.attributes?.name || child.id}
                  </a>
                  {child.type && <span className="text-gray-500 text-sm ml-2">({child.type})</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Note Component - Simple card
function NoteRenderer({ node }: SemanticNodeRendererProps) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{node.attributes?.title || 'Note'}</CardTitle>
          {node.attributes?.date && (
            <CardDescription>{new Date(node.attributes.date).toLocaleDateString()}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">
            {node.content || node.value || node.attributes?.content || 'No content'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Portfolio Component
function PortfolioRenderer({ node, childNodes }: SemanticNodeRendererProps) {
  const projects = childNodes.filter(n => n.type === 'project');
  
  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">{node.attributes?.title || node.id}</h1>
        {node.attributes?.description && (
          <p className="text-xl text-gray-600">{node.attributes.description}</p>
        )}
        <StatusBadge status={node.attributes?.status} className="mt-4" />
      </header>
      
      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <a href={`/node/${project.id}`} className="hover:text-blue-600">
                  {project.attributes?.title || project.id}
                </a>
              </CardTitle>
              <CardDescription>{project.attributes?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge status={project.attributes?.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Tag Component
function TagRenderer({ node, backlinks }: SemanticNodeRendererProps) {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <Badge variant="outline" className="text-2xl px-4 py-2">
          #{node.attributes?.value || node.id}
        </Badge>
      </div>
      
      {backlinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tagged Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backlinks.map(({ node: item, path }) => (
                <a key={item.id} href={path} className="block p-3 rounded hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.attributes?.title || item.attributes?.name || item.id}</div>
                      <div className="text-sm text-gray-600">{item.type}</div>
                    </div>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Generic fallback renderer
function GenericRenderer({ node, nodeId, childNodes, referencedNodes, htmlContent }: SemanticNodeRendererProps) {
  const title = node.attributes?.title || node.attributes?.name || node.attributes?.value || nodeId;
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-2">{node.type}</Badge>
        <h1 className="text-3xl font-bold">{title}</h1>
        {node.attributes?.description && (
          <p className="text-gray-600 mt-2">{node.attributes.description}</p>
        )}
      </div>
      
      {/* HTML Content */}
      {htmlContent && (
        <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      )}
      
      {/* Raw content fallback */}
      {!htmlContent && (node.content || node.value) && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap">{node.content || node.value}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Attributes */}
      {node.attributes && Object.keys(node.attributes).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {Object.entries(node.attributes).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-gray-500">{key}</dt>
                  <dd className="font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
      
      {/* Child nodes */}
      {childNodes.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {childNodes.map(child => (
                <a key={child.id} href={`/node/${child.id}`} className="block p-2 rounded hover:bg-gray-50">
                  {child.attributes?.title || child.attributes?.name || child.id}
                  <Badge variant="outline" className="ml-2 text-xs">{child.type}</Badge>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Referenced nodes */}
      {referencedNodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referencedNodes.map(ref => (
                <a key={ref.id} href={`/node/${ref.id}`} className="block p-2 rounded hover:bg-gray-50">
                  {ref.attributes?.title || ref.attributes?.name || ref.id}
                  <Badge variant="outline" className="ml-2 text-xs">{ref.type}</Badge>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Components
function StatusBadge({ status, className = "" }: { status?: string; className?: string }) {
  if (!status) return null;
  
  const getVariant = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'published':
        return 'default';
      case 'development':
      case 'wip':
      case 'in-progress':
        return 'secondary';
      case 'planned':
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  return <Badge variant={getVariant()} className={className}>{status}</Badge>;
}

function SkillLevel({ level, size = "normal" }: { level: string; size?: "normal" | "large" }) {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(level.toLowerCase());
  const dotSize = size === "large" ? "w-3 h-3" : "w-2 h-2";
  
  return (
    <div className="flex gap-1">
      {levels.map((_, i) => (
        <div 
          key={i} 
          className={`${dotSize} rounded-full ${i <= currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}

function TaskStatusIcon({ status }: { status?: string }) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return <span className="text-green-500">✓</span>;
    case 'in-progress':
      return <span className="text-blue-500">●</span>;
    case 'blocked':
      return <span className="text-red-500">✕</span>;
    default:
      return <span className="text-gray-400">○</span>;
  }
}

function PriorityBadge({ priority }: { priority: string }) {
  const getColor = () => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-sm border ${getColor()}`}>
      {priority}
    </span>
  );
}