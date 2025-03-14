import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full bg-transparent outline-none resize-none",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
