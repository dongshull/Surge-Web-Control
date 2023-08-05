import React, { useEffect, useMemo, useState } from 'react'
import { css } from '@emotion/react'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Headline } from '@sumup/circuit-ui'

import { cn } from '@/utils/shadcn'

import BackButton from '../BackButton'

interface PageTitleProps {
  title: string
  hasAutoRefresh?: boolean
  defaultAutoRefreshState?: boolean
  onAuthRefreshStateChange?: (newState: boolean) => void
  sticky?: boolean
}

const PageTitle: React.FC<PageTitleProps> = (props) => {
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(
    () => props.defaultAutoRefreshState ?? false,
  )
  const isSticky = useMemo(
    () => (typeof props.sticky === 'undefined' ? true : props.sticky),
    [props.sticky],
  )

  useEffect(() => {
    if (props.hasAutoRefresh && props.onAuthRefreshStateChange) {
      props.onAuthRefreshStateChange(isAutoRefresh)
    }
  }, [isAutoRefresh, props])

  return (
    <Headline
      as="h2"
      size="two"
      className={cn(
        isSticky ? 'sticky top-0' : '',
        'flex items-center justify-between shadow bg-white z-10 px-3 py-3',
      )}
    >
      <div
        className="flex items-center"
        css={css`
          padding-left: env(safe-area-inset-left);
        `}
      >
        <BackButton />
        <div>{props.title}</div>
      </div>

      {props.hasAutoRefresh && (
        <div
          onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          className={cn(
            'bg-blue-500 text-white cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ease-in-out',
            isAutoRefresh && 'bg-red-400',
          )}
          css={[
            css`
              margin-right: env(safe-area-inset-right);
            `,
          ]}
        >
          <ReloadIcon
            className={cn('w-6 h-6', isAutoRefresh && 'animate-spin')}
          />
        </div>
      )}
    </Headline>
  )
}

export default PageTitle
