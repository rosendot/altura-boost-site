export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-gray-900 border border-primary-700 rounded-lg p-8 card-glow">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Login</h1>
        <p className="text-gray-400 text-center mb-8">Sign in to your account</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <button className="w-full py-3 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-6">
            LOGIN
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400">
          <p className="mb-4">Don&apos;t have an account?</p>
          <button className="text-primary-400 hover:text-primary-300 transition font-semibold">
            Sign Up
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-2">Want to become a booster?</p>
          <button className="text-primary-400 hover:text-primary-300 transition font-semibold">
            Click Here
          </button>
        </div>
      </div>
    </main>
  );
}
