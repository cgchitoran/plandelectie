import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** Ajustează înălțimea la conținut: fără scrollbar, caseta crește/scade dinamic. */
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, value, onChange, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    },
    [ref],
  );

  // Redimensionare la montare și la orice schimbare a valorii (inclusiv externă)
  React.useLayoutEffect(() => {
    autosize(innerRef.current);
  }, [value]);

  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={setRefs}
      value={value}
      onChange={(e) => {
        autosize(e.target);
        onChange?.(e);
      }}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
