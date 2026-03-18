"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg bg-[#020202] text-white hover:bg-[#0d324d] transition font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
