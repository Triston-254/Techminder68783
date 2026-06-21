export default function AdminUserActions({
  accountStatus,
  onActivate,
  onSuspend,
  isSaving,
}) {
  const suspended = accountStatus === 'suspended';

  return (
    <div className="admin-user-actions d-flex gap-2 flex-wrap">
      <button
        type="button"
        className={`btn btn-sm ${suspended ? 'btn-warning' : 'btn-outline-warning' } rounded-pill fw-semibold`}
        disabled={isSaving || !suspended}
        onClick={onActivate}
      >
        Activate
      </button>
      <button
        type="button"
        className={`btn btn-sm ${!suspended ? 'btn-danger' : 'btn-outline-danger' } rounded-pill fw-semibold`}
        disabled={isSaving || suspended}
        onClick={onSuspend}
      >
        Suspend
      </button>
    </div>
  );
}

