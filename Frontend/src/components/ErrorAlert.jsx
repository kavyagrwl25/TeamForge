function ErrorAlert({ children, className = "" }) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default ErrorAlert;
