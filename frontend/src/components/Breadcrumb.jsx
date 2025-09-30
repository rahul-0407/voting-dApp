"use client"

import {Link, useLocation} from "react-router-dom"
// import { usePathname } from "next/navigation"

export default function Breadcrumb() {
    const location = useLocation();
  const pathname = location.pathname;
  const pathSegments = pathname.split("/").filter((segment) => segment)

  if (pathSegments.length === 0) return null

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      const name = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      return { name, href }
    }),
  ]

  return (
    <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-white">{item.name}</span>
          ) : (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
