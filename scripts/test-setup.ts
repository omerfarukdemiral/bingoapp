import { createTestUsers, joinTestUsersToEvent, simulateQuestionCompletions } from '../src/utils/test-utils'

const main = async () => {
  try {
    // Test kullanıcıları oluştur
    console.log('🚀 Test kullanıcıları oluşturuluyor...')
    const users = await createTestUsers(25)
    console.log(`✅ ${users.length} test kullanıcısı oluşturuldu`)

    // Kullanıcıları etkinliğe katılımını sağla
    const eventId = process.argv[2] // Script çalıştırılırken event ID'si parametre olarak verilecek
    if (!eventId) {
      throw new Error('Lütfen bir etkinlik ID\'si belirtin')
    }

    console.log('🚀 Kullanıcılar etkinliğe katılıyor...')
    await joinTestUsersToEvent(eventId, users)
    console.log('✅ Kullanıcılar etkinliğe katıldı')

    // Rastgele soru tamamlamaları simüle et
    console.log('🚀 Soru tamamlamaları simüle ediliyor...')
    await simulateQuestionCompletions(eventId, users, 0.6) // %60 tamamlanma oranı
    console.log('✅ Simülasyon tamamlandı')

  } catch (error) {
    console.error('❌ Test senaryosu hatası:', error)
    process.exit(1)
  }
}

main() 