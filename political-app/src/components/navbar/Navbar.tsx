import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full p-4 bg-gray-800 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">PoliticalApp</h1>
      <div className="flex gap-4">
        <Link href="/">Feed</Link>
        <Link href="/community">Community</Link>
        <Link href="/map">Map</Link>
        <Link href="/politicians">Politicians</Link>
        <Link href="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
