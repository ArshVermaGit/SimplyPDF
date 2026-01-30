"use client";

import React from "react";

interface BackgroundGradientProps {
  className?: string;
  blurOpacity?: string;
  blob1Color?: string;
  blob2Color?: string;
}

export const BackgroundGradient = ({
  className = "",
  blurOpacity = "opacity-50",
  blob1Color = "bg-gray-100",
  blob2Color = "bg-gray-50",
}: BackgroundGradientProps) => {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <div
        className={`absolute top-20 right-10 h-96 w-96 ${blob1Color} rounded-full blur-3xl ${blurOpacity}`}
      />
      <div
        className={`absolute bottom-20 left-10 h-72 w-72 ${blob2Color} rounded-full opacity-60 blur-3xl`}
      />
    </div>
  );
};
