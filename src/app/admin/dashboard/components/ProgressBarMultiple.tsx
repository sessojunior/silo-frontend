export default function ProgressBarMultiple({ items, total }: { items: { progress: number; color: string; colorDark: string }[]; total: number }) {
	return (
		<div className='flex h-2 w-full gap-1 overflow-hidden rounded bg-zinc-200 text-xs dark:bg-zinc-700'>
			{items.map(({ progress, color, colorDark }, index) => (
				<div
					key={index}
					className={`flex flex-col justify-center overflow-hidden rounded-full ${color} dark:${colorDark} text-center text-xs whitespace-nowrap text-white`}
					style={{
						width: `${(progress / total) * 100}%`,
					}}
					role='progressbar'
					aria-valuenow={(progress / total) * 100}
					aria-valuemin={0}
					aria-valuemax={100}
				/>
			))}
		</div>
	)
}
