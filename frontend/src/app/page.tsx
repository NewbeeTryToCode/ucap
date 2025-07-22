export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-4">
      <div className="text-center max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome! 👋</h1>
          <p className="text-lg text-gray-600 mb-6">
            Ready to order your favorite menu items using just your voice?
          </p>
          <p className="text-gray-500 mb-8">
            Navigate using the menu below to place orders, view analytics, or manage your profile.
          </p>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg">
              <p className="text-blue-700 font-medium">✨ Voice-powered ordering made simple</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
