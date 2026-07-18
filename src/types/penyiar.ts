export type PenyiarHost = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  tags: string[];
  imageSrc: string;
  imageAlt: string;
  number: string;
  href?: string;
};

export type PenyiarContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  hosts: PenyiarHost[];
};
