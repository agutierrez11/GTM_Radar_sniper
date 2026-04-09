import { redirect } from "next/navigation";

/**
 * Landing page redirigida a la aplicación principal.
 */
export default function LandingPage() {
  redirect("/app");
}
