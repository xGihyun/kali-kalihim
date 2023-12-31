import { powerCardsMap } from '$lib/data';
import { db } from '$lib/firebase/firebase';
import type { MatchSet, Match, UserData, UserPowerCard } from '$lib/types';
import { getRandomArnisSkill } from '$lib/utils/functions';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	updateDoc,
	where,
	writeBatch
} from 'firebase/firestore';

export async function warlordsDomain(userUID: string, skill: string) {
	const batch = writeBatch(db);
	const userRef = doc(db, 'users', userUID);
	const userDoc = await getDoc(userRef);
	const user = userDoc.data() as UserData;
	const userPowerCards = user.power_cards;
	const userPowerCardIndex = user.power_cards.findIndex((card) => card.key === "warlord's-domain");

	userPowerCards[userPowerCardIndex].activated = true;

	batch.update(userRef, { power_cards: userPowerCards });

	// Will be updated if the list of pending matches is no longer needed
	const userPendingMatchesCollection = collection(db, `users/${userUID}/pending_matches`);
	const userPendingMatchesQuery = query(userPendingMatchesCollection, orderBy('timestamp', 'desc'));
	const getUserPendingMatchesDocs = await getDocs(userPendingMatchesQuery);
	const latestUserPendingMatchDoc = getUserPendingMatchesDocs.docs[0];

	if (!latestUserPendingMatchDoc) {
		console.error('No pending match!');
		return;
	}

	const latestUserPendingMatchData = latestUserPendingMatchDoc.data() as Match;
	const pendingMatchRef = doc(
		db,
		`users/${userUID}/pending_matches/${latestUserPendingMatchDoc.id}`
	);

	batch.update(pendingMatchRef, { skill });

	const latestMatchPlayers = latestUserPendingMatchData.players;
	const latestMatchSet = await getLatestMatchSet(user.personal_data.section);

	if (!latestMatchSet) {
		console.error('No latest match set');
		return;
	}

	const matchesCollection = collection(db, `match_sets/${latestMatchSet?.id}/matches`);
	const matchQuery = query(
		matchesCollection,
		where('uids', 'array-contains', user.auth_data.uid),
		where('status', '==', 'pending')
	);
	const getMatchDocs = await getDocs(matchQuery);
	const matchDoc = getMatchDocs.docs[0];
	const matchRef = doc(db, `match_sets/${latestMatchSet.id}/matches/${matchDoc?.id}`);

	const findOpponent = latestMatchPlayers.find((opponent) => opponent.auth_data.uid !== userUID);

	if (!findOpponent) return;

	const opponentRef = doc(db, 'users', findOpponent.auth_data.uid);
	const getOpponentDoc = await getDoc(opponentRef);
	const opponentData = getOpponentDoc.data() as UserData;

	const isCancelled = opponentData.power_cards.find(
		(card) => card.key === "warlord's-domain" && card.activated
	);

	const originalSkill = latestUserPendingMatchData.skill;

	if (isCancelled) {
		batch.update(matchRef, { skill: originalSkill });
		await batch.commit();
		return;
	}

	batch.update(matchRef, { skill });

	await batch.commit();
}

export async function doubleEdgedSword(userUID: string) {
	const userRef = doc(db, 'users', userUID);
	const userDoc = await getDoc(userRef);
	const userData = userDoc.data() as UserData;
	const userPowerCards = userData.power_cards;
	const userPowerCardIndex = userData.power_cards.findIndex(
		(card) => card.key === 'double-edged-sword'
	);

	userPowerCards[userPowerCardIndex].activated = true;

	await updateDoc(userRef, { power_cards: userPowerCards });
}

