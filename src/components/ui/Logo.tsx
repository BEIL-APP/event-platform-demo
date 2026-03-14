interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export function Logo({ 
  className = '', 
  iconOnly = false, 
  size = 'md',
  variant = 'default' 
}: LogoProps) {
  const sizes = {
    sm: { box: 'w-6 h-6', text: 'text-sm', spacing: 'gap-2' },
    md: { box: 'w-8 h-8', text: 'text-lg', spacing: 'gap-2.5' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', spacing: 'gap-3' },
  };

  const currentSize = sizes[size];
  
  const iconBgColor = variant === 'white' ? 'bg-white' : 'bg-brand-600';
  const iconColor = variant === 'white' ? 'fill-brand-600' : 'fill-white';
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Custom QR-inspired Icon */}
      <div className={`${currentSize.box} ${iconBgColor} rounded-lg flex items-center justify-center shadow-sm overflow-hidden`}>
        <svg 
          viewBox="0 0 24 24" 
          className="w-2/3 h-2/3"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* QR Corner Pattern - Top Left */}
          <rect x="2" y="2" width="8" height="8" rx="1.5" className={iconColor} />
          <rect x="4" y="4" width="4" height="4" rx="0.5" className={variant === 'white' ? 'fill-white' : 'fill-brand-600'} opacity="0.2" />
          <rect x="5" y="5" width="2" height="2" rx="0.2" className={iconColor} />
          
          {/* QR Corner Pattern - Top Right */}
          <rect x="14" y="2" width="8" height="8" rx="1.5" className={iconColor} />
          <rect x="17" y="5" width="2" height="2" rx="0.2" className={iconColor} />
          
          {/* QR Corner Pattern - Bottom Left */}
          <rect x="2" y="14" width="8" height="8" rx="1.5" className={iconColor} />
          <rect x="5" y="17" width="2" height="2" rx="0.2" className={iconColor} />
          
          {/* Data Pixels & Liner Connection */}
          <rect x="14" y="14" width="3" height="3" rx="0.5" className={iconColor} />
          <rect x="19" y="14" width="3" height="3" rx="0.5" className={iconColor} />
          <rect x="14" y="19" width="3" height="3" rx="0.5" className={iconColor} />
          <rect x="18" y="18" width="4" height="4" rx="1" className={iconColor} opacity="0.6" />
          
          {/* Subtle connection line between parts */}
          <rect x="11" y="4" width="2" height="1" rx="0.5" className={iconColor} opacity="0.4" />
          <rect x="11" y="19" width="2" height="1" rx="0.5" className={iconColor} opacity="0.4" />
          <rect x="4" y="11" width="1" height="2" rx="0.5" className={iconColor} opacity="0.4" />
          <rect x="19" y="11" width="1" height="2" rx="0.5" className={iconColor} opacity="0.4" />
        </svg>
      </div>
      
      {!iconOnly && (
        <span className={`${currentSize.text} font-bold ${textColor} tracking-tight`}>
          Booth<span className={variant === 'white' ? 'text-white/90' : 'text-brand-600'}>Liner</span>
        </span>
      )}
    </div>
  );
}
