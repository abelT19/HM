"use client";

import { useRouter } from "next/navigation";

export default function TestPage() {
  console.log("🔍 DEBUG: TestPage component mounted");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">Test Navigation Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={() => {
            console.log("🔍 DEBUG: Navigate to /rooms");
            router.push("/rooms");
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          Go to Rooms
        </button>
        
        <button 
          onClick={() => {
            console.log("🔍 DEBUG: Navigate to /");
            router.push("/");
          }}
          className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
        >
          Go to Home
        </button>
        
        <a 
          href="/rooms"
          className="block bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600"
        >
          Go to Rooms (Link)
        </a>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>Current URL: {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}</p>
        <p>Next.js Router: {router ? 'Available' : 'Not Available'}</p>
      </div>
    </div>
  );
}
