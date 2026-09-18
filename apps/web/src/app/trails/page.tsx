'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Block from '@/components/block';
import TrailCatalog from '@/components/trail-catalog';
import TrailChecklist from '@/components/trail-checklist';
import { Trail } from '@/lib/trails';

export default function TrailsPage() {
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);

  const handleSelectTrail = (trail: Trail) => {
    setSelectedTrail(trail);
  };

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900" innerClassName="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Contoso Trail Guide & Outfitting
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Trail Activity & Weather Outfitting Guide
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Explore premier regional trails with live weather conditions and generate an interactive packing checklist tailored to your activity, season, and terrain.
          </p>
        </div>
      </Block>

      {/* Featured Regional Trails Section */}
      <Block innerClassName="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Featured Regional Trails
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select a destination to view live weather status, terrain details, and recommended gear outfit.
          </p>
        </div>

        <TrailCatalog
          selectedTrailId={selectedTrail?.id}
          onSelectTrail={handleSelectTrail}
        />
      </Block>

      {/* Custom Outfitting Checklist Section */}
      <Block outerClassName="bg-zinc-50 dark:bg-zinc-900/50" innerClassName="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Custom Outfitting Checklist
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Select your activity and season to generate your essential gear list, and check items off as you pack.
          </p>
        </div>

        <TrailChecklist selectedTrail={selectedTrail} />
      </Block>

      {/* Weather & Trail Safety Advice Section */}
      <Block innerClassName="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Weather & Trail Safety Advice
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Vital backcountry preparedness principles recommended by Contoso mountain guides.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-stone-900">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Layering & Thermoregulation
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Employ a strict 3-layer system: moisture-wicking base layer next to skin, insulating fleece or down mid-layer, and waterproof breathable shell. Never wear cotton on the trail.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-stone-900">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Hydration & Electrolyte Planning
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Plan for a minimum of 0.5 liters of water per hour of moderate exertion in mild weather, and 1 liter per hour in high heat or steep elevation gains. Replenish salts with electrolyte tablets.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-stone-900">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Leave No Trace & Safety
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Stay on designated trails to prevent fragile alpine erosion. Pack out all trash and food waste, respect wildlife at distance, and check current advisory alerts before stepping foot on trail.
            </p>
          </div>
        </div>
      </Block>
    </>
  );
}
