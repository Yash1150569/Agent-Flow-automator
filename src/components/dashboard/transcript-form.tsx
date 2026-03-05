'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { processDemoTranscript, processOnboardingTranscript } from '@/app/actions';
import { Loader2, Upload, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranscriptFormProps {
  accountId?: string;
  type: 'demo' | 'onboarding';
  onComplete?: (id: string) => void;
}

export function TranscriptForm({ accountId, type, onComplete }: TranscriptFormProps) {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transcript.trim()) return;

    setLoading(true);
    try {
      let result;
      if (type === 'demo') {
        result = await processDemoTranscript(transcript);
      } else {
        if (!accountId) throw new Error('No account ID provided');
        result = await processOnboardingTranscript(accountId, transcript);
      }

      if (result.success) {
        toast({
          title: "Processing Successful",
          description: type === 'demo' ? "Preliminary agent v1 created." : "Agent updated to v2 with changelog.",
        });
        setTranscript('');
        onComplete?.(result.accountId!);
      } else {
        toast({
          variant: "destructive",
          title: "Processing Failed",
          description: result.error,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="transcript" className="text-xs font-bold uppercase text-muted-foreground">
          {type === 'demo' ? 'Demo Call Transcript' : 'Onboarding Feedback / Transcript'}
        </Label>
        <Textarea 
          id="transcript"
          placeholder={type === 'demo' ? "Paste the demo call conversation here..." : "Paste onboarding call or form data here..."}
          className="min-h-[200px] font-mono text-sm resize-none bg-muted/30 focus-visible:ring-primary border-muted"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || !transcript.trim()}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing AI Pipeline...</>
        ) : (
          <>
            {type === 'demo' ? <MessageSquarePlus className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {type === 'demo' ? 'Generate v1 Configuration' : 'Upgrade to v2 Agent'}
          </>
        )}
      </Button>
    </form>
  );
}