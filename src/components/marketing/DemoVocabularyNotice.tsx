type DemoVocabularyNoticeProps = {
  className?: string;
};

export default function DemoVocabularyNotice({
  className = "",
}: DemoVocabularyNoticeProps) {
  return (
    <div
      className={`rounded-xl border border-jade/20 bg-jade/5 px-4 py-3 text-sm text-ink ${className}`}
      role="status"
    >
      <span className="font-semibold text-jade">Beta demo:</span> This build uses sample vocabulary
      only — 10 words per HSK level. Full GF0025 word lists are coming after beta.
    </div>
  );
}
