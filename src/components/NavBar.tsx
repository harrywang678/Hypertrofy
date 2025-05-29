import Link from "next/link";

export default function NavBar() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold">Liftly</h1>
      <nav className="mt-2">
        <ul className="flex gap-4">
          <li>
            <Link href={"/"}>Home</Link>
          </li>
          <li>
            <Link href={`/post`}>Routines</Link>
          </li>
          <li>
            <Link href={"/user/login"}>Login</Link>
          </li>
          <li>
            <Link href={"/user/signup"}>Sign Up</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
