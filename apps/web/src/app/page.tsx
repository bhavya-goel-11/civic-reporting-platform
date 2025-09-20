import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard as this is now an admin portal
  redirect('/dashboard');
}
