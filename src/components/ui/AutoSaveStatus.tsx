type AutoSaveStatusProps = {
  status: "idle" | "saving" | "saved" | "error";
};

export const AutoSaveStatus = ({ status }: AutoSaveStatusProps) => {
  if (status === "idle") return null;

  const statusConfig = {
    saving: {
      color: "yellow",
      text: "Saving...",
      animate: true,
    },
    saved: {
      color: "green",
      text: "Saved",
      animate: false,
    },
    error: {
      color: "red",
      text: "Error saving",
      animate: false,
    },
  }[status];

  return (
    <div className="text-xs flex items-center mt-0.5">
      <div className={`flex items-center gap-1.5 text-${statusConfig.color}-500/80`}>
        <div 
          className={`w-1.5 h-1.5 rounded-full bg-${statusConfig.color}-500 ${
            statusConfig.animate ? "animate-pulse" : ""
          }`} 
        />
        {statusConfig.text}
      </div>
    </div>
  );
}; 