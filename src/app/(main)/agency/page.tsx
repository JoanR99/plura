import AgencyDetails from '@/components/forms/agency-details';
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';
import type { Plan } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function Page({
	searchParams,
}: {
	searchParams: {
		plan: Plan;
		state: string;
		code: string;
	};
}) {
	const agencyId = await verifyAndAcceptInvitation();

	const user = await getAuthUserDetails();

	if (agencyId) {
		if (user?.role === 'SUBACCOUNT_USER' || user?.role === 'SUBACCOUNT_GUEST') {
			return redirect('/subaccount');
		}

		if (user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENCY_OWNER') {
			if (searchParams.plan) {
				return redirect(
					`/agency/${agencyId}/billing?plan=${searchParams.plan}`
				);
			}

			if (searchParams.state) {
				const statePath = searchParams.state.split('___')[0];
				const stateAgencyId = searchParams.state.split('___')[1];

				if (!stateAgencyId) return <div>Not authorized</div>;

				return redirect(
					`/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
				);
			}

			return redirect(`/agency/${agencyId}`);
		}
		return <div>Not authorized</div>;
	}

	const authUser = await currentUser();

	return (
		<div className="flex justify-center items-center mt-4">
			<div className="max-w-[850px] border-[1px] p-4 rounded-xl">
				<h1 className="text-4xl"> Create An Agency</h1>
				<AgencyDetails
					data={{
						companyEmail: authUser?.emailAddresses[0]?.emailAddress,
					}}
				/>
			</div>
		</div>
	);
}
