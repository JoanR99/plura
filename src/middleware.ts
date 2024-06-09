import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
	'/',
	'/site',
	'/api/uploadthing',
	'/agency/sign-in(.*)',
	'/agency/sign-up(.*)',
	'/sign-in',
	'/sign-up',
]);

export default clerkMiddleware((auth, request) => {
	if (!isPublicRoute(request)) {
		auth().protect();
	}

	// rewrite for domains

	const url = request.nextUrl;
	const searchParams = url.searchParams.toString();
	const hostname = request.headers;

	const pathWithSearchParams = `${url.pathname}${
		searchParams ? `?${searchParams}` : ''
	}`;

	// if subdomain exists
	const customSubdomain = hostname
		.get('host')
		?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
		.filter(Boolean)[0];

	if (customSubdomain) {
		return NextResponse.rewrite(
			new URL(`/${customSubdomain}${pathWithSearchParams}`, request.url)
		);
	}

	if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
		return NextResponse.redirect(new URL('/agency/sign-in', request.url));
	}

	if (
		url.pathname === '/' ||
		(url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
	) {
		return NextResponse.rewrite(new URL('/site', request.url));
	}

	if (
		url.pathname.startsWith('/agency') ||
		url.pathname.startsWith('/subdomain')
	) {
		return NextResponse.rewrite(new URL(pathWithSearchParams, request.url));
	}
});

export const config = {
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
