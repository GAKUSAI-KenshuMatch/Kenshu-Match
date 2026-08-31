import type { NextConfig } from "next";

// Legacy static-site URLs (e.g. bookmarks, external links) still point at the
// old `*.html` filenames. These redirects keep them working after the Next.js
// migration. Query strings are preserved automatically by Next.js since the
// destinations below don't declare their own query.
const legacyHtmlRedirects: Array<{ source: string; destination: string }> = [
  { source: "/index.html", destination: "/" },
  { source: "/login.html", destination: "/login" },
  { source: "/register.html", destination: "/register" },
  { source: "/forgot-password.html", destination: "/forgot-password" },
  { source: "/reset-password.html", destination: "/reset-password" },
  { source: "/complete-profile.html", destination: "/complete-profile" },
  { source: "/mypage.html", destination: "/mypage" },
  { source: "/company.html", destination: "/company" },
  { source: "/instructors.html", destination: "/instructors" },
  { source: "/instructor-detail.html", destination: "/instructor-detail" },
  { source: "/instructor-profile-edit.html", destination: "/instructor-profile-edit" },
  { source: "/open-requests.html", destination: "/open-requests" },
  { source: "/post-request.html", destination: "/post-request" },
  { source: "/request-detail.html", destination: "/request-detail" },
  { source: "/requester-profile-edit.html", destination: "/requester-profile-edit" },
  { source: "/contact.html", destination: "/contact" },
  { source: "/privacy.html", destination: "/privacy" },
  { source: "/terms.html", destination: "/terms" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyHtmlRedirects.map((r) => ({ ...r, permanent: false }));
  },
};

export default nextConfig;
