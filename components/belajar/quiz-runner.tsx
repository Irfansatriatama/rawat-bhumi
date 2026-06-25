"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ChevronRight, RotateCcw, Trophy, Lightbulb } from "lucide-react";
import type { QuizQuestion } from "@/lib/belajar";

type Phase = "answering" | "revealed" | "done";

export function QuizRunner({ questions }: { questions: QuizQuestion[] }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const total = questions.length;
  const q = questions[idx];

  function choose(i: number) {
    if (phase !== "answering") return;
    setPicked(i);
    setPhase("revealed");
    if (i === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= total) {
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setPhase("answering");
  }

  function restart() {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setPhase("answering");
  }

  if (phase === "done") {
    const pct = Math.round((score / total) * 100);
    const lulus = pct >= 70;
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-6 text-center ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${lulus ? "bg-brand-soft" : "bg-amber-100"}`}>
          <Trophy size={30} className={lulus ? "text-brand-600" : "text-brand-amber"} />
        </span>
        <p className="mt-4 text-sm font-medium text-gray-500">Skor kamu</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-brand-dark">
          {score}<span className="text-xl text-gray-400">/{total}</span>
        </p>
        <p className={`mt-2 text-sm font-semibold ${lulus ? "text-brand-600" : "text-brand-amber"}`}>
          {lulus ? "Hebat! Kamu lulus 🎉" : "Belum lulus, coba lagi ya!"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {lulus
            ? "Pemahamanmu soal pengelolaan sampah sudah baik."
            : "Pelajari lagi materinya, lalu ulangi quiz untuk skor lebih tinggi."}
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            onClick={restart}
            className="press flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white"
          >
            <RotateCcw size={15} /> Ulangi Quiz
          </button>
          <Link
            href="/belajar"
            className="press flex items-center justify-center rounded-xl border border-brand-dark/10 py-3 text-sm font-medium text-brand-dark"
          >
            Kembali ke Belajar
          </Link>
        </div>
      </div>
    );
  }

  const pct = Math.round(((idx + (phase === "revealed" ? 1 : 0)) / total) * 100);

  return (
    <div className="space-y-4">
      {/* progress */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-brand-dark">Soal {idx + 1} dari {total}</span>
          <span className="font-medium text-brand-600">{score} benar</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-tint">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
      </div>

      {/* pertanyaan */}
      <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-brand-dark/5 [box-shadow:var(--shadow-soft)]">
        <p className="text-base font-semibold leading-snug text-brand-dark">{q.q}</p>

        <div className="mt-4 space-y-2.5">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer;
            const isPicked = i === picked;
            let cls = "border-brand-dark/10 bg-white text-brand-dark";
            if (phase === "revealed") {
              if (isAnswer) cls = "border-brand-600 bg-brand-soft text-brand-dark";
              else if (isPicked) cls = "border-brand-red/40 bg-red-50 text-brand-dark";
              else cls = "border-brand-dark/10 bg-white text-gray-400";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={phase === "revealed"}
                className={`press flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium ${cls}`}
              >
                <span>{opt}</span>
                {phase === "revealed" && isAnswer && (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                {phase === "revealed" && isPicked && !isAnswer && (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-red text-white">
                    <X size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {phase === "revealed" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-tint p-3">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand-amber" />
            <p className="text-xs leading-relaxed text-gray-600">{q.explain}</p>
          </div>
        )}
      </div>

      {phase === "revealed" && (
        <button
          onClick={next}
          className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3.5 text-sm font-semibold text-white"
        >
          {idx + 1 >= total ? "Lihat Hasil" : "Soal Berikutnya"} <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
