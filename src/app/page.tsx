'use client';

import { useState, useEffect } from 'react';
import { AccountData } from '@/lib/storage';
import { getAccounts } from '@/app/actions';
import { AccountList } from '@/components/dashboard/account-list';
import { TranscriptForm } from '@/components/dashboard/transcript-form';
import { JsonViewer } from '@/components/dashboard/json-viewer';
import { DiffViewer } from '@/components/dashboard/diff-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  Terminal, 
  Layers, 
  ChevronRight, 
  Activity, 
  PlusCircle, 
  Database,
  CloudLightning,
  LayoutDashboard
} from 'lucide-react';

export default function Dashboard() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDemoForm, setShowDemoForm] = useState(false);

  async function refreshAccounts() {
    const data = await getAccounts();
    setAccounts(data);
    if (selectedAccount) {
      const updated = data.find(a => a.account_id === selectedAccount.account_id);
      if (updated) setSelectedAccount(updated);
    }
  }

  useEffect(() => {
    refreshAccounts();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Toaster />
      
      {/* Sidebar */}
      <aside className="w-80 border-r bg-card/40 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-lg shadow-primary/20">
            <CloudLightning className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl tracking-tight leading-none">AgentFlow</h1>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-widest">Pipeline Orchestrator</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Button 
            onClick={() => {
              setShowDemoForm(true);
              setSelectedAccount(null);
            }} 
            variant={showDemoForm ? "secondary" : "default"}
            className="w-full justify-start font-semibold shadow-sm"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Demo Extraction
          </Button>

          <AccountList 
            accounts={accounts} 
            onSelect={(account) => {
              setSelectedAccount(account);
              setShowDemoForm(false);
            }} 
            selectedId={selectedAccount?.account_id}
          />
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground mb-2">
            <span>System Health</span>
            <span className="text-secondary flex items-center gap-1">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-medium">GenAI Nodes Ready</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F1F5F9]/50">
        <header className="h-16 border-b bg-background/50 backdrop-blur flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <LayoutDashboard className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span>Project Explorer</span>
            {selectedAccount && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-bold">{selectedAccount.company_name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-code text-[10px] px-2 py-0.5 border-muted-foreground/20">RET-90210-PROD</Badge>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {showDemoForm ? (
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-xl border-t-4 border-t-primary">
                <CardHeader className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Pipeline A: Demo Ingestion</span>
                  </div>
                  <CardTitle className="text-3xl font-headline font-bold">New Prospect Extraction</CardTitle>
                  <p className="text-muted-foreground">Submit a call transcript to generate the preliminary Account Memo and Agent configuration.</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <TranscriptForm 
                    type="demo" 
                    onComplete={(id) => {
                      refreshAccounts();
                      setShowDemoForm(false);
                    }} 
                  />
                </CardContent>
              </Card>
            </div>
          ) : selectedAccount ? (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-headline font-bold text-primary">{selectedAccount.company_name}</h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3">
                      ID: {selectedAccount.account_id}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" /> Account Artifacts & Retell Configuration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Tabs defaultValue="specs" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 mb-4 h-12">
                      <TabsTrigger value="specs" className="font-bold data-[state=active]:bg-background shadow-sm">
                        Configuration Versions
                      </TabsTrigger>
                      <TabsTrigger value="upgrade" className="font-bold data-[state=active]:bg-background shadow-sm">
                        Onboarding Update (Pipeline B)
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="specs" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="overflow-hidden border-muted h-[600px] flex flex-col shadow-sm">
                          <div className="bg-primary p-3 text-primary-foreground flex justify-between items-center shrink-0">
                            <span className="text-xs font-bold uppercase tracking-wider">Version 1: Preliminary</span>
                            <Badge variant="secondary" className="text-[10px]">Demo Spec</Badge>
                          </div>
                          <Tabs defaultValue="memo" className="flex-1 flex flex-col p-0">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 px-2 gap-4">
                              <TabsTrigger value="memo" className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-2 text-xs font-bold uppercase">Account Memo</TabsTrigger>
                              <TabsTrigger value="agent" className="border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-2 text-xs font-bold uppercase">Agent Spec</TabsTrigger>
                            </TabsList>
                            <TabsContent value="memo" className="flex-1 p-0 m-0 overflow-hidden"><JsonViewer data={selectedAccount.v1.memo} /></TabsContent>
                            <TabsContent value="agent" className="flex-1 p-0 m-0 overflow-hidden"><JsonViewer data={selectedAccount.v1.agent} /></TabsContent>
                          </Tabs>
                        </Card>

                        <Card className={`overflow-hidden border-muted h-[600px] flex flex-col shadow-sm ${!selectedAccount.v2 && 'opacity-50 grayscale'}`}>
                          <div className="bg-secondary p-3 text-secondary-foreground flex justify-between items-center shrink-0">
                            <span className="text-xs font-bold uppercase tracking-wider">Version 2: Updated</span>
                            <Badge variant="outline" className="text-[10px] bg-white/20 border-white/40">{selectedAccount.v2 ? 'Onboarding Ready' : 'Pending Upgrade'}</Badge>
                          </div>
                          {selectedAccount.v2 ? (
                            <Tabs defaultValue="memo" className="flex-1 flex flex-col p-0">
                              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 px-2 gap-4">
                                <TabsTrigger value="memo" className="border-b-2 border-transparent data-[state=active]:border-secondary rounded-none px-2 text-xs font-bold uppercase">Account Memo</TabsTrigger>
                                <TabsTrigger value="agent" className="border-b-2 border-transparent data-[state=active]:border-secondary rounded-none px-2 text-xs font-bold uppercase">Agent Spec</TabsTrigger>
                              </TabsList>
                              <TabsContent value="memo" className="flex-1 p-0 m-0 overflow-hidden"><JsonViewer data={selectedAccount.v2.memo} /></TabsContent>
                              <TabsContent value="agent" className="flex-1 p-0 m-0 overflow-hidden"><JsonViewer data={selectedAccount.v2.agent} /></TabsContent>
                            </Tabs>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                              <Terminal className="w-12 h-12 text-muted-foreground opacity-20" />
                              <div className="space-y-1">
                                <p className="font-bold">v2 Artifact Missing</p>
                                <p className="text-xs text-muted-foreground">Complete the onboarding pipeline to generate the production-ready agent revision.</p>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>

                      {selectedAccount.v2 && (
                        <DiffViewer changelog={selectedAccount.v2.changelog} />
                      )}
                    </TabsContent>

                    <TabsContent value="upgrade">
                      <Card className="shadow-lg border-secondary border-t-4">
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-5 h-5 text-secondary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Pipeline B: Account Onboarding</span>
                          </div>
                          <CardTitle className="text-2xl font-headline font-bold">Update Account Configuration</CardTitle>
                          <p className="text-sm text-muted-foreground">Submit feedback or an onboarding transcript to patch the existing v1 configuration. This will generate a v2 Memo, a revised Agent Spec, and a detailed changelog.</p>
                        </CardHeader>
                        <CardContent>
                          <TranscriptForm 
                            type="onboarding" 
                            accountId={selectedAccount.account_id}
                            onComplete={() => {
                              refreshAccounts();
                            }}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                <aside className="space-y-6">
                  <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Pipeline Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs opacity-70">Extraction Accuracy</span>
                        <span className="font-bold">98.2%</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs opacity-70">System Hygiene</span>
                        <span className="font-bold">Compliant</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs opacity-70">Integration Nodes</span>
                        <span className="font-bold">Active</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-[10px] italic leading-tight opacity-60">"Generated Retell prompts strictly adhere to requested business hour and after-hour protocols."</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Task Tracker</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 p-2 rounded-md">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        <span>Preliminary Config Created</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium p-2 border rounded-md">
                        <div className={`w-4 h-4 rounded-full border-2 ${selectedAccount.v2 ? 'bg-secondary border-secondary' : 'border-muted'} shrink-0`} />
                        <span>{selectedAccount.v2 ? 'Onboarding Updates Applied' : 'Pending Onboarding'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium p-2 border border-dashed rounded-md opacity-50">
                        <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0" />
                        <span>Manual QA Verification</span>
                      </div>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-card rounded-3xl shadow-2xl flex items-center justify-center text-primary/20 rotate-12">
                <CloudLightning className="w-12 h-12" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-headline font-bold">Welcome to AgentFlow Automator</h2>
                <p className="text-muted-foreground">Select an account from the sidebar or start a new demo extraction to see the AI-driven Retell agent configuration pipeline in action.</p>
              </div>
              <Button onClick={() => setShowDemoForm(true)} size="lg" className="rounded-full px-8 shadow-xl">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
