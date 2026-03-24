import { CheckCircle, XCircle, Loader2, Circle, ChevronRight } from 'lucide-react';

interface OrchestrationJob {
  id: string;
  step: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying';
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

interface Props {
  jobs: OrchestrationJob[];
}

const STEP_LABELS: Record<string, string> = {
  validate: 'Validate Submission',
  match_template: 'Match Template',
  discover_assets: 'Discover Assets',
  create_audience: 'Create Audience',
  create_braze_draft: 'Create Braze Draft',
};

const STEP_ORDER = ['validate', 'match_template', 'discover_assets', 'create_audience', 'create_braze_draft'];

function StepIcon({ status }: { status: OrchestrationJob['status'] }) {
  switch (status) {
    case 'success': return <CheckCircle className="w-5 h-5 text-success-600" />;
    case 'failed': return <XCircle className="w-5 h-5 text-danger-600" />;
    case 'running': return <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />;
    case 'retrying': return <Loader2 className="w-5 h-5 text-warn-500 animate-spin" />;
    default: return <Circle className="w-5 h-5 text-surface-300" />;
  }
}

function StepBg({ status }: { status: OrchestrationJob['status'] }) {
  switch (status) {
    case 'success': return 'bg-success-50 border-success-200';
    case 'failed': return 'bg-danger-50 border-danger-200';
    case 'running': return 'bg-brand-50 border-brand-200';
    case 'retrying': return 'bg-warn-50 border-warn-200';
    default: return 'bg-surface-50 border-surface-200';
  }
}

// Demo mode: generate mock jobs showing pipeline progress
const DEMO_JOBS: OrchestrationJob[] = [
  { id: 'j1', step: 'validate', status: 'success', startedAt: '2026-03-20T10:05:01Z', completedAt: '2026-03-20T10:05:02Z' },
  { id: 'j2', step: 'match_template', status: 'success', startedAt: '2026-03-20T10:05:02Z', completedAt: '2026-03-20T10:05:03Z' },
  { id: 'j3', step: 'discover_assets', status: 'success', startedAt: '2026-03-20T10:05:03Z', completedAt: '2026-03-20T10:05:05Z' },
  { id: 'j4', step: 'create_audience', status: 'success', startedAt: '2026-03-20T10:05:05Z', completedAt: '2026-03-20T10:05:08Z' },
  { id: 'j5', step: 'create_braze_draft', status: 'success', startedAt: '2026-03-20T10:05:08Z', completedAt: '2026-03-20T10:05:12Z' },
];

export function OrchestrationPipeline({ jobs }: Props) {
  const displayJobs = jobs.length > 0 ? jobs : DEMO_JOBS;

  // Build a map of step -> job
  const jobMap = new Map<string, OrchestrationJob>();
  for (const job of displayJobs) {
    jobMap.set(job.step, job);
  }

  const allSuccess = STEP_ORDER.every((s) => jobMap.get(s)?.status === 'success');
  const hasFailed = STEP_ORDER.some((s) => jobMap.get(s)?.status === 'failed');

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider">Orchestration Pipeline</h2>
        {allSuccess && (
          <span className="badge badge-success text-[10px]">Complete</span>
        )}
        {hasFailed && (
          <span className="badge badge-danger text-[10px]">Failed</span>
        )}
      </div>

      <div className="space-y-2">
        {STEP_ORDER.map((step, i) => {
          const job = jobMap.get(step);
          const status = job?.status ?? 'pending';

          return (
            <div key={step}>
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${StepBg({ status })}`}>
                <StepIcon status={status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900">
                    {STEP_LABELS[step] ?? step}
                  </div>
                  {job?.errorMessage && (
                    <p className="text-xs text-danger-600 mt-0.5">{job.errorMessage}</p>
                  )}
                  {job?.completedAt && job?.startedAt && (
                    <span className="text-[10px] text-surface-400">
                      {Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${
                  status === 'success' ? 'text-success-600'
                  : status === 'failed' ? 'text-danger-600'
                  : status === 'running' ? 'text-brand-600'
                  : 'text-surface-400'
                }`}>
                  {status}
                </span>
              </div>
              {i < STEP_ORDER.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ChevronRight className="w-3 h-3 text-surface-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
