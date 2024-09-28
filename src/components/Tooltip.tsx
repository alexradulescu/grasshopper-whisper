import { FC, ReactNode } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import styles from './styles.module.css'

interface Props {
  disclosure: ReactNode | string
  content: ReactNode | string
}

export const Tooltip: FC<Props> = ({ disclosure, content }) => {
  return (
    <Popover className={styles.tooltipWrapper}>
      <PopoverButton className={styles.tooltipButton}>{disclosure}</PopoverButton>
      <PopoverPanel anchor="bottom" className={styles.tooltipContent}>
        {content}
      </PopoverPanel>
    </Popover>
  )
}
