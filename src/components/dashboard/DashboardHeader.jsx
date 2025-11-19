import React from "react";
import { motion } from "framer-motion";

export default function DashboardHeader({ title, subtitle, image, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="
        relative rounded-2xl overflow-hidden p-6
        bg-gradient-to-r from-[#FFE6D5] to-[#f17a30ff]
        dark:from-[#2b2b2b] dark:to-[#1f1f1f]
      "
    >
      <div className="flex items-start gap-6">
        
        {/* Text Section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#2E2E2E] dark:text-white">
            {title}
          </h2>

          <p className="text-sm text-[#6F6F6F] dark:text-gray-300 mt-1">
            {subtitle}
          </p>

          {/* Action Button */}
          {action && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={action.onClick}
                className="
                  px-4 py-2 bg-[#FF6A00] text-white rounded-lg shadow
                  hover:bg-[#E85D00] transition
                  dark:bg-orange-600 dark:hover:bg-orange-500
                "
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Hero Image / Placeholder */}
        <div className="w-48 flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt="hero"
              className="
                w-full h-32 object-cover rounded-lg shadow-lg
                dark:opacity-90
              "
            />
          ) : (
            <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-gray-700" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
