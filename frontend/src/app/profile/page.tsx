import { User } from 'lucide-react';

export default function Profile() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] px-4">
      <div className="text-center max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* Header dan ikon */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-purple-600">Profile</h1>
            <p className="text-gray-600">Manage your profile info</p>
          </div>

          <div className="mb-6">
            <User className="w-16 h-16 text-purple-600 mx-auto" />
          </div>

          {/* Info User */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">John Doe</h2>
          <p className="text-gray-600 mb-4">Restaurant Manager</p>

          <div className="space-y-3 text-left">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">Email</span>
              <p className="font-medium">john.doe@restaurant.com</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-500">Phone</span>
              <p className="font-medium">+1 (555) 123-4567</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
