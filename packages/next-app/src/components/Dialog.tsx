"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import cn from "classnames";
import * as React from "react";

export function Dialog({
  children,
  content,
  title,
  isBig = false,
}: React.PropsWithChildren<{
  content: React.ReactElement;
  title?: string;
  isBig?: boolean;
}>) {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          id="dialog-overlay"
          className={cn(
            "bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-blue3 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none",
            isBig ? "w-7/12" : "w-[90vw] max-w-[450px]"
          )}
        >
          <DialogPrimitive.Title className="text-2xl font-medium text-slate12">
            {title}
          </DialogPrimitive.Title>

          <div className="mt-2 w-full">
            {React.cloneElement(React.Children.only(content), {
              close: () => setOpen(false),
            })}
          </div>
          <DialogPrimitive.Close asChild>
            <button
              className="absolute right-[10px] top-[10px] inline-flex h-[30px] w-[30px] items-center justify-center text-slate12 hover:font-black	focus:shadow-[0_0_0_2px] focus:shadow-slate2 focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
