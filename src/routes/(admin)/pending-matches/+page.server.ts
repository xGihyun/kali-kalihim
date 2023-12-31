import {
	collection,
	doc,
	getCountFromServer,
	getDoc,
	getDocs,
	setDoc,
	updateDoc
} from 'firebase/firestore';
import { db } from '$lib/firebase/firebase';
import type { CardBattle, PlayerWithDamage, Section, UserData } from '$lib/types';
import { battle } from '$lib/utils/battlecards';
import type { Actions } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
// import { CACHE_DURATION } from '$lib/constants';

// Returns some undefined stuff idk why
// export const load: PageServerLoad = async ({ setHeaders }) => {
// 	const sectionsCollection = collection(db, 'sections');
// 	const getSections = await getDocs(sectionsCollection);
//
// 	let sections: Section[] = [];
//
// 	if (!getSections.empty) {
// 		sections = getSections.docs.map((section) => section.data() as Section);
// 	}
//
// 	setHeaders({ 'cache-control': `max-age=${CACHE_DURATION}, must-revalidate` });
//
// 	return {
// 		sections
// 	};
// };

export const actions: Actions = {
	card_battle: async ({ request }) => {
		const data = await request.formData();
		const cardBattle = data.get('card_battle')?.toString();
		const matchSetId = data.get('match_set_id')?.toString();

		if (!matchSetId) {
			throw new Error('Match set not found.');
		}

		if (!cardBattle) {
			throw new Error('Cards are undefined.');
		}

		const parsedCardBattle = JSON.parse(cardBattle) as CardBattle[];
		const cardBattleResults = await runCardBattle(parsedCardBattle, matchSetId);

		return { cardBattleResults };
	}
};

function addToMatchHistory(users: PlayerWithDamage[]): void {
	const cardBattleHistoryData: CardBattle = {
		players: [...users]
	};

	users.forEach(async (user) => {
		const matchHistoryCollection = collection(
			db,
			`users/${user.auth_data.uid}/card_battle_history`
		);
		const serverCount = await getCountFromServer(matchHistoryCollection);
		const newMatchEntry = doc(
			db,
			`users/${user.auth_data.uid}/card_battle_history/match_${serverCount.data().count + 1}`
		);

		await setDoc(newMatchEntry, cardBattleHistoryData);
	});
}

async function updateCardBattleDocument(
	cardBattle: CardBattle[],
	matchSetId: string,
	idx: number
): Promise<void> {
	const match = cardBattle[idx];
	const player1 = match.players[0];
	const player2 = match.players[1];

	const result = await battle(player1, player2);

	const player1TotalDamage = result[0].totalDamage;
	const player2TotalDamage = result[1].totalDamage;
	const player1Turns = result[0].turns;
	const player2Turns = result[1].turns;
	const player1Cards = result[0].battle_cards;
	const player2Cards = result[1].battle_cards;

	const cardBattleRef = doc(db, `match_sets/${matchSetId}/card_battle/match_${idx + 1}`);

	if (player1TotalDamage !== null) {
		player1.total_damage = player1TotalDamage;
		player1.turns = player1Turns;
		player1.battle_cards = player1Cards;
	} else {
		player1.total_damage = null;
	}

	if (player2TotalDamage !== null) {
		player2.total_damage = player2TotalDamage;
		player2.turns = player2Turns;
		player2.battle_cards = player2Cards;
	} else {
		player2.total_damage = null;
	}

	if (player1TotalDamage && player2TotalDamage) {
		if (player1TotalDamage > player2TotalDamage) {
			console.log('Player 1 scored higher, adding 10 points.');
			await addPointsToWinner(player1);
		} else if (player2TotalDamage > player1TotalDamage) {
			console.log('Player 2 scored higher, adding 10 points.');
			await addPointsToWinner(player2);
		} else {
			console.log('Both scores are equal, no points will be added.');
		}
	} else if (player1TotalDamage && !player2TotalDamage) {
		console.log('Player 2 has no cards, player 1 wins by default.');
		await addPointsToWinner(player1);
	} else if (player2TotalDamage && !player1TotalDamage) {
		console.log('Player 1 has no cards, player 2 wins by default.');
		await addPointsToWinner(player2);
	}

	console.log('Updating doc');
	await updateDoc(cardBattleRef, { players: [player1, player2] });

	addToMatchHistory(match.players);
}

async function addPointsToWinner(user: PlayerWithDamage): Promise<void> {
	const userRef = doc(db, 'users', user.auth_data.uid);
	const userDoc = await getDoc(userRef);
	const userData = userDoc.data() as UserData;

	const newScore = userData.score + 10;

	await updateDoc(userRef, { score: newScore });

	console.log('Added +10 points.');
}

async function runCardBattle(cardBattle: CardBattle[], matchSetId: string): Promise<CardBattle[]> {
	for (let idx = 0; idx < cardBattle.length; idx++) {
		await updateCardBattleDocument(cardBattle, matchSetId, idx);

		console.log('Refreshing cardBattle data...');
	}
	const cardBattleCollection = collection(db, `match_sets/${matchSetId}/card_battle`);
	const snapshot = await getDocs(cardBattleCollection);

	if (snapshot.empty) {
		throw new Error('Card battle collection is empty.');
	}
	cardBattle = snapshot.docs.map((doc) => doc.data() as CardBattle);

	return cardBattle;
}
