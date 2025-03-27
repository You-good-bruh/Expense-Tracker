import { useThemeColors } from "./theme-colors"

interface MoneyIconProps {
  size?: number
  className?: string
}

export function DollarBillIcon({ size = 24, className = "" }: MoneyIconProps) {
  const { colors } = useThemeColors()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="6" width="20" height="12" rx="1" fill={colors.primary} />
      <circle cx="12" cy="12" r="3" fill={colors.background} />
      <path d="M12 8V16M9 12H15" stroke={colors.primaryForeground} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M6 9H7M17 9H18M6 15H7M17 15H18"
        stroke={colors.primaryForeground}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CoinStackIcon({ size = 24, className = "" }: MoneyIconProps) {
  const { colors } = useThemeColors()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse cx="12" cy="7" rx="7" ry="3" fill={colors.secondary} />
      <path
        d="M5 10C5 11.6569 8.13401 13 12 13C15.866 13 19 11.6569 19 10"
        stroke={colors.secondaryForeground}
        strokeWidth="1.5"
      />
      <path
        d="M5 14C5 15.6569 8.13401 17 12 17C15.866 17 19 15.6569 19 14"
        stroke={colors.secondaryForeground}
        strokeWidth="1.5"
      />
      <path
        d="M5 7V17C5 18.6569 8.13401 20 12 20C15.866 20 19 18.6569 19 17V7"
        stroke={colors.secondaryForeground}
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function WalletIcon({ size = 24, className = "" }: MoneyIconProps) {
  const { colors } = useThemeColors()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V7Z"
        fill={colors.accent}
      />
      <path
        d="M22 10H18C16.8954 10 16 10.8954 16 12V13C16 14.1046 16.8954 15 18 15H22"
        stroke={colors.accentForeground}
        strokeWidth="1.5"
      />
      <circle cx="18" cy="12.5" r="1" fill={colors.accentForeground} />
    </svg>
  )
}

export function PiggyBankIcon({ size = 24, className = "" }: MoneyIconProps) {
  const { colors } = useThemeColors()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19 8.5C19 5.46243 16.0376 3 12.5 3C8.96243 3 6 5.46243 6 8.5C6 9.83879 6.50571 11.0659 7.36331 12M6 12.5V15.5M19 12.5V15.5"
        stroke={colors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 8.5C7 6.01472 9.46243 4 12.5 4C15.5376 4 18 6.01472 18 8.5C18 10.9853 15.5376 13 12.5 13C9.46243 13 7 10.9853 7 8.5Z"
        fill={colors.primary}
      />
      <path d="M3.5 10.5L6 12.5L3.5 14.5V10.5Z" fill={colors.primary} />
      <path d="M20.5 10.5L18 12.5L20.5 14.5V10.5Z" fill={colors.primary} />
      <path d="M12.5 13V17M10 19H15" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="8" r="1" fill={colors.background} />
    </svg>
  )
}

export function MoneyGrowthIcon({ size = 24, className = "" }: MoneyIconProps) {
  const { colors } = useThemeColors()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 17L7 13L11 15L21 5"
        stroke={colors.success}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 5H21V9" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2" fill={colors.secondary} />
      <circle cx="12" cy="15" r="2" fill={colors.secondary} />
      <circle cx="17" cy="12" r="2" fill={colors.secondary} />
    </svg>
  )
}

export function CashFlowIcon({ size = 24, className = "" }: MoneyIconProps) {
  const { colors } = useThemeColors()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 9L7 5M7 5L11 9M7 5V15"
        stroke={colors.success}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 15L17 19M17 19L13 15M17 19V9"
        stroke={colors.destructive}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="5" y="12" width="4" height="2" rx="1" fill={colors.success} />
      <rect x="15" y="10" width="4" height="2" rx="1" fill={colors.destructive} />
    </svg>
  )
}

