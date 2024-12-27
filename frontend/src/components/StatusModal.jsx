const StatusModal = ({ status, error }) => {
  const goToHomepage = () => {
    window.location.href = '/';
  }

  if (!['pending', 'failed'].includes(status)) return null

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black backdrop-blur-sm bg-opacity-50 z-50`}>
      <div className="bg-flash-white rounded-lg shadow-lg p-6 w-96 text-center">
        {status === "pending" && (
          <>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-700 text-lg">Loading, please wait...</p>
          </>
        )}
        {status === "failed" && (
          <>
            <p className="text-red-500 text-lg font-semibold">Error</p>
            <p className="mt-2 text-cool-gray">{error}</p>
            <button
              onClick={goToHomepage}
              className="mt-8 px-6 py-3 bg-dark-blue/90 text-flash-white text-sm font-medium rounded-lg shadow-md hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 ease-in-out"
            >
              Go to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusModal;