import { useEffect, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const { query, setQuery, results } = useGlobalSearch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  if (!mounted) return null

  const pageResults = results.filter((r) => r.type === 'page')
  const customerResults = results.filter((r) => r.type === 'customer')
  const unitResults = results.filter((r) => r.type === 'unit')

  const handleSelect = (action: () => void) => {
    action()
    onOpenChange(false)
    setQuery('')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Command Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover shadow-lg">
        <Command className="rounded-lg">
          <CommandInput
            placeholder="Suche nach Seiten, Kunden, Einheiten..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

            {pageResults.length > 0 && (
              <>
                <CommandGroup heading="Seiten">
                  {pageResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.action)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2 text-lg">{result.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {result.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {(customerResults.length > 0 || unitResults.length > 0) && (
                  <CommandSeparator />
                )}
              </>
            )}

            {customerResults.length > 0 && (
              <>
                <CommandGroup heading="Kunden">
                  {customerResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.action)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2 text-lg">{result.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {result.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {unitResults.length > 0 && <CommandSeparator />}
              </>
            )}

            {unitResults.length > 0 && (
              <CommandGroup heading="Einheiten">
                {unitResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.action)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-lg">{result.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>

        {/* Keyboard hint */}
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{' '}
          zum Öffnen •{' '}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            ESC
          </kbd>{' '}
          zum Schließen
        </div>
      </div>
    </>
  )
}
