import { Badge } from "@mantine/core";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "published") {
    return (
      <Badge variant="filled" color="teal" size="sm">
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="light" color="gray" size="sm">
      Draft
    </Badge>
  );
}
