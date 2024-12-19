// components/ui/Menu.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';

interface MenuProps {
  children: ReactNode;
}

export const Menu = ({ children }: MenuProps) => {
  return <DropdownMenu.Root>{children}</DropdownMenu.Root>;
};

export const MenuButton = ({ children }: MenuProps) => {
  return <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>;
};

export const MenuList = ({ children }: MenuProps) => {
  return (
    <DropdownMenu.Content className="min-w-[8rem] bg-zinc-900 border border-white/10 rounded-lg shadow-xl">
      {children}
    </DropdownMenu.Content>
  );
};

interface MenuItemProps extends MenuProps {
  onClick: () => void;
}

export const MenuItem = ({ children, onClick }: MenuItemProps) => {
  return (
    <DropdownMenu.Item
      className="px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
      onClick={onClick}
    >
      {children}
    </DropdownMenu.Item>
  );
};