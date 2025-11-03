"use client";

import { CheckBikeSearch } from "./CheckBikeSearch";

interface CheckBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckBikeDialog({ open, onOpenChange }: CheckBikeDialogProps) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Check Bike Status</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <CheckBikeSearch />
          </div>
        </div>
      </div>
    </div>
  );
}