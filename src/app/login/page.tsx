export default function LoginPage() {
  return (
    <main className="fixed inset-0 bg-black flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: "url('/assets/images/login_page_background.webp')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Login Form */}
      <div className="max-w-md w-full bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Login</h1>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <button className="w-full py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-4">
            LOGIN
          </button>
        </div>

        <div className="mt-4 text-center text-sm space-y-2">
          <p className="text-gray-400">
            Don&apos;t have an account?{" "}
            <button className="text-primary-400 hover:text-primary-300 transition font-semibold">
              Sign Up
            </button>
          </p>
          <p className="text-gray-400">
            Want to become a booster?{" "}
            <button className="text-primary-400 hover:text-primary-300 transition font-semibold">
              Click Here
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
