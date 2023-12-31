import { collection, getDocs } from 'firebase/firestore';
import type { Section } from '$lib/types';
import { db } from '$lib/firebase/firebase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const sectionsCollection = collection(db, 'sections');
	const getSections = await getDocs(sectionsCollection);

	let sections: Section[] = [];

	if (!getSections.empty) {
		sections = getSections.docs.map((section) => section.data() as Section);
	}

	return {
		sections
	};
};
