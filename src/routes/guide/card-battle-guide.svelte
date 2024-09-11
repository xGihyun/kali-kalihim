<script lang="ts">
	import { cardBattleGuide } from '$lib/assets/images';
</script>

<h2 class="font-jost-semibold text-4xl mb-5">Preview</h2>

<div class="p-5 rounded-md bg-muted mb-10">
	<img src={cardBattleGuide} alt="Card Battle guide" class="w-full object-cover rounded-md" />
</div>

<p class="text-base md:text-lg">
	The Card Battle is a virtual simulation of an Arnis match that makes use of the fundamental
	skills. Players can pick <span class="font-jost-medium text-primary">six (6) cards</span>
	(duplicates allowed) within <span class="font-jost-medium text-primary">six (6) hours</span> after
	the admin has queued a new match. <br /><br />
	Once the cards have been submitted, the admin will run a simulation to see who wins. The winner will
	get additional points on their score. <br /><br />
	The details on what each card does can be found in the
	<a href="/card-battle" class="font-jost-medium text-primary underline">Card Battle</a> page.
</p>
