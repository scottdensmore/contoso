import Header from '@/components/header';
import Block from '@/components/block';
import FirstAidHub from '@/components/first-aid-hub';

export default function FirstAidPage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Wilderness Medicine & Field Emergency Response
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Wilderness First Aid & Medical Evacuation Advisor
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Interactive wilderness triage, clinical field treatment algorithms, expedition first aid kit recommendations, and satellite emergency evacuation protocols for backcountry adventurers.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <FirstAidHub />
        </Block>
      </main>
    </>
  );
}
