'use client';
import Image from "next/image";

import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "../firebase/ClientApp";


export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  console.log( "Loading: ", loading, "", "Current user:", user);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

    </div>
  );
}