export async function extraWind(userUID: string, card: string) {
	const userRef = doc(db, 'users', userUID);
	const userDoc = await getDoc(userRef);
	const userData = userDoc.data() as UserData;
	const userPowerCards = userData.power_cards;
	const userPowerCardIndex = userData.power_cards.findIndex((card) => card.key === 'extra-wind');

	userPowerCards[userPowerCardIndex].activated = true;

	const newCard: UserPowerCard = {
		activated: false,
		key: card,
		name: powerCardsMap.get(card)?.name as string,
		used: false
	};

	userPowerCards.push(newCard);

	await updateDoc(userRef, { power_cards: userPowerCards });
}

export async function ancientsProtection(userUID: string) {
	const userRef = doc(db, 'users', userUID);
	const userDoc = await getDoc(userRef);
	const userData = userDoc.data() as UserData;
	const userPowerCards = userData.power_cards;
	const userPowerCardIndex = userData.power_cards.findIndex(
		(card) => card.key === "ancient's-protection"
	);

	userPowerCards[userPowerCardIndex].activated = true;

	await updateDoc(userRef, { power_cards: userPowerCards });
}

export async function viralxRival(userUID: string, opponentUID: string) {
	const userRef = doc(db, 'users', userUID);
	const userDoc = await getDoc(userRef);
	const userData = userDoc.data() as UserData;
	const userPowerCards = userData.power_cards;
	const userPowerCardIndex = userData.power_cards.findIndex((card) => card.key === 'viral-x-rival');

	userPowerCards[userPowerCardIndex].activated = true;

	const opponentRef = doc(db, 'users', opponentUID);
	const opponentDoc = await getDoc(opponentRef);
	const opponentData = opponentDoc.data() as UserData;
	const isCancelled = opponentData.power_cards.find(
		(card) => card.key === 'twist-of-fate' && card.activated && !card.used
	);

	if (isCancelled) {
		// Restore the default match state
		const latestMatchSet = await getLatestMatchSet(userData.personal_data.section);

		if (!latestMatchSet) return;

		const latestMatchCollection = collection(db, `match_sets/${latestMatchSet.id}/matches`);
		const defaultMatchCollection = collection(
			db,
			`match_sets/${latestMatchSet.id}/default_matches`
		);

		const getDefaultMatchDocs = await getDocs(defaultMatchCollection);

		getDefaultMatchDocs.forEach(async (match) => {
			const latestMatchRef = doc(latestMatchCollection, match.id);
			const defaultMatchData = match.data() as Match;

			await updateDoc(latestMatchRef, { ...defaultMatchData });
		});

		// console.log('opponent has used twist of fate');
	}

	await updateDoc(userRef, { power_cards: userPowerCards });
}

