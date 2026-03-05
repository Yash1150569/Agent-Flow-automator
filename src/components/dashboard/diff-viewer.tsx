'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DiffViewerProps {
  changelog: string;
}

export function DiffViewer({ changelog }: DiffViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-headline font-semibold">Changelog (v1 → v2)</h3>
        <Badge variant="secondary" className="px-3">Audit Log</Badge>
      </div>
      <ScrollArea className="h-[400px] w-full rounded-md border bg-card p-6 shadow-sm">
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary">
          {changelog.split('\n').map((line, i) => {
            if (line.startsWith('#')) {
              return <h4 key={i} className="text-primary font-bold mt-4 mb-2">{line.replace(/^#+\s/, '')}</h4>
            }
            if (line.startsWith('*') || line.startsWith('-')) {
              return <li key={i} className="text-sm mb-1 ml-4 list-disc">{line.replace(/^[*|-]\s/, '')}</li>
            }
            return <p key={i} className="text-sm text-muted-foreground mb-2">{line}</p>
          })}
        </div>
      </ScrollArea>
    </div>
  );
}