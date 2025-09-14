"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { PasswordProtection } from "@/components/password-protection";

export default function ProtectedLinkPage() {
  const params = useParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  const shortCode = params.shortCode as string;

  useEffect(() => {
    const checkUrlStatus = async () => {
      try {
        const response = await fetch(`/api/check-url/${shortCode}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Link not found");
            router.push("/");
          } else if (response.status === 403) {
            toast.error("Link has expired or is inactive");
            router.push("/");
          } else if (!data.isPasswordProtected) {
            // Not password protected, redirect directly
            window.location.href = `/${shortCode}`;
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to verify link");
        router.push("/");
      } finally {
        setIsVerifying(false);
      }
    };
    checkUrlStatus();
  }, [shortCode, router]);

  const handlePasswordSuccess = () => {
    // Redirect to the original short URL which will now work
    window.location.href = `/${shortCode}`;
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PasswordProtection
      shortCode={shortCode}
      onSuccess={handlePasswordSuccess}
    />
  );
}
