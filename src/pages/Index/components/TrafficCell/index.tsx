/** @jsx jsx */
import { jsx } from '@emotion/core'
import styled from '@emotion/styled/macro'
import css from '@emotion/css/macro'
import loadable from '@loadable/component'
import bytes from 'bytes'
import { ChartPoint } from 'chart.js'
import useSWR from 'swr'
import tw from 'twin.macro'
import React, { useEffect, useMemo, useState } from 'react'

import { ConnectorTraffic, Traffic } from '../../../../types'
import fetcher from '../../../../utils/fetcher'

const LineChart = loadable(() => import('./components/LineChart'), {
  fallback: (
    <div
      tw="flex items-center justify-center text-sm text-gray-500"
      css={css`
        height: 200px;
      `}>
      Loading...
    </div>
  ),
})

const Cell = styled.div`
  ${tw`px-4 py-3`}
`

const Title = styled.div`
  ${tw`text-xs md:text-sm text-gray-500 leading-relaxed font-medium`}
`

const Data = styled.div`
  ${tw`text-base md:text-lg text-gray-700 leading-normal`}
`

export const REFRESH_RATE = 1000

const Index: React.FC = () => {
  const { data: traffic, error: trafficError } = useSWR(
    '/traffic',
    (url) =>
      fetcher<Traffic & { nowTime: number }>(url).then((res) => {
        res.nowTime = Date.now()
        return res
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: REFRESH_RATE,
      dedupingInterval: REFRESH_RATE,
    },
  )
  const [trafficDatasets, setTrafficDatasets] = useState<{
    up: Array<ChartPoint>
    down: Array<ChartPoint>
  }>({
    up: [],
    down: [],
  })

  const newDatasets = useMemo(() => {
    return [
      {
        label: 'Up',
        data: trafficDatasets.up,
      },
      {
        label: 'Down',
        data: trafficDatasets.down,
      },
    ]
  }, [trafficDatasets])

  const activeInterface = useMemo(() => {
    if (!traffic) return undefined

    const aggregation: ConnectorTraffic = {
      outCurrentSpeed: 0,
      in: 0,
      inCurrentSpeed: 0,
      outMaxSpeed: 0,
      out: 0,
      inMaxSpeed: 0,
    }

    for (const name in traffic.interface) {
      const conn = traffic.interface[name]
      aggregation.in += conn.in
      aggregation.out += conn.out
      aggregation.outCurrentSpeed += conn.outCurrentSpeed
      aggregation.inCurrentSpeed += conn.inCurrentSpeed
    }

    return aggregation
  }, [traffic])

  // Build datasets for chart
  useEffect(() => {
    if (!activeInterface) return undefined

    setTrafficDatasets(() => {
      const time = new Date()
      const newUps = [{ x: time, y: activeInterface.outCurrentSpeed }]
      const newDowns = [{ x: time, y: activeInterface.inCurrentSpeed }]

      return {
        up: newUps,
        down: newDowns,
      }
    })
  }, [activeInterface])

  return (
    <div>
      <div tw="mb-3 w-full overflow-hidden">
        <LineChart id="traffic-chart" newDatasets={newDatasets} />
      </div>

      {activeInterface ? (
        <div tw="grid grid-cols-3 gap-4 divide-x divide-gray-200 border-solid border border-gray-200 bg-gray-100">
          <Cell>
            <Title>Upload</Title>
            <Data>{bytes(activeInterface.outCurrentSpeed)}/s</Data>
          </Cell>
          <Cell>
            <Title>Download</Title>
            <Data>{bytes(activeInterface.inCurrentSpeed)}/s</Data>
          </Cell>
          <Cell>
            <Title>Total</Title>
            <Data>{bytes(activeInterface.in + activeInterface.out)}</Data>
          </Cell>
        </div>
      ) : (
        <div
          css={[
            tw`border border-gray-200 bg-gray-100 text-gray-700`,
            css`
              height: 67px;
              line-height: 67px;
              text-align: center;
            `,
          ]}>
          Loading...
        </div>
      )}
    </div>
  )
}

export default Index
