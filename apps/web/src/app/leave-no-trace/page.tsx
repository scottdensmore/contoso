import Header from '@/components/header';
import Block from '@/components/block';
import LeaveNoTraceHub from '@/components/leave-no-trace-hub';

export default function LeaveNoTracePage() {
  return (
    <>
      <Header />
      <Block outerClassName="bg-zinc-950" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Wilderness Ethics &amp; Waste Management
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Leave No Trace & Wilderness Waste Regulations
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-zinc-300 sm:text-lg">
            Essential Leave No Trace principles, PNW wilderness zone waste mandates, food attractant rules, and pack-out gear calculators to keep our backcountry pristine.
          </p>
        </div>
      </Block>

      <main className="py-12">
        <Block>
          <LeaveNoTraceHub />
        </Block>
      </main>
    </>
  );
}
