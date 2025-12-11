export default function Home() {
  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
          Task 4 Demo
        </h1>

        {/* Button */}
        <button className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 mb-6'>
          Click Me
        </button>

        {/* Output Box */}
        <div className='bg-gray-50 border-2 border-gray-200 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-gray-700 mb-3'>Output:</h3>
          <div className='bg-white border border-gray-300 rounded p-3 min-h-[100px]'>
            <p className='text-gray-600 italic'>Output will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
