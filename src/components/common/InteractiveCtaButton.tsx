import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export interface InteractiveCtaButtonProps {
  id?: string;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'cyan' | 'dark' | 'outline';
  previewImage?: string;
  previewTitle?: string;
  previewSubtitle?: string;
  previewPosition?: 'top' | 'bottom';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  title?: string;
}

export const InteractiveCtaButton: React.FC<InteractiveCtaButtonProps> = ({
  id,
  to,
  href,
  target,
  rel,
  onClick,
  className = '',
  variant = 'primary',
  previewImage,
  previewTitle,
  previewSubtitle,
  previewPosition = 'top',
  icon,
  iconPosition = 'right',
  children,
  title,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Slight intentional delay (60ms) to prevent accidental flashes on fast cursor sweeps
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 60);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  // Base styling classes matching IZCOR MEDIC design system
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'btn-izcor-cta-primary';
      case 'secondary':
        return 'btn-izcor-cta-secondary';
      case 'whatsapp':
        return 'btn-izcor-cta-whatsapp';
      case 'cyan':
        return 'bg-brand-cyan hover:bg-[#0098b3] active:bg-[#007f96] text-white shadow-md hover:shadow-lg';
      case 'dark':
        return 'bg-[#2C3E50] hover:bg-[#1E2B37] text-white shadow-md hover:shadow-lg';
      case 'outline':
        return 'bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm';
      default:
        return 'btn-izcor-cta-primary';
    }
  };

  const baseClasses = `relative inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold transition-all duration-250 cursor-pointer select-none group text-xs sm:text-sm tracking-wide ${getVariantClasses()} ${className}`;

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0 transition-transform group-hover:translate-x-0.5">{icon}</span>}

      {/* Desktop Hover Micro-Visual Card (Fade, Scale, Blur-to-Sharp, 250ms) */}
      {previewImage && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.95, 
                y: previewPosition === 'top' ? 8 : -8,
                filter: 'blur(4px)' 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                filter: 'blur(0px)' 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95, 
                y: previewPosition === 'top' ? 4 : -4,
                filter: 'blur(2px)',
                transition: { duration: 0.18 }
              }}
              transition={{ 
                duration: 0.28, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden md:flex flex-col items-center ${
                previewPosition === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
              }`}
            >
              <div className="w-56 p-2 rounded-2xl bg-[#0D2232]/95 border border-cyan-400/30 backdrop-blur-xl shadow-2xl text-left overflow-hidden">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-2 bg-slate-900 border border-white/10">
                  <img
                    src={previewImage}
                    alt={previewTitle || 'Visual contextual'}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D2232]/80 via-transparent to-transparent" />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/90 text-white backdrop-blur-xs">
                    IZCOR PREVIEW
                  </span>
                </div>
                {previewTitle && (
                  <div className="text-white text-xs font-bold font-heading line-clamp-1">
                    {previewTitle}
                  </div>
                )}
                {previewSubtitle && (
                  <div className="text-slate-300 text-[10px] leading-tight line-clamp-2 mt-0.5">
                    {previewSubtitle}
                  </div>
                )}
              </div>

              {/* Arrow Indicator */}
              <div 
                className={`w-3 h-3 bg-[#0D2232]/95 border-cyan-400/30 rotate-45 transform -mt-1.5 ${
                  previewPosition === 'top' 
                    ? 'border-b border-r' 
                    : '-mb-1.5 border-t border-l order-first -mt-0 mb-[-6px]'
                }`} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        id={id}
        to={to}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={baseClasses}
        title={title}
      >
        {renderContent()}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        id={id}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={baseClasses}
        title={title}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={baseClasses}
      title={title}
    >
      {renderContent()}
    </button>
  );
};
