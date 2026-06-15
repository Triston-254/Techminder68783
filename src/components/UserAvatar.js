function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function UserAvatar({ name = '', image, size = 'sm', className = '' }) {
  const initials = getInitials(name);

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={`user-avatar user-avatar-${size}${className ? ` ${className}` : ''}`}
      />
    );
  }

  return (
    <span
      className={`user-avatar user-avatar-${size} user-avatar-initials${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {initials || (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </span>
  );
}

export default UserAvatar;
export { getInitials };
