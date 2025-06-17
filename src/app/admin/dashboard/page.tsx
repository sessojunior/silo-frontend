'use client'

import Product from '@/components/admin/dashboard/Product'
import ChartColumn from '@/components/admin/dashboard/ChartColumn'
import ChartLine from '@/components/admin/dashboard/ChartLine'
import ChartDonut from '@/components/admin/dashboard/ChartDonut'

import CircleProgress from '@/components/admin/dashboard/CircleProgress'
import Stats from '@/components/admin/dashboard/Stats'
import Radial from '@/components/admin/dashboard/Radial'
import Project from '@/components/admin/dashboard/Project'

export default function DashboardPage() {
	return (
		<div className='flex w-full bg-white dark:bg-zinc-900'>
			{/* Lado esquerdo */}
			<div className='flex flex-grow flex-col'>
				<div className='size-full h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
					{/* Estatísticas */}
					<div className='flex flex-col border-b border-b-zinc-200 p-8 pb-10 dark:border-b-zinc-700'>
						<Stats
							items={[
								{
									name: 'Em execução',
									incidents: 0,
									progress: 18,
									color: 'bg-blue-400',
									colorDark: 'bg-blue-700',
								},
								{
									name: 'Precisam de atenção',
									incidents: 13,
									progress: 13,
									color: 'bg-orange-400',
									colorDark: 'bg-orange-700',
								},
								{
									name: 'Com problemas',
									incidents: 6,
									progress: 6,
									color: 'bg-red-400',
									colorDark: 'bg-red-700',
								},
								{
									name: 'Falta rodar',
									incidents: 0,
									progress: 9,
									color: 'bg-zinc-200',
									colorDark: 'bg-zinc-700',
								},
							]}
						/>
					</div>

					{/* Colunas */}
					<div className='flex flex-col divide-zinc-200 border-zinc-200 md:grid md:grid-cols-2 md:divide-x dark:divide-zinc-700 dark:border-zinc-700 dark:border-b-zinc-700'>
						{/* Coluna esquerda */}
						<div className='flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700'>
							{/* Produtos & tasks */}
							{/* Item 1 */}
							<div className='p-8'>
								<h3 className='pb-4 text-xl font-medium text-zinc-500 dark:text-zinc-400'>Produtos não iniciados</h3>
								<div className='flex flex-col gap-3'>
									{/* Itens */}
									<Product id='bam' name='BAM' progress={84} priority='low' date='21 mar. 16:35' />
									<Product id='smec' name='SMEC' progress={91} priority='normal' date='21 mar. 09:41' />
								</div>
							</div>
							{/* Item 2 */}
							<div className='p-8'>
								<h3 className='pb-4 text-xl font-medium text-orange-500'>Produtos rodando</h3>
								<div className='flex flex-col'>
									{/* Itens */}
									<Product id='brams_15km' name='BRAMS 15 km' progress={78} priority='urgent' date='21 mar. 11:17' />
								</div>
							</div>
							{/* Item 3 */}
							<div className='p-8'>
								<h3 className='pb-4 text-xl font-medium text-green-500'>Produtos finalizados</h3>
								<div className='flex flex-col'></div>
							</div>
						</div>
						{/* Coluna direita */}
						<div className='flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700'>
							{/* Gráficos */}
							{/* Item 1 */}
							<div className='flex flex-col p-8'>
								<h3 className='pb-2 text-xl font-medium'>Incidentes por data</h3>
								<div className='mx-auto -mb-4 w-full'>
									<ChartColumn />
								</div>
							</div>
							{/* Item 2 */}
							<div className='flex flex-col p-8'>
								<h3 className='pb-2 text-xl font-medium'>Causas de problemas</h3>
								<div className='flex'>
									<div className='mx-auto w-full'>
										<ChartDonut />
									</div>
								</div>
							</div>
							{/* Item 3 */}
							<div className='flex flex-col p-8'>
								<h3 className='pb-2 text-xl font-medium'>Problemas & soluções</h3>
								<div className='flex'>
									<div className='mx-auto w-full'>
										<ChartLine />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lado direito */}
			<div className='hidden w-[400px] flex-shrink-0 flex-col border-l border-l-zinc-200 2xl:flex dark:border-l-zinc-700'>
				<div className='size-full h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-zinc-50 dark:[&::-webkit-scrollbar-track]:bg-zinc-700'>
					<div className='p-8'>
						{/* Resumo */}
						<div className='flex flex-col border-b border-b-zinc-200 pb-6 dark:border-b-zinc-700'>
							<h3 className='pb-4 text-2xl font-medium'>Resumo do dia</h3>
							<p className='text-base'>
								Hoje você tem
								<strong>20%</strong>
								mais problemas que o normal, você resolveu
								<strong>3 problemas</strong> em dois projetos, mas o foco está
								<strong>12%</strong>
								menor.
							</p>
						</div>

						{/* Resumo da produtividade */}
						<div className='grid grid-cols-2 border-b border-b-zinc-200 py-6 dark:border-b-zinc-700'>
							<div>
								<h4 className='pb-2 text-base font-medium'>Tempo parado</h4>
								<div>
									<span className='text-xl font-medium'>6h 18min</span>
								</div>
							</div>
							<div>
								<h4 className='pb-2 text-base font-medium'>Produtos finalizados</h4>
								<div>
									<span className='flex items-center'>
										<CircleProgress percent={79} strokeWidth={4} showText={false} size='size-6' fontSize='text-sm' fontColor='text-zinc-600' fontColorDark='text-zinc-200' colorFilled='text-zinc-200' colorDarkFilled='text-zinc-600' colorUnfilled='text-blue-500' colorDarkUnfilled='text-blue-600' />
										<span className='px-2 text-xl font-medium'> 79% </span>
										<span className='pt-0.5 text-sm text-zinc-400'>17 de 23</span>
									</span>
								</div>
							</div>
						</div>

						{/* Progresso radial */}
						<div className='grid w-full grid-cols-3 divide-x divide-zinc-200 border-b border-b-zinc-200 dark:divide-zinc-700 dark:border-b-zinc-700'>
							<Radial name='Produtos' progress={36} color='text-purple-500' colorDark='text-purple-600' />
							<Radial name='Processos' progress={77} color='text-teal-500' colorDark='text-teal-600' />
							<Radial name='Projetos' progress={63} color='text-rose-400' colorDark='text-rose-500' />
						</div>

						{/* Projetos em andamento */}
						<div className='flex flex-col py-6'>
							<h3 className='pb-4 text-xl font-medium text-zinc-800 dark:text-zinc-100'>Projetos em andamento</h3>
							<div className='flex flex-col gap-3'>
								<Project name='Nome do projeto 1' progress={56} time='14 dias' />
								<Project name='Nome do projeto 2' progress={78} time='69 dias' />
								<Project name='Nome do projeto 3' progress={19} time='9 dias' />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
