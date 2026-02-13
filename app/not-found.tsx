import { redirect } from 'next/navigation';

export default function NotFound() {
  // Redirect to the default page (e.g., homepage)
  redirect('/challanges');
  return null;
}
