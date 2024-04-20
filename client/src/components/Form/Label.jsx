import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../cn";

export const Label2 = React.forwardRef(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium text-black dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label2.displayName = LabelPrimitive.Root.displayName;

// export default Label;