import { useState } from 'react'

export default function Input({ ref, id, name, value, setValue, placeholder, autocomplete, autofocus = false, minlength = 2, maxlength = 255, className = null, required, isInvalid, invalidMessage }: { ref?: React.RefObject<HTMLInputElement | null>; id?: string; name?: string; value: string; setValue: (value: string) => void; placeholder?: string; autocomplete?: string; autofocus?: boolean; minlength?: number; maxlength?: number; className?: string | null; required?: boolean; isInvalid?: boolean; invalidMessage?: string }) {
	const [showPassword, setShowPassword] = useState(false)

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev)
	}

	return (
		<>
			{/* Campo de senha com toggle */}
			<div className='relative'>
				<input
					ref={ref}
					id={id}
					name={name}
					type={showPassword ? 'text' : 'password'}
					placeholder={placeholder}
					autoComplete={autocomplete}
					minLength={minlength}
					maxLength={maxlength}
					required={required}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					autoFocus={autofocus}
					className={`block rounded-lg py-3 ps-4 pe-10 disabled:pointer-events-none disabled:opacity-50 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:ring-zinc-600
            ${isInvalid ? 'border-red-400 focus:border-red-400 focus:ring-red-600 dark:border-red-800 dark:focus:border-red-800 dark:focus:ring-red-800' : 'focus:border-blue-500 focus:ring-blue-500'} 
            ${className ?? 'w-full'}
          `}
				/>

				{/* Botão de toggle de senha */}
				<button
					type='button'
					onClick={togglePasswordVisibility}
					className={`absolute inset-y-0 end-0 z-20 flex cursor-pointer items-center rounded-e-md pe-4 text-zinc-400 focus:outline-none dark:text-zinc-400 
            ${isInvalid ? 'focus:text-red-400 dark:focus:text-red-600' : 'focus:text-blue-400 dark:focus:text-blue-600'}`}
					aria-label='Exibir ou ocultar senha'
				>
					{showPassword ? <span className='icon-[lucide--eye-off] size-5' /> : <span className='icon-[lucide--eye] size-5' />}
				</button>
			</div>

			{/* Mensagem de erro */}
			{isInvalid && <Message>{invalidMessage}</Message>}
		</>
	)
}

function Message({ children }: { children: React.ReactNode }) {
	return <p className='dark:text-red-600 mt-2 text-xs text-red-500'>{children}</p>
}
