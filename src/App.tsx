import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { logout } from "./services/auth";

const router = getRouter();

export default function App() {
  useEffect(() => {
    // TODO: Hook into Discord Embedded App SDK disconnect events (DiscordSDK.on('DISCONNECT'))
    const handleBeforeUnload = () => {
      // Auto-logout UI shell session on window unload
      logout();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <RouterProvider router={router} />;
}
