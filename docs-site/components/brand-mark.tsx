import cn from 'clsx'
import { AppLogoSquare } from './app-logo-square'
import styles from './brand-mark.module.css'

type BrandMarkProps = {
  showImage?: boolean
  nudge?: boolean
}

export function BrandMark({ showImage = true, nudge = false }: BrandMarkProps) {
  return (
    <div className={cn(styles.root, nudge && styles.rootNudge)}>
      {showImage && (
        <a href="/" aria-label="BaaSForge home" className={styles.link}>
          <AppLogoSquare />
        </a>
      )}
      <span className={styles.wordmark}>
        <a href="/" className={styles.name}>
          BaaSForge
        </a>
        <span className={styles.suffix} aria-hidden="true">
          docs
        </span>
      </span>
    </div>
  )
}
