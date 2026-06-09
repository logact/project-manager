import { useState, useEffect, useCallback, useRef } from 'react'

interface TimerState {
  timeLeft: number
  isRunning: boolean
  duration: number
}

const DEFAULT_DURATION = 25 * 60 // 25 minutes

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTimeRef = useRef<number>(0)

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const notify = useCallback(() => {
    if (Notification.permission === 'granted') {
      new Notification('Timer finished', {
        body: 'Your focus session is complete!',
        icon: '/vite.svg',
      })
    }
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const start = useCallback(() => {
    requestNotificationPermission()
    setIsRunning(true)
    endTimeRef.current = Date.now() + timeLeft * 1000

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000)
      if (remaining <= 0) {
        setTimeLeft(0)
        setIsRunning(false)
        clearTimerInterval()
        notify()
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
  }, [timeLeft, clearTimerInterval, notify, requestNotificationPermission])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimerInterval()
  }, [clearTimerInterval])

  const reset = useCallback((newDuration?: number) => {
    setIsRunning(false)
    clearTimerInterval()
    const d = newDuration ?? duration
    setTimeLeft(d)
    if (newDuration) setDuration(newDuration)
  }, [clearTimerInterval, duration])

  const toggle = useCallback(() => {
    if (isRunning) {
      pause()
    } else {
      start()
    }
  }, [isRunning, pause, start])

  useEffect(() => {
    return () => clearTimerInterval()
  }, [clearTimerInterval])

  return {
    timeLeft,
    isRunning,
    duration,
    start,
    pause,
    reset,
    toggle,
  }
}
