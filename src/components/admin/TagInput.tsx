"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { Badge, Group, TextInput, Text, Stack } from "@mantine/core";
import { changeValue } from "@/lib/admin/form";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxLength?: number;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  maxTags = 5,
  maxLength = 30,
  placeholder = "Ketik lalu tekan Enter",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(() => {
    const tag = inputValue.trim();
    if (!tag) return;
    if (tag.length > maxLength) return;
    if (value.length >= maxTags) return;
    if (value.includes(tag)) return;

    onChange([...value, tag]);
    setInputValue("");
  }, [inputValue, value, onChange, maxTags, maxLength]);

  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag();
      }
      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value.length - 1);
      }
    },
    [addTag, inputValue, value, removeTag],
  );

  return (
    <Stack gap="xs">
      <Group gap={6}>
        {value.map((tag, i) => (
          <Badge
            key={i}
            variant="light"
            color="gray"
            size="md"
            rightSection={
              <i
                className="material-icons text-[12px] cursor-pointer"
                onClick={() => removeTag(i)}
                style={{ lineHeight: 1 }}
              >
                close
              </i>
            }
          >
            {tag}
          </Badge>
        ))}
      </Group>
      {value.length < maxTags && (
        <TextInput
          value={inputValue}
          onChange={(e) => setInputValue(changeValue(e))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          size="xs"
        />
      )}
      <Text size="xs" c="dimmed">
        {value.length}/{maxTags} tag
      </Text>
    </Stack>
  );
}
