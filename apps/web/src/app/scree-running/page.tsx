import Header from '@/components/header';
import Block from '@/components/block';
import ScreeRunningHub from '@/components/scree-running-hub';

export default function ScreeRunningPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            Alpine Ridge Scramble &amp; Talus Descent Kinematics
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">High-Altitude Alpine Scramble Ridge Crest Scree Running Guide</h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Master technical alpine scree descents across 5 iconic corridors, calculate live descent velocity and ankle impact forces, and verify mandatory gaiter and rockfall protection hardware.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <ScreeRunningHub />
        </Block>
      </main>
    </>
  );
}
