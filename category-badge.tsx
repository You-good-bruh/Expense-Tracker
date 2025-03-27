import { getCategoryColor } from "@/lib/utils"

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const backgroundColor = `${getCategoryColor(category)}20` // 20% opacity
  const textColor = getCategoryColor(category)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor,
        color: textColor,
        border: `1px solid ${textColor}40`, // 40% opacity
      }}
    >
      {category}
    </span>
  )
}

