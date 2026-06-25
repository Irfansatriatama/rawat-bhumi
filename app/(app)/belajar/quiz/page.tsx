import { ClipboardCheck } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { QUIZ_DASAR } from "@/lib/belajar";
import { QuizRunner } from "@/components/belajar/quiz-runner";

export default function QuizPage() {
  return (
    <div>
      <AppHeader
        title="Latihan Quiz"
        subtitle={`Level Dasar • ${QUIZ_DASAR.length} soal`}
        icon={ClipboardCheck}
      />
      <div className="p-5">
        <QuizRunner questions={QUIZ_DASAR} />
      </div>
    </div>
  );
}
