import { UserButton } from '@clerk/nextjs';

export default function Root() {
  return (
    <div className="p-4">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
