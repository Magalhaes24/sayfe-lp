import React from "react";
import "./ScrollStack.css";

export function ScrollStack({
  children,
  className = "",
  itemDistance = 1000,
  itemStackDistance = 0,
  baseScale = 0.75
}) {
  const items = React.Children.toArray(children);

  return (
    <div
      className={`scroll-stack ${className}`.trim()}
      style={{
        "--stack-distance": `${itemDistance}px`,
        "--stack-offset": `${itemStackDistance}px`,
        "--stack-scale": baseScale
      }}
    >
      <div className="scroll-stack__inner">
        {items.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { index })
            : child
        )}
      </div>
    </div>
  );
}

export const ScrollStackItem = React.forwardRef(
  ({ children, index = 0, className = "" }, ref) => {
    return (
      <article
        ref={ref}
        className={`scroll-stack__item ${className}`.trim()}
        style={{ "--stack-index": index }}
      >
        {children}
      </article>
    );
  }
);

ScrollStackItem.displayName = "ScrollStackItem";
