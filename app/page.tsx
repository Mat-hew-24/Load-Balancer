'use client'

import { useState } from 'react'

export default function Home() {
  const [output, setOutput] = useState('Output will appear here...')
  const [isLoading, setIsLoading] = useState(false)
  const [requestHistory, setRequestHistory] = useState<string[]>([])
  const [stats, setStats] = useState<number[]>([])

  const handleRoundRobinRequest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8080')
      const data = await response.text()
      console.log(data)
      setOutput(data)
      setRequestHistory((prev) => [...prev, data].slice(-10)) // Keep last 10 requests
    } catch (error) {
      setOutput(
        'Error: Could not connect to load balancer. Make sure servers are running.'
      )
      console.error(error)
    }
    setIsLoading(false)
  }

  const clearHistory = () => {
    setRequestHistory([])
    setOutput('Output will appear here...')
  }

  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
          Task 4 - Round Robin Load Balancer
        </h1>

        <div className='flex gap-4 mb-6'>
          <button
            onClick={handleRoundRobinRequest}
            disabled={isLoading}
            className='flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none'
          >
            {isLoading ? 'Loading...' : 'Send Round Robin Request'}
          </button>

          <button
            onClick={clearHistory}
            className='bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out'
          >
            Clear
          </button>
        </div>

        <div className='bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6'>
          <h3 className='text-lg font-semibold text-gray-700 mb-3'>
            Current Response:
          </h3>
          <div className='bg-white border border-gray-300 rounded p-3 min-h-[60px] flex items-center'>
            <p
              className={`${
                output.includes('Error')
                  ? 'text-red-600'
                  : output.includes('PORT')
                  ? 'text-green-600 font-mono'
                  : 'text-gray-600 italic'
              }`}
            >
              {output}
            </p>
          </div>
        </div>

        {/* Request History */}
        {requestHistory.length > 0 && (
          <div className='bg-gray-50 border-2 border-gray-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-gray-700 mb-3'>
              Request History (Last {requestHistory.length} requests - newest
              first):
            </h3>
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {requestHistory
                .slice()
                .reverse()
                .map((response, index) => (
                  <div
                    key={index}
                    className='bg-white border border-gray-300 rounded p-2 text-sm'
                  >
                    <span className='text-gray-500 mr-2'>#{index + 1}:</span>
                    <span className='font-mono text-green-600'>{response}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <h4 className='font-semibold text-blue-800 mb-2'>Instructions:</h4>
          <ol className='text-sm text-blue-700 space-y-1 list-decimal list-inside'>
            <li>
              Make sure the load balancer and servers are running (use the
              launch scripts)
            </li>
            <li>
              Click &quot;Send Round Robin Request&rdquot; to test the load
              balancing
            </li>
            <li>
              Each click will route to the next server in round-robin fashion
            </li>
            <li>
              Watch the PORT numbers change to see the round-robin in action!
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
