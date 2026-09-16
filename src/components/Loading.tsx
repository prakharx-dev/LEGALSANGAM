import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Loading Legal Sangam
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your experience...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
