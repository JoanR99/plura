import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="h-full flex items-center justify-center">{children}</div>
	);
}
