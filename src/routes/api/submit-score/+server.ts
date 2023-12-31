import { error, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/firebase/firebase';
import type { UserData } from '$lib/types';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	updateDoc,
	where
} from 'firebase/firestore';
import { updateOverallRankings, updateRankTitle, updateSectionRankings } from '$lib/utils/update';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.formData();
		const matchSetId = data.get('matchSetId')?.toString() || '';
		const userUid = data.get('userUid')?.toString() || '';

		let scores: number[] = [];
		let difference: number;

		// Variable not used yet
		let result = {
			winner: '',
			loser: ''
		};

		for (const [name, value] of data.entries()) {
			if (name.startsWith('score-')) {
				const score = Number(value);
				scores.push(score);
			}
		}

		difference = Math.abs(scores[0] - scores[1]);

		// TODO: Use Zod for input validation
		for (const [name, value] of data.entries()) {
			if (name.startsWith('initial-score-')) {
				const uid = name.substring('initial-score-'.length);
				const initialScore = Number(value);

				if (isNaN(initialScore)) {
					console.error('Input initial score is not a number.');
					throw error(403, 'Not a number');
				}

				console.log(initialScore);

				const userRef = doc(db, 'users', uid);

				await setDoc(userRef, { score: initialScore }, { merge: true });
			}

			if (name.startsWith('score-')) {
				const uid = name.substring('score-'.length);
				const score = Number(value);

				if (isNaN(score)) {
					console.error('Score is not a number.');
					throw error(403, 'Not a number');
				}

				const userRef = doc(db, 'users', uid);
				const userDoc = await getDoc(userRef);
				const userData = userDoc.data() as UserData;
				const userPowerCards = userData.power_cards;
				const currentScore = userData.score;

				const isProtected = userPowerCards.find(
					(card) => card.key === "ancient's-protection" && card.activated && !card.used
				);

				// Handle x4 multiplier case
				const isDoubledDown = userPowerCards.filter(
					(card) => card.key === 'double-edged-sword' && card.activated && !card.used
				);
				const multiplier = isDoubledDown.length * 2;

				let finalScore: number;

				if (score === Math.min(...scores)) {
					const reducedScore = score - difference;

					if (isProtected) {
						finalScore = currentScore + score;
					} else if (isDoubledDown) {
						const reducedScore = score - difference * multiplier;
						finalScore = currentScore + reducedScore;
					} else {
						finalScore = currentScore + reducedScore;
					}

					result.loser = name;
				} else {
					const addedScore = score + difference;

					if (isDoubledDown) {
						const addedScore = score + difference * multiplier;
						finalScore = currentScore + addedScore;
					} else {
						finalScore = currentScore + addedScore;
					}

					result.winner = name;
				}

				userPowerCards.forEach((card) => {
					if (card.activated) {
						card.used = true;
					}
				});

				await updateDoc(userRef, { score: finalScore, power_cards: userPowerCards });
				await updateRankTitle(userRef);
				await updateSectionRankings(userData.personal_data.section);
			}
		}

		await updateOverallRankings();
		await updateMatchStatus(matchSetId, userUid);

		console.log('Submitted scores successfully!');

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Score submission error: ', error);
	}

	return new Response();
};

async function updateMatchStatus(id: string, userUID: string) {
	const matchSetMatchesCollection = collection(db, `match_sets/${id}/matches`);
	const matchSetMatchQuery = query(
		matchSetMatchesCollection,
		where('uids', 'array-contains', userUID),
		where('status', '==', 'pending')
	);
	const getMatchSetMatch = await getDocs(matchSetMatchQuery);
	const matchSetMatch = getMatchSetMatch.docs.shift();
	const matchSetMatchRef = doc(db, `match_sets/${id}/matches/${matchSetMatch?.id}`);

	await updateDoc(matchSetMatchRef, { status: 'finished' });
}
