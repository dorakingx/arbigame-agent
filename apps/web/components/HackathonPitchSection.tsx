import { Blocks, Rocket, ShieldCheck } from "lucide-react";

export function HackathonPitchSection() {
  const points = [
    {
      icon: <Rocket size={20} aria-hidden="true" />,
      title: "Buildathon-ready",
      body: "A crisp demo flow from prompt to spec, contract, preview, tests, and Arbitrum Sepolia deployment."
    },
    {
      icon: <Blocks size={20} aria-hidden="true" />,
      title: "Arbitrum-native",
      body: "Default chain settings target Arbitrum Sepolia with ETH as the native currency and chain ID 421614."
    },
    {
      icon: <ShieldCheck size={20} aria-hidden="true" />,
      title: "Template-safe",
      body: "The MVP avoids arbitrary contract generation and only changes safe Dice Battle parameters."
    }
  ];

  return (
    <section className="rounded border border-white/12 bg-white/[0.06] p-5">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-electric">Contest context</p>
      <h2 className="text-3xl font-black">Built for Arbitrum Open House London Buildathon</h2>
      <p className="mt-4 leading-7 text-white/70">
        ArbiGame Agent helps creators and developers rapidly prototype onchain games for the Arbitrum ecosystem. It turns
        natural-language game ideas into safe, template-based smart contracts, frontend previews, and deployment-ready
        project files.
      </p>

      <div className="mt-6 grid gap-3">
        {points.map((point) => (
          <article key={point.title} className="rounded border border-white/10 bg-ink/65 p-4">
            <div className="mb-3 text-electric">{point.icon}</div>
            <h3 className="font-bold text-white">{point.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">{point.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
