import { loadExample } from '@/lib/content'
import { MyceliaContent } from '@/components/mycelia-content'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProjectPortfolioPage() {
  const { renderTree, stats, warnings, errors } = await loadExample('project-portfolio')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Portfolio</h1>
          <p className="text-muted-foreground">
            Projects like Chamber, Burning Blends, Arena, and GM-Server
          </p>
        </div>
        <div className="flex gap-2">
          <Card className="w-24">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stats.nodeCount}</div>
              <div className="text-xs text-muted-foreground">nodes</div>
            </CardContent>
          </Card>
          <Card className="w-24">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stats.edgeCount}</div>
              <div className="text-xs text-muted-foreground">edges</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {errors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Parse Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {errors.map((error, i) => (
                <li key={i} className="text-sm text-destructive">
                  {error.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-600">Warnings ({warnings.length})</CardTitle>
            <CardDescription>
              These warnings indicate custom semantic tags or extensions
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="max-w-none">
        <MyceliaContent tree={renderTree} />
      </div>
    </div>
  )
}