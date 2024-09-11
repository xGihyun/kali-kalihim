import {
	ArrowClockwise,
	Guide,
	HandsHoldingCircle,
	History,
	Home,
	PeopleGroup,
	Sword,
	Trophy
} from './assets/icons';
import type {
	Badge,
	BadgeIcon,
	BadgeInfo,
	BlockData,
	Matchmake,
	Navigation,
	StrikeData,
	Video
} from './types';
import {
	ancients_protection,
	double_edged_sword,
	extra_wind,
	twist_of_fate,
	viral_x_rival,
	warlords_domain
} from './assets/images/cards';
import {
	ArrowBigRightDash,
	BlocksIcon,
	Crown,
	Diamond,
	Forward,
	ShieldPlus,
	Swords,
	UsersRound
} from 'lucide-svelte';
import { CardStack } from 'radix-icons-svelte';
import {
	Blocks,
	Footwork,
	ForwardSinawali,
	SidewardSinawali,
	Strikes
} from './assets/images/thumbnails';

export const BADGES: BadgeIcon[] = [
	{
		name: 'Invincible Under the Sun',
		description: 'Top 1 Player',
		icon: Crown
	},
	{
		name: 'Uncrowned Kings/Queens',
		description: 'Top 2-10 Players',
		icon: PeopleGroup
	},
	{
		name: 'Defense Juggernaut',
		description: 'Best in Blocks',
		icon: ShieldPlus
	},
	{
		name: 'Offensive Prodigy',
		description: 'Best in Strikes',
		icon: Swords
	},
	{
		name: 'Weaving Master',
		description: 'Best in Sinawali',
		icon: ArrowBigRightDash
	}
];

export const ARNIS_STRIKES_VIDEOS: Video[] = [
	{
		title: 'Strikes',
		url: 'https://youtu.be/9ImJFGii6lg',
		image: Strikes
	},
	{
		title: 'Blocks',
		url: 'https://youtu.be/vsTbagtEiyA',
		image: Blocks
	},
	{
		title: 'Forward Sinawali',
		url: 'https://youtu.be/0VTyA7fAoNg',
		image: ForwardSinawali
	},
	{
		title: 'Sideward Sinawali',
		url: 'https://youtu.be/GbHiKTmVgJw?t=85',
		image: SidewardSinawali
	},
	{
		title: 'Reverse Sinawali',
		url: 'https://youtu.be/GbHiKTmVgJw?t=343',
		image: SidewardSinawali
	}
];

export const ARNIS_FOOTWORKS_VIDEOS: Video[] = [
	{
		title: 'Caballero',
		url: 'https://youtu.be/jrXYbouUFR8?t=312',
		image: Footwork
	},
	{
		title: 'Triangle',
		url: 'https://youtu.be/jrXYbouUFR8?t=457',
		image: Footwork
	},
	{
		title: 'Reversed Triangle',
		url: 'https://youtu.be/jrXYbouUFR8?t=591',
		image: Footwork
	},
	{
		title: 'Star Reach',
		url: 'https://youtu.be/jrXYbouUFR8?t=694',
		image: Footwork
	}
];

export const RANK_LOGO_COLORS: Map<string, string> = new Map([
	['likas', 'border-yellow-700 bg-gradient-to-l from-yellow-900 to-yellow-600'],
	['likha', 'border-blue-500 bg-gradient-to-l from-blue-900 to-blue-500'],
	['lakan', 'border-amber-500 bg-gradient-to-l from-amber-900 to-amber-500'],
	['grandmaster', 'border-black bg-gradient-to-l from-red-900 to-red-600'],
	['unranked', 'border-white bg-gradient-to-l from-neutral-500 to-neutral-50']
]);

export const CACHE_DURATION = 60 * 10;

export const ADMIN_ROUTES: Navigation = [
	{
		name: 'Matchmake',
		path: '/matchmake',
		icon: Swords
	},
	{
		name: 'Match History',
		path: '/match-history',
		icon: History
	},
	{
		name: 'Sections',
		path: '/sections',
		icon: UsersRound
	},
	{
		name: 'Rubrics',
		path: '/rubrics',
		icon: BlocksIcon
	}
	// {
	// 	name: 'Users',
	// 	path: '/manage-users',
	// 	icon: People
	// }
];

export const USER_ROUTES: Navigation = [
	{
		name: 'Home',
		path: '/',
		icon: Home
	},
	{
		name: 'Rankings',
		path: '/leaderboards',
		icon: Trophy
	},
	{
		name: 'Guide',
		path: '/guide',
		icon: Guide
	},
	{
		name: 'Card Battle',
		path: '/card-battle',
		icon: Diamond
	}
];

