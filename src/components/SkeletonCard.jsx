import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10/12" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
      </div>
    </div>
  );
};

export default SkeletonCard;
