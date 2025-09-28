import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Gamepad2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  className?: string;
}

const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Create Game',
    href: '/create-game',
    icon: PlusCircle,
  },
  {
    name: 'Join Game',
    href: '/join-game',
    icon: Gamepad2,
  },
  {
    name: 'My Games',
    href: '/my-games',
    icon: Trophy,
  },
];

export function MobileNav({ className }: MobileNavProps) {
  const location = useLocation();

  return (
    <div className={cn(
      'md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg backdrop-blur-sm',
      className
    )}>
      <nav className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center text-xs gap-1 transition-all relative py-2',
              location.pathname.startsWith(item.href) ? 'text-primary glow-gold' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="font-medium">{item.name}</span>
            {location.pathname.startsWith(item.href) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg animate-pulse"></span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}