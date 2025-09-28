import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center p-8 bg-card rounded-xl border border-border shadow-lg">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-4 text-primary animate-fade-in-up">
          404
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-6 animate-fade-in-up animation-delay-500">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-300 animate-fade-in-up animation-delay-1000"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
