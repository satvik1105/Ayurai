import { useUser } from "@clerk/clerk-react";

function UserInfo() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <p>Loading user...</p>;
  }

  if (!isSignedIn) {
    return <p>Please sign in.</p>;
  }

  return (
    <div className="mx-auto mt-32 max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-green-950">
        Welcome to AyurAI 🌿
      </h2>

      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Name:</strong>{" "}
          {user.fullName || "Not available"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user.primaryEmailAddress?.emailAddress || "Not available"}
        </p>

        <p>
          <strong>User ID:</strong>{" "}
          <span className="break-all text-sm">
            {user.id}
          </span>
        </p>
      </div>
    </div>
  );
}

export default UserInfo;