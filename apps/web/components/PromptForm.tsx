import { Send, Shuffle } from "lucide-react";

interface PromptFormProps {
  examples: string[];
  isGenerating?: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
}

export function PromptForm({ examples, isGenerating = false, prompt, onPromptChange, onGenerate }: PromptFormProps) {
  return (
    <div className="rounded border border-white/12 bg-white/[0.06] p-4 shadow-2xl backdrop-blur md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label htmlFor="game-prompt" className="text-sm font-semibold text-white/86">
          Prompt
        </label>
        <span className="rounded border border-ember/35 bg-ember/10 px-2.5 py-1 text-xs font-medium text-ember">
          Template-safe MVP
        </span>
      </div>
      <textarea
        id="game-prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded border border-white/12 bg-ink/80 p-4 text-sm leading-6 text-white outline-none transition focus:border-electric"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPromptChange(example)}
            className="inline-flex items-center gap-2 rounded border border-white/12 bg-white/[0.05] px-3 py-2 text-left text-xs text-white/72 transition hover:border-electric/60 hover:text-white"
          >
            <Shuffle size={14} aria-hidden="true" />
            {example}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-electric px-4 py-3 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-wait disabled:bg-white/40"
      >
        <Send size={17} aria-hidden="true" />
        {isGenerating ? "Agent is generating..." : "Generate Dice Battle"}
      </button>
    </div>
  );
}
