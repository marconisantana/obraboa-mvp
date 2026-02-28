import { useIsMobile } from '@/hooks/use-mobile';

export default function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-card px-4 lg:pl-[calc(16rem+1rem)]">
      {isMobile ? (
        <img src="/icon-obraboa-navy.svg" alt="ObraBoa" className="h-8" />
      ) : (
        <div /> // Space taken by sidebar on desktop
      )}
    </header>
  );
}
