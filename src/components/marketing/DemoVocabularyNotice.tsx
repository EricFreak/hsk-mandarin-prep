type DemoVocabularyNoticeProps = {
  className?: string;
};

export default function DemoVocabularyNotice({
  className = "",
}: DemoVocabularyNoticeProps) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      role="status"
    >
      <span className="font-medium">Beta demo:</span> This build uses sample vocabulary
      only — 10 words per HSK level. Full GF0025 word lists are coming after beta.
    </div>
  );
}
