/**
 * Teste para verificar se a edição de turnos está funcionando corretamente
 */

const BASE_URL = 'http://localhost:3001'

async function testTurnEditing() {
    console.log('🧪 Testando edição de turnos...\n')

    // Teste 1: Verificar se a API retorna dados com IDs
    console.log('📊 Teste 1: Verificar dados do dashboard com IDs')
    try {
        const response = await fetch(`${BASE_URL}/api/admin/dashboard`)
        const data = await response.json()
        
        if (data.length > 0) {
            const product = data[0]
            console.log('✅ Produto encontrado:', product.name)
            console.log('📈 Total de datas:', product.dates.length)
            
            // Verificar se as datas têm IDs
            const datesWithIds = product.dates.filter(d => d.id)
            console.log('📋 Datas com ID:', datesWithIds.length)
            
            if (datesWithIds.length > 0) {
                const sampleDate = datesWithIds[0]
                console.log('🔍 Exemplo de data com ID:', {
                    id: sampleDate.id,
                    date: sampleDate.date,
                    turn: sampleDate.turn,
                    status: sampleDate.status
                })
            }
        }
    } catch (error) {
        console.log('❌ Erro:', error.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Teste 2: Simular edição de turno específico
    console.log('📊 Teste 2: Simular edição de turno específico')
    try {
        // Primeiro, buscar dados do dashboard
        const dashboardResponse = await fetch(`${BASE_URL}/api/admin/dashboard`)
        const dashboardData = await dashboardResponse.json()
        
        if (dashboardData.length > 0) {
            const product = dashboardData[0]
            const dateWithId = product.dates.find(d => d.id)
            
            if (dateWithId) {
                console.log('🎯 Editando turno específico:', {
                    id: dateWithId.id,
                    date: dateWithId.date,
                    turn: dateWithId.turn,
                    statusAtual: dateWithId.status
                })
                
                // Simular edição via PUT (quando existingId está presente)
                const editPayload = {
                    id: dateWithId.id,
                    status: 'completed',
                    description: 'Teste de edição específica',
                    problemCategoryId: null
                }
                
                const editResponse = await fetch(`${BASE_URL}/api/admin/products/activities`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editPayload)
                })
                
                const editResult = await editResponse.json()
                console.log('✅ Resultado da edição:', {
                    success: editResult.success,
                    action: editResult.action || 'updated',
                    status: editResponse.status
                })
            } else {
                console.log('⚠️ Nenhuma data com ID encontrada para teste')
            }
        }
    } catch (error) {
        console.log('❌ Erro:', error.message)
    }

    console.log('\n🎯 Teste concluído!')
}

// Executar teste
testTurnEditing().catch(console.error)