export async function twistOfFate(
	user: UserData,
	currentOpponent: UserData,
	newOpponent: UserData
) {
	const batch = writeBatch(db);
	const userRef = doc(db, 'users', user.auth_data.uid);
	const userDoc = await getDoc(userRef);
	const userData = userDoc.data() as UserData;
	const userPowerCards = userData.power_cards;
	const userPowerCardIndex = userData.power_cards.findIndex((card) => card.key === 'twist-of-fate');

	userPowerCards[userPowerCardIndex].activated = true;

	const opponentRef = doc(db, 'users', currentOpponent.auth_data.uid);
	const opponentDoc = await getDoc(opponentRef);
	const opponentData = opponentDoc.data() as UserData;
	const isCancelled = opponentData.power_cards.find(
		(card) => card.key === 'viral-x-rival' && card.activated && !card.used
	);

	if (isCancelled) {
		await updateDoc(userRef, { power_cards: userPowerCards });
		// console.log('opponent has used viral rival');
		return;
	}

	// MATCH SETS
	const latestMatchSet = await getLatestMatchSet(user.personal_data.section);

	if (!latestMatchSet) {
		console.error('No latest match');
		return;
	}

	const latestMatchCollection = collection(db, `match_sets/${latestMatchSet.id}/matches`);

	const currentOpponentMatchQuery = query(
		latestMatchCollection,
		where('uids', 'array-contains', currentOpponent.auth_data.uid),
		where('status', '==', 'pending')
	);
	const getCurrentOpponentMatch = await getDocs(currentOpponentMatchQuery);
	const currentOpponentMatchDoc = getCurrentOpponentMatch.docs[0];
	const currentOpponentMatchData = currentOpponentMatchDoc?.data() as Match;
	const currentOpponentMatchRef = doc(
		db,
		`match_sets/${latestMatchSet.id}/matches/${currentOpponentMatchDoc.id}`
	);
	const currentOpponentMatchPlayers = currentOpponentMatchData.players;
	const currentOpponentMatchOriginalOpponentIndex = currentOpponentMatchPlayers.findIndex(
		(player) => player.auth_data.uid !== currentOpponent.auth_data.uid
	);

	const newOpponentMatchQuery = query(
		latestMatchCollection,
		where('uids', 'array-contains', newOpponent.auth_data.uid),
		where('status', '==', 'pending')
	);
	const getNewOpponentMatchSetMatch = await getDocs(newOpponentMatchQuery);
	const newOpponentMatchDoc = getNewOpponentMatchSetMatch.docs[0];
	const newOpponentMatchData = newOpponentMatchDoc?.data() as Match;
	const newOpponentMatchRef = doc(
		db,
		`match_sets/${latestMatchSet.id}/matches/${newOpponentMatchDoc.id}`
	);
	const newOpponentMatchPlayers = newOpponentMatchData.players;
	const newOpponentMatchOriginalOpponentIndex = newOpponentMatchPlayers.findIndex(
		(player) => player.auth_data.uid !== newOpponent.auth_data.uid
	);

	// console.log('before:');
	// console.log(currentOpponentMatchPlayers);
	// console.log(newOpponentMatchPlayers);

	const updatedCurrentOpponentMatchPlayers = [...currentOpponentMatchPlayers];
	const updatedNewOpponentMatchPlayers = [...newOpponentMatchPlayers];

	updatedCurrentOpponentMatchPlayers[currentOpponentMatchOriginalOpponentIndex] =
		newOpponentMatchPlayers[newOpponentMatchOriginalOpponentIndex];

	updatedNewOpponentMatchPlayers[newOpponentMatchOriginalOpponentIndex] =
		currentOpponentMatchPlayers[currentOpponentMatchOriginalOpponentIndex];

	// console.log('after:');
	// console.log(updatedCurrentOpponentMatchPlayers);
	// console.log(updatedNewOpponentMatchPlayers);

	const updatedCurrentOpponentMatchPlayerUIDs = updatedCurrentOpponentMatchPlayers.map(
		(player) => player.auth_data.uid
	);
	const updatedNewOpponentMatchPlayerUIDs = updatedNewOpponentMatchPlayers.map(
		(player) => player.auth_data.uid
	);

	batch.update(currentOpponentMatchRef, {
		players: updatedCurrentOpponentMatchPlayers,
		skill: getRandomArnisSkill().skill,
		footwork: getRandomArnisSkill().footwork,
		uids: updatedCurrentOpponentMatchPlayerUIDs
	});

	batch.update(newOpponentMatchRef, {
		players: updatedNewOpponentMatchPlayers,
		skill: getRandomArnisSkill().skill,
		footwork: getRandomArnisSkill().footwork,
		uids: updatedNewOpponentMatchPlayerUIDs
	});

	batch.update(userRef, { power_cards: userPowerCards });

	await batch.commit();
}

async function getLatestMatchSet(section: string) {
	const matchSetsCollection = collection(db, 'match_sets');
	const matchSetsQuery = query(matchSetsCollection, where('section', '==', section));
	const matchSetsDocs = await getDocs(matchSetsQuery);
	const latestMatchSet = matchSetsDocs.docs
		.map((matchSet) => {
			const matchSetId = matchSet.id;
			const matchSetData = matchSet.data() as MatchSet;

			return {
				id: matchSetId,
				data: matchSetData
			};
		})
		.sort((a, b) => b.data.set - a.data.set)
		.shift();

	return latestMatchSet;
}
