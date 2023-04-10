"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

export function Tooltip({
  children,
  disableTooltip = false,
  content,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: TooltipPrimitive.TooltipProps &
  TooltipPrimitive.TooltipContentProps & {
    content: ReactNode;
    disableTooltip?: boolean;
  }) {
  if (disableTooltip) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root
        disableHoverableContent
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="select-none rounded-[4px] bg-blue3 border border-blue6 px-2 py-1 text-sm text-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade"
            sideOffset={6}
            avoidCollisions
            {...props}
          >
            {content}
            <TooltipPrimitive.Arrow
              width={11}
              height={5}
              className="fill-blue5"
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
