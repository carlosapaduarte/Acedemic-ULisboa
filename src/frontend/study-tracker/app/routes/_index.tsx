import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useIsLoggedIn } from "~/components/auth/Authn";

export const meta: MetaFunction = () => {
  return [
    { title: "Study Tracker" },
    { name: "Study Tracker", content: "Welcome to Study Tracker!" },
  ];
};

export default function Index() {
  return (
    <WelcomePage />
  );
}

export function WelcomePage() {
  const { handleOnProceedClick } = useWelcomePage();

  return (
      <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
          <div className="mx-[5%] my-[10%] flex h-full w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
              <h1 className="text-4xl font-bold text-secondary">
                Study Tracker           
              </h1>
              <button
                onClick={handleOnProceedClick}
              >
                Initiate Login
              </button>
          </div>
      </div>
  );
}

function useWelcomePage() {
  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();

  useEffect(() => {
      if (isLoggedIn) {
        console.log('User is logged-in. Re-directing to Dashboard page!')
        
        const cachedUserId = localStorage["userId"]; // TODO: use cache just for now
        navigate(`/dashboard/${cachedUserId}`);
      }
  }, [isLoggedIn]);

  const handleOnProceedClick = () => {
      if (!isLoggedIn) {
          navigate("/log-in");
      }
  };

  return { handleOnProceedClick };
}
