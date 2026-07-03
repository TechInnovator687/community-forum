import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/atoms";

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export function SearchBar({ label, ...props }: SearchBarProps) {
  return <Input type="search" {...(label === undefined ? {} : { label })} {...props} />;
}
