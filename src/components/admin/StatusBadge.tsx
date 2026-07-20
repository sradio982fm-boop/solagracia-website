import { Badge } from "@mantine/core";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "published") {
    return (
      <Badge
        variant="dot"
        color="teal"
        size="sm"
        radius="sm"
        tt="capitalize"
        fw={500}
        styles={{
          root: {
            textTransform: "none",
            background: "transparent",
            border: "none",
            paddingInline: 0,
            height: "auto",
          },
        }}
      >
        Published
      </Badge>
    );
  }

  return (
    <Badge
      variant="dot"
      color="gray"
      size="sm"
      radius="sm"
      fw={500}
      styles={{
        root: {
          textTransform: "none",
          background: "transparent",
          border: "none",
          paddingInline: 0,
          height: "auto",
        },
      }}
    >
      Draft
    </Badge>
  );
}
