import * as React from 'react';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TagInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  suggestionsLabel?: string;
  id?: string;
}

/** Input cu etichete (chips): Enter pentru adăugare, sugestii clickable */
export function TagInput({ value, onChange, suggestions = [], placeholder, suggestionsLabel, id }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const add = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setDraft('');
  };

  const availableSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, idx) => (
            <Badge key={`${item}-${idx}`} variant="secondary" className="gap-1 pr-1">
              <span>{item}</span>
              <button
                type="button"
                aria-label={`Remove ${item}`}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            }
          }}
          className="h-8 text-xs"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => add(draft)} disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {availableSuggestions.length > 0 && (
        <div className="space-y-1">
          {suggestionsLabel && <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{suggestionsLabel}</p>}
          <div className="flex flex-wrap gap-1">
            {availableSuggestions.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className={cn(
                  'rounded-full border border-dashed border-primary/40 px-2 py-0.5 text-[11px] text-primary',
                  'hover:bg-primary/10 transition-colors',
                )}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
