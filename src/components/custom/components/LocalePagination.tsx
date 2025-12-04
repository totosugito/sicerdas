import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination'
import { useTranslation } from 'react-i18next'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import React from 'react'

interface LocalePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function LocalePagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: LocalePaginationProps) {
  const { t } = useTranslation()
  
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const PaginationPrevious = ({ 
    className,
    onClick,
    disabled
  }: { 
    className?: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      aria-label={t('labels.pagination.previousPage')}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "gap-1 px-2.5 sm:pl-2.5",
        disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{t('labels.pagination.previous')}</span>
    </button>
  );

  const PaginationNext = ({ 
    className,
    onClick,
    disabled
  }: { 
    className?: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      aria-label={t('labels.pagination.nextPage')}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "gap-1 px-2.5 sm:pr-2.5",
        disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="hidden sm:block">{t('labels.pagination.next')}</span>
      <ChevronRightIcon />
    </button>
  );

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {getPageNumbers().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === "ellipsis" ? (
                <PaginationEllipsis>
                  <span className="sr-only">{t('labels.pagination.morePages')}</span>
                </PaginationEllipsis>
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}