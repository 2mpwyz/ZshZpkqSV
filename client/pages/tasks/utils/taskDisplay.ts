export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "todo":
      return "bg-yellow-50 border-l-4 border-l-yellow-500";
    case "in_progress":
      return "bg-blue-50 border-l-4 border-l-blue-500";
    case "in_review":
      return "bg-purple-50 border-l-4 border-l-purple-500";
    case "completed":
      return "bg-green-50 border-l-4 border-l-green-500";
    default:
      return "bg-gray-50 border-l-4 border-l-gray-500";
  }
};

export const getStatusIcon = (
  status: string
): "todo" | "in_progress" | "in_review" | "completed" | "unknown" => {
  switch (status) {
    case "todo":
      return "todo";
    case "in_progress":
      return "in_progress";
    case "in_review":
      return "in_review";
    case "completed":
      return "completed";
    default:
      return "unknown";
  }
};

export const getStatusLabel = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
