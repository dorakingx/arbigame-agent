import { Code2, Copy } from "lucide-react";

interface ContractCodeViewerProps {
  code: string;
}

export function ContractCodeViewer({ code }: ContractCodeViewerProps) {
  return (
    <section className="rounded border border-white/12 bg-[#0c101b]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded bg-violet text-white">
            <Code2 size={18} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Generated Solidity Template</h2>
            <p className="text-sm text-white/55">Fixed contract logic with safe prompt parameters</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(code)}
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/12 bg-white/[0.05] text-white/70 transition hover:border-electric hover:text-white"
          aria-label="Copy generated contract code"
          title="Copy generated contract code"
        >
          <Copy size={17} aria-hidden="true" />
        </button>
      </div>
      <pre className="max-h-[620px] overflow-auto p-5 text-xs leading-5 text-white/78">
        <code>{code}</code>
      </pre>
    </section>
  );
}
