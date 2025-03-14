export type Section = {
  id: string;
  label: string;
  disabled?: boolean;
};

export const SECTIONS: Section[] = [
  { id: 'start', label: 'Start animation' },
  { id: 'posts', label: 'Posts' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
];