export const POWER_CARDS = new Map([
	[
		"Ancient's Protection",
		{
			image_url: ancients_protection,
			description: 'Immunity to deduction upon losing the Arnis match.'
		}
	],
	[
		'Double-edged Sword',
		{
			image_url: double_edged_sword,
			description:
				'Receive double the points after winning the Arnis match. Deduct double the points otherwise.'
		}
	],
	[
		'Extra Wind',
		{
			image_url: extra_wind,
			description: 'Select a new power card (excluding Extra Wind).'
		}
	],
	[
		'Twist of Fate',
		{
			image_url: twist_of_fate,
			description: 'Switch opponents for the upcoming Arnis match.'
		}
	],
	[
		'Viral x Rival',
		{
			image_url: viral_x_rival,
			description: 'Current opponent will also be their opponent for the next Arnis match.'
		}
	]
	// [
	// 	"Warlord's Domain",
	// 	{
	// 		image_url: warlords_domain,
	// 		description: 'Change the skill to perform for the upcoming Arnis match.'
	// 	}
	// ]
]);

export const SKILLS = new Map([
	['strikes', 'Strikes'],
	['blocks', 'Blocks'],
	['sinawali', 'Sinawali'],
	['footwork', 'Footwork']
]);

export const FOOTWORKS = new Map([
	['guerrero', 'Guerrero'],
	['cabellero', 'Cabellero'],
	['triangle', 'Triangle'],
	['reversed_triangle', 'Reversed Triangle']
]);

export const MATCH_TYPES = new Map([
	['arnis', 'Arnis'],
	['card_battle', 'Card Battle']
]);

export const STRIKE_CARDS: StrikeData[] = [
	{
		data: {
			id: 'leg_strike',
			name: 'Leg Strike',
			skill: 'strike'
		},
		type: {
			damage: 5.0,
			accuracy: 0.9,
			effect: "Increase user's accuracy by 50%"
		}
	},
	{
		data: {
			id: 'temple_strike',
			name: 'Temple Strike',
			skill: 'strike'
		},
		type: {
			damage: 10.0,
			accuracy: 0.75,
			effect: "Decrease opponent's accuracy by 50%"
		}
	},
	{
		data: {
			id: 'shoulder_strike',
			name: 'Shoulder Strike',
			skill: 'strike'
		},
		type: {
			damage: 10.0,
			accuracy: 0.8,
			effect: "Decrease opponent's accuracy by 10%"
		}
	},
	{
		data: {
			id: 'shoulder_thrust',
			name: 'Shoulder Thrust',
			skill: 'strike'
		},
		type: {
			damage: 8.0,
			accuracy: 0.85,
			effect: "Decrease opponent's accuracy by 10%"
		}
	},
	{
		data: {
			id: 'eye_poke',
			name: 'Eye Poke',
			skill: 'strike'
		},
		type: {
			damage: 12.0,
			accuracy: 0.6,
			effect: "Decrease opponent's accuracy by 15%"
		}
	},
	{
		data: {
			id: 'stomach_thrust',
			name: 'Stomach Thrust',
			skill: 'strike'
		},
		type: {
			damage: 10.0,
			accuracy: 0.85,
			effect: "Increase user's damage by 50%"
		}
	},
	{
		data: {
			id: 'head_strike',
			name: 'Head Strike',
			skill: 'strike'
		},
		type: {
			damage: 18.0,
			accuracy: 0.5,
			effect: "Decrease opponent's accuracy by 15%"
		}
	}
];

export const BLOCK_CARDS: BlockData[] = [
	{
		data: {
			id: 'leg_strike',
			name: 'Leg Strike Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.1,
			strike_to_cancel: 'Leg Strike',
			effect: "Increase user's accuracy by 10%"
		}
	},
	{
		data: {
			id: 'temple_strike',
			name: 'Temple Strike Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.15,
			strike_to_cancel: 'Temple Strike',
			effect: "Decrease opponent's accuracy by 10%"
		}
	},
	{
		data: {
			id: 'shoulder_strike',
			name: 'Shoulder Strike Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.15,
			strike_to_cancel: 'Shoulder Strike',
			effect: "Increase user's damage by 50%"
		}
	},
	{
		data: {
			id: 'shoulder_thrust',
			name: 'Shoulder Thrust Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.15,
			strike_to_cancel: 'Shoulder Thrust',
			effect: "Decrease opponent's accuracy by 10%"
		}
	},
	{
		data: {
			id: 'eye_poke',
			name: 'Eye Poke Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.15,
			strike_to_cancel: 'Eye Poke',
			effect: "Decrease opponent's accuracy by 10%"
		}
	},
	{
		data: {
			id: 'stomach_thrust',
			name: 'Stomach Thrust Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.15,
			strike_to_cancel: 'Stomach Thrust',
			effect: "Increase user's damage by 10%"
		}
	},
	{
		data: {
			id: 'head_strike',
			name: 'Head Strike Block',
			skill: 'block'
		},
		type: {
			damage_reduction: 0.15,
			strike_to_cancel: 'Head Strike',
			effect: "Decrease opponent's damage by 20%"
		}
	}
];

