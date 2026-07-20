import type { SocialLink } from "@/types/site";

export type KontakChannel = {
  id: string;
  label: string;
  detail: string;
  href: string;
  external?: boolean;
};

export type KontakHotline = {
  label: string;
  number: string;
  href: string;
};

export type KontakFormCopy = {
  nameLabel: string;
  namePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  /** Prefill template — use {name} and {message} */
  whatsappTemplate: string;
};

export type KontakContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  studioLabel: string;
  address: string;
  operatingHours: string;
  email: string;
  frequency: string;
  whatsappNumber: string;
  channels: KontakChannel[];
  hotlines: KontakHotline[];
  socialLinks: SocialLink[];
  form: KontakFormCopy;
};
