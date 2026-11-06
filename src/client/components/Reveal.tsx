import React from 'react';
import { useReveal } from '../hooks/useReveal';

/**
 * Reveal: pembungkus tipis `useReveal` untuk dipakai langsung di JSX.
 *
 * Dipakai sebagai `<Reveal delay={70}>` tanpa perlu menulis ref & style manual
 * di setiap seksi. `as` memungkinkan elemen semantik (mis. `li` di dalam `ol`)
 * tetap dipakai alih-alih selalu `div`.
 */
export const Reveal: React.FC<{
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
  children: React.ReactNode;
}> = ({ delay = 0, className = '', as: Tag = 'div', children }) => {
  const { ref, style } = useReveal<HTMLElement>({ delay });
  return (
    <Tag ref={ref as never} style={style} className={className}>
      {children}
    </Tag>
  );
};

export default Reveal;
