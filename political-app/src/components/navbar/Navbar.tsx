import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full p-4 bg-[var(--navbar-color)] flex justify-between items-center">
      {/* ✅ Branding - Home link */}
      <Link href="/" className="text-xl font-bold">
        PoliticalApp
      </Link>

      {/* ✅ Navigation Links */}
      <div className="flex gap-4">
        <Link href="/feed">Feed</Link>
        <Link href="/community">Community</Link>
        <Link href="/map">Map</Link>
        <Link href="/politicians">Politicians</Link>
        <Link href="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
