"use client";

import { useEffect } from "react";

/**
 * Legacy pages set body[data-role-theme] (statically via <body data-role-theme="...">,
 * or dynamically on mypage.html based on the logged-in user's role) to switch the
 * accent color defined in legacy.css. App Router pages can't set attributes on the
 * shared <body> declaratively, so this mirrors the same behavior via an effect.
 */
export function useRoleTheme(theme: "instructor" | "business" | null | undefined) {
  useEffect(() => {
    if (!theme) return;
    const previous = document.body.dataset.roleTheme;
    document.body.dataset.roleTheme = theme;
    return () => {
      if (previous) {
        document.body.dataset.roleTheme = previous;
      } else {
        delete document.body.dataset.roleTheme;
      }
    };
  }, [theme]);
}
