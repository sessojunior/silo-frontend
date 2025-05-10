export default function Label({ children, htmlFor, isInvalid }: { children: React.ReactNode; htmlFor: string; isInvalid?: boolean }) {
	return (
		<label htmlFor={htmlFor} className={`mb-2 block font-semibold ${isInvalid && 'text-red-500'}`}>
			{children}
		</label>
	)
}
