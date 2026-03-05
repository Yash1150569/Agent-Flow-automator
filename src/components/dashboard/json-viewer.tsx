'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonViewerProps {
  data: any;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="px-4 py-2 border-b bg-muted/30 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </div>
      )}
      <ScrollArea className="flex-1">
        <pre className="p-4 text-xs font-code leading-relaxed text-foreground/80 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </ScrollArea>
    </div>
  );
}