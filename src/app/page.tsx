"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
const App = () => {
  const router = useRouter();
  // Redirect to /login
  useEffect(() => {
    router.push("/login");
  }, []);
  return <div>App</div>;
};

export default App;
