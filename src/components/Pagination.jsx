import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  // Defensive Destructuring with defaults
  const { 
    page = 1, 
    totalPages = 1, 
    total = 0, 
    limit = 10 
  } = pagination || {};

  // Calculate high-precision ranges
  const startRange = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Showing <span className="text-slate-900">{startRange}</span> to <span className="text-slate-900">{endRange}</span> of <span className="text-slate-900">{total}</span> results
      </div>

      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-300 text-[10px] font-bold">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all
                  ${page === pageNum 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
                    : 'text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm'}
                `}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
