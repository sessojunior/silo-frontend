// Função para alternar entre tema claro e escuro manualmente
export function toggleTheme() {
	const root = document.documentElement
	const currentTheme = root.classList.contains('dark') ? 'dark' : 'light'

	if (currentTheme === 'dark') {
		root.classList.remove('dark')
		localStorage.setItem('theme', 'light')
	} else {
		root.classList.add('dark')
		localStorage.setItem('theme', 'dark')
	}
}

// Função opcional para aplicar o tema salvo (chamada uma vez no carregamento)
export function applySavedTheme() {
	if (typeof window === 'undefined') return

	const savedTheme = localStorage.getItem('theme')
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

	if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
		document.documentElement.classList.add('dark')
	} else {
		document.documentElement.classList.remove('dark')
	}
}
