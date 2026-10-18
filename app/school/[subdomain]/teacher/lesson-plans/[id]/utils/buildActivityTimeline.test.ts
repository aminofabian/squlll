import { describe, expect, it } from 'vitest'
import { buildActivityTimeline } from './buildActivityTimeline'

const activity = (minutes: number, title = 'Step') => ({ minutes, title })

describe('buildActivityTimeline', () => {
  it('places segments back to back and reports remaining time', () => {
    const timeline = buildActivityTimeline([activity(10), activity(20)], 40)
    expect(timeline.segments.map((s) => [s.startMinute, s.endMinute])).toEqual([
      [0, 10],
      [10, 30],
    ])
    expect(timeline.segments[0].percent).toBe(25)
    expect(timeline.remainingMinutes).toBe(10)
    expect(timeline.remainingPercent).toBe(25)
    expect(timeline.overflowMinutes).toBe(0)
  })

  it('scales to the total when activities overrun the lesson', () => {
    const timeline = buildActivityTimeline([activity(30), activity(20)], 40)
    expect(timeline.overflowMinutes).toBe(10)
    expect(timeline.remainingMinutes).toBe(0)
    expect(timeline.segments[0].percent).toBe(60)
  })

  it('treats invalid minutes as zero and survives an empty plan', () => {
    expect(buildActivityTimeline([activity(Number.NaN)], 0).totalMinutes).toBe(0)
    expect(buildActivityTimeline([], 40).remainingPercent).toBe(100)
  })
})
