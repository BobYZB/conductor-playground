interface ProgressNoticeProps {
  tone: 'info' | 'success' | 'warning' | 'error';
  children: string;
}

export default function ProgressNotice({ tone, children }: ProgressNoticeProps) {
  return <p className={`progress-note progress-note--${tone}`}>{children}</p>;
}