export function getRankTitle(score: number): string | null {
	let rankTitle: string | null = null;

	if (score < 100) {
		rankTitle = 'unranked';
	} else if (score >= 100 && score < 200) {
		rankTitle = 'likas';
	} else if (score >= 200 && score < 250) {
		rankTitle = 'likha';
	} else if (score >= 250 && score < 300) {
		rankTitle = 'lakan';
	} else {
		rankTitle = 'grandmaster';
	}

	return rankTitle;
}

export function titleCaseToSnakeCase(input: string | null) {
	if (!input) return;

	// Split the string into words based on spaces and capital letters
	const words = input.split(/(?=[A-Z])|\s+/);

	// Convert each word to lowercase and join them with an underscore
	const snakeCase = words.map((word) => word.toLowerCase()).join('_');

	return snakeCase;
}

export function snakeCaseToTitleCase(input: string | null): string | undefined {
	if (!input) return;

	// Split the input string into words
	const words = input.split('_');

	// Capitalize the first letter of each word and join them with a space
	const titleCase = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

	return titleCase;
}

export function getUserVerdict(
	userId: string,
	match: Matchmake
): 'win' | 'lose' | 'draw' | undefined {
	if (userId === match.user1_id) {
		return match.user1_arnis_verdict;
	}

	if (userId === match.user2_id) {
		return match.user2_arnis_verdict;
	}
}

export function getUserCardBattleVerdict(
	dmg1: number | undefined,
	dmg2: number | undefined,
	latest: boolean
): 'win' | 'lose' | 'draw' | undefined {
	if (latest && (!dmg1 || !dmg2)) {
		return;
	}

	if (dmg1 === dmg2) {
		return 'draw';
	}

	if (dmg1 > dmg2) {
		return 'win';
	}

	return 'lose';
}

export function getOpponent(
	userId: string | undefined,
	match: Matchmake | undefined,
	original?: boolean
): { id: string | undefined; name: string; totalDamage: number | undefined } {
	// if (!match || userId) {
	// 	return {
	// 		id: undefined,
	// 		name: 'Unknown',
	// 		totalDamage: undefined
	// 	};
	// }

	// if (original) {
	// 	if (match?.user1_id === match?.og_user1_id) {
	// 		return {
	// 			id: match?.user1_id,
	// 			name: `${match?.user1_id} ${match?.user1_id}`,
	// 			totalDamage: match?.user1_total_damage
	// 		};
	// 	}
	//
	// 	if (match?.user2_id === match?.og_user1_id) {
	// 		return {
	// 			id: match?.user2_id,
	// 			name: `${match?.user2_id} ${match?.user2_id}`,
	// 			totalDamage: match?.user2_total_damage
	// 		};
	// 	}
	//
	// 	if (match?.user1_id === match?.og_user2_id) {
	// 		return {
	// 			id: match?.user1_id,
	// 			name: `${match?.user1_id} ${match?.user1_id}`,
	// 			totalDamage: match?.user1_total_damage
	// 		};
	// 	}
	//
	// 	if (match?.user2_id === match?.og_user2_id) {
	// 		return {
	// 			id: match?.user2_id,
	// 			name: `${match?.user2_id} ${match?.user2_id}`,
	// 			totalDamage: match?.user2_total_damage
	// 		};
	// 	}
	// }

	if (userId === match?.user1_id) {
		return {
			id: match?.user2_id,
			name: `${match?.user2_first_name} ${match?.user2_last_name}`,
			totalDamage: match?.user1_total_damage
		};
	}

	return {
		id: match?.user1_id,
		name: `${match?.user1_first_name} ${match?.user1_last_name}`,
		totalDamage: match?.user1_total_damage
	};
}
