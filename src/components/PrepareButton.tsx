interface PrepareButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  label?: string;
}

export default function PrepareButton({
  disabled,
  loading,
  onClick,
  label = 'Prepare Shipping Labels',
}: PrepareButtonProps) {
  return (
    <div className="text-center">
      <button
        className="btn btn-prepare"
        disabled={disabled || loading}
        onClick={onClick}
      >
        {loading && (
          <span className="spinner-border text-light me-2" role="status" />
        )}
        {label}
      </button>
    </div>
  );
}
