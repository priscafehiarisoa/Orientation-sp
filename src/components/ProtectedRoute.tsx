// 'use client';
//
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "@/firebase/ClientApp";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
//
// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const [user, loading] = useAuthState(auth);
//     const router = useRouter();
//
//     useEffect(() => {
//         if (!loading && !user) {
//             router.push('/login');
//         }
//     }, [user, loading, router]);
//
//     if (loading) {
//         return <div>Loading...</div>;
//     }
//
//     if (!user) {
//         return null;
//     }
//
//     return <>{children}</>;
// }
