'use client'

import type * as React from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const Menu = MenuPrimitive.Root
const MenuTrigger = MenuPrimitive.Trigger

function MenuContent({
  className,
  sideOffset = 6,
  align,
  side,
  children,
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, 'sideOffset' | 'align' | 'side'>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={sideOffset} align={align} side={side} className="z-50 outline-none">
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            'min-w-[10rem] origin-(--transform-origin) rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function MenuCheckItem({
  className,
  checked,
  children,
  ...props
}: MenuPrimitive.Item.Props & { checked?: boolean }) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-check-item"
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <Check className={cn('size-3.5', checked ? 'opacity-100' : 'opacity-0')} />
      {children}
    </MenuPrimitive.Item>
  )
}

function MenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role="separator" data-slot="menu-separator" className={cn('my-1 h-px bg-border', className)} {...props} />
}

export { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckItem, MenuSeparator }
