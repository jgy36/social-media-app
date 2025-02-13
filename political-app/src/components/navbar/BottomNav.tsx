import Link from "next/link";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 w-full bg-gray-800 text-white flex justify-around p-3">
      <Link href="/">Feed</Link>
      <Link href="/community">Community</Link>
      <Link href="/map">Map</Link>
      <Link href="/politicians">Politicians</Link>
      <Link href="/profile">Profile</Link>
    </div>
  );
};

export default BottomNav;
