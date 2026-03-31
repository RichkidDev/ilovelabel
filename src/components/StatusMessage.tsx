interface StatusMessageProps {
  message: string;
  type?: 'info' | 'error';
}

export default function StatusMessage({ message, type = 'info' }: StatusMessageProps) {
  if (!message) return null;
  return (
    <div className="text-center mt-3">
      <p className={`mb-0 ${type === 'error' ? 'text-danger' : 'text-muted'}`}>
        {message}
      </p>
    </div>
  );
}
