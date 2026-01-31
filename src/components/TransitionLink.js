'use client'

import { useTransition } from '@/context/TransitionContext';

export default function TransitionLink({ href, children, className }) {
  const { navigateWithTransition } = useTransition();

  const handleClick = (e) => {
    e.preventDefault(); // Evita el cambio brusco normal
    navigateWithTransition(href); // Usa nuestra función con GIFs
  };

  return (
    <a href={href} onClick={handleClick} className={className + " cursor-pointer"}>
      {children}
    </a>
  );
}