import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const pages = getPages()

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
              p === page
                ? 'bg-gold text-white'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {p}
          </button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
