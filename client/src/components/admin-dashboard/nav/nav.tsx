import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/user";
export default function Nav() {
    const { logout } = useUser();
  
  return (

      <div className="flex h-16 items-center justify-between px-6  bg-sidebar">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="font-bold text-xl flex flex-row items-center gap-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M6.86 1.25h.127c.351 0 .577 0 .798.02a4.75 4.75 0 0 1 2.474.98h6.299c.409 0 .687 0 .931.032a3.75 3.75 0 0 1 3.248 3.427a3 3 0 0 1 .77.503q.15.133.281.28c.529.588.754 1.303.86 2.144c.102.812.102 1.838.102 3.111v2.31c0 1.837 0 3.293-.153 4.432c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H9.944c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433V6.86c0-.797 0-1.303.082-1.74A4.75 4.75 0 0 1 5.12 1.331c.438-.082.944-.082 1.74-.082m12.287 4.078a2.25 2.25 0 0 0-1.853-1.559c-.134-.017-.306-.019-.794-.019h-4.689c.643.64.935.906 1.266 1.09q.328.182.689.286c.413.117.866.124 2.062.124h.425c1.162 0 2.119 0 2.894.078M6.95 2.75c-.917 0-1.271.003-1.553.056a3.25 3.25 0 0 0-2.59 2.591c-.054.282-.057.636-.057 1.553V14c0 1.907.002 3.262.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.028.138 2.382.14 4.289.14h4c1.907 0 3.262-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.138-1.027.14-2.382.14-4.289v-2.202c0-1.336-.001-2.267-.09-2.975c-.087-.689-.246-1.06-.487-1.328a2 2 0 0 0-.168-.168c-.268-.241-.64-.4-1.328-.487c-.707-.089-1.639-.09-2.975-.09h-.484c-1.048 0-1.724 0-2.363-.182c-.35-.1-.689-.24-1.008-.417c-.58-.324-1.058-.801-1.8-1.543l-.077-.078l-.55-.55a8 8 0 0 0-.503-.482a3.25 3.25 0 0 0-1.771-.734a8 8 0 0 0-.696-.014m5.3 7.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="lg:flex hidden">FTP Admin</span>
          </a>
        </div>
    
        <div className="flex space-x-2">
          <Button 
            className="relative" 
            variant="ghost" 
            size="sm" 
            asChild
            >
            <a href="/Notification">
              <Bell className="h-5 w-5" />
              <div className=" absolute text-sm -top-1 -right-1 flex items-center justify-center size-4.5 bg-red-400 rounded-full">12</div>
            </a>
          </Button>
          <Button 
            className="relative" 
            variant="ghost" 
            size="sm" 
            asChild
            onClick={logout}
            >
              <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
  );
}
