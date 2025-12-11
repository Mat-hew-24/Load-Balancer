'use client'

import { useState, useEffect } from 'react'
import LetterGlitch from '../components/LetterGlitch'

export default function Home() {
  const [output, setOutput] = useState('Waiting for requests...')
  const [isLoading, setIsLoading] = useState(false)
  const [requestHistory, setRequestHistory] = useState<string[]>([])
  const [serverStats, setServerStats] = useState<Record<string, number>>({})
  const [healthyServers, setHealthyServers] = useState<number[]>([])
  const [requestThreshold, setRequestThreshold] = useState(3)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second (just ui extras)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  //real time bar feel
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/stats')
        const data = await response.json()
        setServerStats(data.serverStats)
        setHealthyServers(data.healthyServers)
        if (data.requestThreshold) {
          setRequestThreshold(data.requestThreshold)
        }
      } catch {}
    }

    const interval = setInterval(fetchStats, 100) // Faster updates for real-time feel
    return () => clearInterval(interval)
  }, [])

  const handleRoundRobinRequest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8080')
      const data = await response.text()
      setOutput(data)
      setRequestHistory((prev) => [...prev, data].slice(-10))
    } catch (error) {
      setOutput('ERROR: Load balancer connection failed')
      console.error(error)
    }
    setIsLoading(false)
  }

  const clearHistory = () => {
    setRequestHistory([])
    setOutput('Terminal cleared.')
  }

  const getServerStatusSymbol = (port: number) => {
    const requestCount = serverStats[port] || 0
    const isHealthy = healthyServers.includes(port)
    const isOverloaded = requestCount >= requestThreshold

    if (isOverloaded) return '🔴 OVERLOAD'
    if (isHealthy) return '🟢 ONLINE'
    return '⚪ OFFLINE'
  }

  const getBarWidth = (count: number) => {
    const maxCount = Math.max(...Object.values(serverStats), requestThreshold)
    return Math.min((count / Math.max(maxCount, 1)) * 100, 100)
  }

  return (
    <div className='min-h-screen relative bg-black text-green-400 font-mono p-4'>
      {/* LetterGlitch Background */}
      <div className='absolute inset-0 opacity-40'>
        <LetterGlitch
          glitchColors={['#15803d', '#22c55e', '#4ade80', '#84cc16', '#65a30d']}
          glitchSpeed={80}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
          characters='LOADBALAN=CER0123456789ROUNDROBIN$GDSC#./+-*%@!&'
        />
      </div>

      {/* Terminal Content - positioned above background */}
      <div className='relative opacity-80 z-10'>
        {/* Terminal Header */}
        <div className='border border-green-400 rounded-t-lg bg-gray-900/90 backdrop-blur-sm p-2 text-center'>
          <span className='text-green-300'>●●●</span>
          <span className='ml-4 text-green-400'>
            GDSC-LoadBalancer-Terminal v1.0
          </span>
          <span className='ml-4 text-green-300 text-sm'>
            {currentTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Terminal Body */}
        <div className='border-x border-b border-green-400 rounded-b-lg bg-black/90 backdrop-blur-sm p-4'>
          {/* Title */}
          <div className='mb-4'>
            <div className='text-green-300 text-xl'>
              ROUND ROBIN LOAD BALANCER MONITOR
            </div>
            <div className='text-green-400 text-sm mt-1'>
              │ Auto-scaling threshold: {requestThreshold} req/s │
            </div>
            <div className='text-green-300'></div>
          </div>

          {/* Control Panel */}
          <div className='mb-4 p-3 border border-green-600 rounded bg-black/70'>
            <div className='text-green-300 mb-2'>┌─ CONTROL PANEL ─┐</div>
            <div className='flex gap-4'>
              <button
                onClick={handleRoundRobinRequest}
                disabled={isLoading}
                className='bg-black disabled:bg-gray-700 text-green-100 px-4 py-2 border border-green-600 rounded transition-colors'
              >
                {isLoading ? '[SENDING...]' : '[SEND REQUEST]'}
              </button>
              <button
                onClick={clearHistory}
                className='bg-black text-red-100 px-4 py-2 border border-red-600 rounded transition-colors'
              >
                [CLEAR LOG]
              </button>
            </div>
          </div>

          {/* Server Stats with Bar Graph */}
          <div className='mb-4 p-3 border border-green-600 rounded bg-black/70'>
            <div className='text-green-300 mb-2'>
              ┌─ REAL-TIME SERVER STATS ─┐
            </div>
            <div className='space-y-2'>
              {[5001, 5002, 5003, 5004, 5005].map((port) => {
                const requestCount = serverStats[port] || 0
                const barWidth = getBarWidth(requestCount)
                const isOverloaded = requestCount >= requestThreshold
                const isHealthy = healthyServers.includes(port)

                return (
                  <div key={port} className='flex items-center text-sm'>
                    <div className='w-16 text-green-400'>:{port}</div>
                    <div className='w-8 text-right text-green-300'>
                      {requestCount}
                    </div>
                    <div className='flex-1 mx-2 bg-gray-800 rounded h-4 relative overflow-hidden'>
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOverloaded
                            ? 'bg-red-500'
                            : isHealthy
                            ? 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                      {requestCount > 0 && (
                        <div className='absolute inset-0 flex items-center justify-center text-xs text-black font-bold'>
                          {requestCount}
                        </div>
                      )}
                    </div>
                    <div className='w-24 text-xs'>
                      {getServerStatusSymbol(port)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className='mt-2 text-xs text-green-600'>
              │ Threshold: {requestThreshold} req/s │ Update: 200ms │
              Auto-restart: 15s │
            </div>
          </div>

          <div className='mb-4 p-3 border border-green-600 rounded bg-black/70'>
            <div className='text-green-300 mb-2'>┌─ LAST RESPONSE ─┐</div>
            <div className='bg-gray-900/80 p-2 rounded border'>
              <span className='text-green-400'>$ </span>
              <span
                className={`${
                  output.includes('ERROR')
                    ? 'text-red-400'
                    : output.includes('PORT')
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}
              >
                {output}
              </span>
            </div>
          </div>

          {/* Request History */}
          {requestHistory.length > 0 && (
            <div className='mb-4 p-3 border border-green-600 rounded bg-black/70'>
              <div className='text-green-300 mb-2'>
                ┌─ REQUEST LOG ({requestHistory.length}/10) ─┐
              </div>
              <div className='bg-gray-900/80 p-2 rounded border max-h-40 overflow-y-auto'>
                {requestHistory
                  .slice()
                  .reverse()
                  .map((response, index) => (
                    <div key={index} className='text-sm'>
                      <span className='text-green-600'>
                        [{String(index + 1).padStart(2, '0')}]
                      </span>
                      <span className='text-green-400'> → {response}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* System Info */}
          <div className='text-xs text-green-600 border-t border-green-800 pt-2'>
            │ Status: Load Balancer Active │ Servers: 5 │ Algorithm: Round Robin
            │
            <br />│ Monitoring: Real-time │ Auto-scaling: Enabled │ Health
            Check: 2s │
          </div>
        </div>
      </div>
    </div>
  )
}
