interface Question {
  id: string;
  pillar: string;
  text: string;
  context?: string;
  examples?: string[];
}

interface AssessmentQuestionProps {
  question: Question;
  currentAnswer?: number;
  onAnswer: (questionId: string, score: number) => void;
}

const scoreLabels = [
  { score: 1, label: "Strongly Disagree" },
  { score: 2, label: "Disagree" },
  { score: 3, label: "Neutral" },
  { score: 4, label: "Agree" },
  { score: 5, label: "Strongly Agree" },
];

const AssessmentQuestion = ({ question, currentAnswer, onAnswer }: AssessmentQuestionProps) => {
  return (
    <div className="bg-card rounded-xl p-8 border border-border shadow-elegant">
      <p className="text-xs font-medium text-accent uppercase tracking-wider mb-4">
        {question.pillar}
      </p>
      <h2 className="text-xl lg:text-2xl font-heading mb-4">
        {question.text}
      </h2>
      
      {question.context && (
        <p className="text-muted-foreground text-sm mb-4">
          {question.context}
        </p>
      )}
      
      {question.examples && question.examples.length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Examples to consider
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {question.examples.map((example, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {scoreLabels.map(({ score, label }) => (
          <button
            key={score}
            onClick={() => onAnswer(question.id, score)}
            className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
              currentAnswer === score
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-background hover:border-accent/50 hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  currentAnswer === score
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                <span className="text-sm font-medium">{score}</span>
              </div>
              <span className={currentAnswer === score ? "font-medium" : ""}>
                {label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssessmentQuestion;
