<script lang="ts">
	import type { Rubric } from '$lib/types';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { addSelectedRows } from 'svelte-headless-table/plugins';
	import { readable, type Writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { RubricsTableCheckbox } from '.';

	export let rubrics: Rubric[] = [];
	export let selectedRubrics: Writable<number[]>;

	const table = createTable(readable(rubrics), {
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(RubricsTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(RubricsTableCheckbox, {
					checked: isSelected
				});
			}
		}),
		table.column({
			accessor: 'title',
			header: 'Title'
		}),
		table.column({
			accessor: 'description',
			header: 'Description'
		}),
		table.column({
			accessor: 'max_score',
			header: 'Max Score'
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, rows, pluginStates } =
		table.createViewModel(columns);
	const { selectedDataIds } = pluginStates.select;

	function getSelectedRows(selectedDataIds: Record<string, boolean>): void {
		const indices = Object.keys(selectedDataIds);

		$selectedRubrics = [];

		indices.forEach((idx) => {
			const i = Number(idx);

			selectedRubrics.update(($rubrics) => {
				// if ($rubrics.includes(rubrics[i].id)) {
				// 	return $rubrics;
				// }

				$rubrics.push(rubrics[i].id);

				return $rubrics;
			});
		});
	}

	$: getSelectedRows($selectedDataIds);
</script>

<div class="rounded-md border">
	<Table.Root {...$tableAttrs} class="text-base md:text-lg">
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
								<Table.Head {...attrs}>
									<Render of={cell.render()} />
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							{@const rubric = cell.row.original}

							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									{#if cell.id === 'description' && !rubric.description}
										<div class="text-muted-foreground italic">
											<Render of={cell.render()} />
										</div>
									{:else}
										<Render of={cell.render()} />
									{/if}
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
