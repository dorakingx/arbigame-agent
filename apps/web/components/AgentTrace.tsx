import { Bot, CheckCircle2, FileCode2, ShieldCheck } from "lucide-react";

interface AgentTraceProps {
  isGenerating: boolean;
}

export function AgentTrace({ isGenerating }: AgentTraceProps) {
  const steps = [
    {
      icon: <Bot size={16} aria-hidden="true" />,
      title: "Parsing prompt",
      body: "Extract theme, player count, entry fee, and target chain."
    },
    {
      icon: <ShieldCheck size={16} aria-hidden="true" />,
      title: "Selecting safe template",
      body: "Lock game logic to the audited-by-tests Dice Battle template."
    },
    {
      icon: <FileCode2 size={16} aria-hidden="true" />,
      title: "Preparing Arbitrum files",
      body: "Generate GameSpec, Solidity, frontend preview, tests, and deploy config."
    }
  ];

  return (
    <div className="rounded border border-white/12 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white/82">Agent pipeline</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-electric">
          <CheckCircle2 size={14} aria-hidden="true" />
          {isGenerating ? "Running" : "Ready"}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded border border-white/10 bg-ink/60 p-3">
            <div className="mb-2 text-electric">{step.icon}</div>
            <h3 className="text-sm font-bold text-white">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 text-white/55">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
