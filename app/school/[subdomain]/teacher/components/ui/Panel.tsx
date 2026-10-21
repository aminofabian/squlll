import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tp } from "../../styles/portal";

/**
 * A quiet surface. Everything on the portal sits on one of these so corner
 * radii, borders and shadows never drift between pages.
 */
export function Panel({
  children,
  className,
  padded = true,
  as: Tag = "section",
  delay,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  as?: "section" | "div" | "article" | "aside";
  delay?: number;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn(
        tp.card,
        "tp-reveal overflow-hidden",
        padded && tp.cardPad,
        className,
      )}
      style={
        delay === undefined
          ? undefined
          : ({ ["--tp-delay" as string]: delay } as CSSProperties)
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
