import Image from 'next/image'
import cn from 'clsx'

type AppLogoSquareProps = {
  className?: string
}

export function AppLogoSquare({ className }: AppLogoSquareProps) {
  return (
    <Image
      src="/logo-256x256.png"
      alt=""
      width={22}
      height={22}
      draggable={false}
      className={cn('x:aspect-square x:shrink-0 x:object-contain', className)}
    />
  )
}
