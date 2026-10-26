'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  Scissors,
  User,
  Heart,
  Smile,
  AlertCircle
} from 'lucide-react';
import {
  CharacterType,
  BOY_HAIRSTYLES,
  GIRL_HAIRSTYLES,
  APPROVED_HAIRSTYLES,
  ChibiCharacterConfig
} from '@classverse/shared';

// Dynamically import Three.js 3D Preview Canvas to prevent SSR issues
const ChibiPreviewCanvas = dynamic(
  () => import('@/components/character/ChibiPreviewCanvas').then((m) => m.ChibiPreviewCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-medium">Loading 3D Chibi Preview...</p>
      </div>
    )
  }
);

function CharacterSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Route context
  const classroomId = searchParams.get('classroomId') || searchParams.get('id') || 'bio-101';
  const rawRole = searchParams.get('role') || 'student';
  const displayName = searchParams.get('name') || 'Student Alex';
  const avatarColor = searchParams.get('color') || '#10B981';
  const rawNameId = displayName ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '_') : '';
  const defaultId = rawNameId.startsWith('student_') ? rawNameId : (rawNameId ? `student_${rawNameId}` : '');
  const userId = searchParams.get('uid') || defaultId || `usr_${Math.random().toString(36).substring(2, 9)}`;

  // Selection states
  const [characterType, setCharacterType] = useState<CharacterType>('boy');
  const [selectedHairstyle, setSelectedHairstyle] = useState<string>('boy_spiky_anime');
  const [previewAnimation, setPreviewAnimation] = useState<'idle' | 'wave' | 'celebrate' | 'walk'>('idle');

  // Network & save status
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Active hairstyles based on selected gender
  const currentHairstyles = characterType === 'boy' ? BOY_HAIRSTYLES : GIRL_HAIRSTYLES;

  // On mount, check if student already has a saved character
  useEffect(() => {
    let isMounted = true;
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:2567';

    async function checkSavedCharacter() {
      try {
        const res = await fetch(`${serverUrl}/api/profiles/${userId}/character`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasCharacter && data.character && isMounted) {
            setCharacterType(data.character.characterType);
            setSelectedHairstyle(data.character.hairstyleId);
          }
        }
      } catch (err) {
        console.warn('[Character Selection] Could not fetch saved character:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }

    checkSavedCharacter();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Switch gender and automatically update to valid default hairstyle
  const handleGenderChange = (gender: CharacterType) => {
    setCharacterType(gender);
    if (gender === 'boy') {
      setSelectedHairstyle('boy_spiky_anime');
    } else {
      setSelectedHairstyle('girl_twin_tails');
    }
  };

  // Save Character & Enter Classroom
  const handleSaveAndEnter = async () => {
    setErrorMessage(null);

    // Client-side validation against approved hairstyles
    const allowed = APPROVED_HAIRSTYLES[characterType];
    if (!allowed || !allowed.includes(selectedHairstyle)) {
      setErrorMessage(`Please select a valid hairstyle for ${characterType}.`);
      return;
    }

    setIsSaving(true);
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:2567';

    try {
      const response = await fetch(`${serverUrl}/api/profiles/${userId}/character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterType,
          hairstyleId: selectedHairstyle,
          displayName,
          role: rawRole
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save character configuration.');
      }

      const savedData = await response.json();
      console.log('[Character Selection] Saved character successfully:', savedData);

      // Trigger celebratory animation briefly
      setPreviewAnimation('celebrate');

      setTimeout(() => {
        // Redirect to classroom with character parameters
        const query = new URLSearchParams({
          role: rawRole,
          name: displayName,
          color: avatarColor,
          uid: userId,
          char: characterType,
          hair: selectedHairstyle
        });
        router.push(`/classroom/${classroomId}?${query.toString()}`);
      }, 700);
    } catch (err: any) {
      console.error('[Character Selection Error]', err);
      setErrorMessage(err.message || 'Unable to save character. Please try again.');
      setIsSaving(false);
    }
  };

  const isFormValid =
    (characterType === 'boy' || characterType === 'girl') &&
    APPROVED_HAIRSTYLES[characterType]?.includes(selectedHairstyle);

  if (initialLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <h2 className="text-sm font-semibold tracking-wide text-slate-300">Loading Character Studio...</h2>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-y-auto bg-slate-950 text-white flex flex-col select-none">
      {/* ========================================================
          1. HEADER SECTION
         ======================================================== */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30">
            CV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">CLASSVERSE</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                Avatar Creator
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Classroom: <span className="text-slate-200 font-medium uppercase">{classroomId}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">{displayName}</span>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN STUDIO SECTION
         ======================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left / Center: Interactive 3D Chibi Preview (7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 relative overflow-hidden shadow-2xl min-h-[420px] lg:min-h-0">
          {/* Subtle Ambient Studio Background Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-1" />

          {/* Headline & Subtitle */}
          <div className="relative z-10 mb-2">
            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Create Your Classroom Character</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your character and hairstyle before entering your classroom.
            </p>
          </div>

          {/* Interactive 3D Canvas */}
          <div className="flex-1 w-full relative rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/80">
            <ChibiPreviewCanvas
              gender={characterType}
              hairstyleId={selectedHairstyle}
              animation={previewAnimation}
            />

            {/* Animation Pose Switchers */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setPreviewAnimation('idle')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  previewAnimation === 'idle'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Idle
              </button>
              <button
                onClick={() => setPreviewAnimation('wave')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  previewAnimation === 'wave'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wave
              </button>
              <button
                onClick={() => setPreviewAnimation('celebrate')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  previewAnimation === 'celebrate'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Celebrate
              </button>
            </div>
          </div>
        </div>

        {/* Right: Customization Controls (5 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="space-y-5">
            {/* 1. Character Gender Choice (Boy / Girl) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                1. Select Character
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* BOY CARD */}
                <button
                  type="button"
                  onClick={() => handleGenderChange('boy')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    characterType === 'boy'
                      ? 'bg-sky-600/20 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg">
                    👦
                  </div>
                  <div className="text-center">
                    <span className="font-extrabold text-sm block">BOY</span>
                    <span className="text-[10px] text-slate-400">School Polo & Trousers</span>
                  </div>
                  {characterType === 'boy' && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* GIRL CARD */}
                <button
                  type="button"
                  onClick={() => handleGenderChange('girl')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    characterType === 'girl'
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
                    👧
                  </div>
                  <div className="text-center">
                    <span className="font-extrabold text-sm block">GIRL</span>
                    <span className="text-[10px] text-slate-400">School Blouse & Skirt</span>
                  </div>
                  {characterType === 'girl' && (
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Hairstyle Selection (6 choices in 3-column grid) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  2. Select Hairstyle (6 Choices)
                </label>
                <span className="text-[11px] text-indigo-400 font-semibold capitalize">
                  {characterType} Hairstyle
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {currentHairstyles.map((hair) => {
                  const isSelected = selectedHairstyle === hair.id;
                  return (
                    <button
                      key={hair.id}
                      type="button"
                      onClick={() => setSelectedHairstyle(hair.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500 text-white ring-2 ring-indigo-500/40 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        <Scissors className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold truncate max-w-full leading-tight">
                        {hair.name}
                      </span>
                      <span className="text-[9px] text-slate-400 line-clamp-1 leading-none">
                        {hair.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Uniform Note */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Standard school uniform ({characterType === 'boy' ? 'White Polo & Navy Shorts' : 'White Blouse & Pleated Skirt'}) is permanent and code-compliant.
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================
              3. ACTION BUTTON SECTION
             ======================================================== */}
          <div>
            <button
              onClick={handleSaveAndEnter}
              disabled={!isFormValid || isSaving}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
                isFormValid && !isSaving
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Character & Entering Classroom...</span>
                </>
              ) : (
                <>
                  <span>Save Character & Enter Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Your cute chibi avatar will represent you in the 3D virtual classroom.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CharacterSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400 font-medium">Loading Character Creator...</p>
        </div>
      }
    >
      <CharacterSelectionContent />
    </Suspense>
  );
}
