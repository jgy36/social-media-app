interface ProfileSettingsProps {
  onLogout: () => void; // ✅ Define the `onLogout` function prop
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onLogout }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* ✅ Logout Button */}
      <button
        onClick={onLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileSettings;
