export default function Input({ ref, type, mask = null, id, name, value, setValue, placeholder, autocomplete, autofocus = false, minlength = 2, maxlength = 255, className = null, required, isInvalid, invalidMessage }: { ref?: React.RefObject<HTMLInputElement | null>; type: 'text' | 'email'; mask?: 'phone' | null; id?: string; name?: string; value: string; setValue: (value: string) => void; placeholder?: string; autocomplete?: string; autofocus?: boolean; minlength?: number; maxlength?: number; className?: string | null; required?: boolean; isInvalid?: boolean; invalidMessage?: string }) {
	// Se o tipo do campo for 'email', converte para minúsculo o que for digitado
	// mas se tiver mask 'phone', aplica a máscara de telefone
	function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
		const input = event.target as HTMLInputElement

		// Se o tipo do campo for 'phone', aplica a máscara de telefone
		if (mask === 'phone') {
			const cursor = input.selectionStart ?? 0
			const originalLength = input.value.length

			const masked = phoneMask(input.value)
			setValue(masked)

			const diff = masked.length - originalLength
			const newCursor = Math.max(0, cursor + diff)
			requestAnimationFrame(() => {
				input.setSelectionRange(newCursor, newCursor)
			})
		} else {
			// Se o tipo do campo for 'email', converte para minúsculo o que for digitado
			setValue(type === 'email' ? input.value.toLowerCase() : input.value)
		}
	}

	// Deixa o telefone no formato (00) 00000-0000 ou (00) 0000-0000
	function phoneMask(value: string) {
		value = value.replace(/\D/g, '')

		if (value.length > 10) {
			return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
		} else if (value.length > 6) {
			return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
		} else if (value.length > 2) {
			return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
		} else {
			return value.replace(/^(\d*)/, '($1')
		}
	}

	return (
		<>
			<div className='relative'>
				<input
					ref={ref}
					id={id}
					name={name}
					type={type}
					placeholder={placeholder}
					autoComplete={autocomplete}
					minLength={minlength}
					maxLength={maxlength}
					required={required}
					value={value}
					autoFocus={autofocus}
					onChange={handleInput}
					className={`block rounded-lg py-3 ps-4 pe-10 disabled:pointer-events-none disabled:opacity-50 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600
                ${isInvalid ? 'border-red-400 focus:border-red-400 focus:ring-red-600 dark:border-red-800 dark:focus:border-red-800 dark:focus:ring-red-800' : 'focus:border-blue-500 focus:ring-blue-500'} 
                ${className ?? 'w-full'}
              `}
				/>
				{isInvalid && (
					<Message>
						<div className='pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4'>
							<span className='icon-[lucide--triangle-alert] size-5 text-red-400 dark:text-red-900'></span>
						</div>
					</Message>
				)}
			</div>
			{isInvalid && <Message>{invalidMessage}</Message>}
		</>
	)
}

function Message({ children }: { children: React.ReactNode }) {
	return <p className='dark:text-red-600 mt-2 text-xs text-red-500'>{children}</p>
}
