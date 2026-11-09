import { useNav } from '../context/NavContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  dark?: boolean;
}

export default function Header({ title, showBack = true, rightElement, dark }: HeaderProps) {
  const { goBack } = useNav();
  const textColor = dark ? '#073B4C' : '#102A36';
  const iconColor = '#073B4C';

  return (
    <div className={`flex items-center px-4 h-14 shrink-0 ${dark ? 'sky-header' : ''}`} style={{ backgroundColor: dark ? undefined : 'white', borderBottom: dark ? 'none' : '1px solid #D9E7EC' }}>
      {showBack && (
        <button onClick={goBack} className="w-9 h-9 flex items-center justify-center rounded-full mr-2"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.6)' : '#F2F2F7' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <span className="flex-1 text-base font-semibold" style={{ color: textColor }}>{title}</span>
      {rightElement}
    </div>
  );
}
