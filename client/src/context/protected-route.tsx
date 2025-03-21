import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/user";
import Loading from "@/components/loading";
import axiosInstance from "@/lib/axios";

interface Props {
  redirectPath?: string;
  children: React.ReactNode;
  onlyAdmin?: boolean; // Add this prop
}

const ProtectedRoute = ({
  redirectPath = "/login",
  children,
  onlyAdmin = false,
}: Props) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const { setUser, setIsLoading, isLoading } = useUser();

  const { mutate: verifyToken } = useMutation({
    mutationFn: () => {
      return axiosInstance.get("/auth/validate-token");
    },
    onSuccess: (response) => {
      const userData = response.data.user_data;

      if (onlyAdmin && !userData.is_admin) {
        setIsAllowed(false);
      } else {
        setIsAllowed(true);
        setUser(userData);
      }
    },
    onError: () => {
      setIsAllowed(false);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
