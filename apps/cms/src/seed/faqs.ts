// Loads the suggested parent questions into maarifcms as DRAFTS with no answers. Staff write
// the answers and a reviewer publishes each one; nothing appears on the site before that.
//   pnpm --filter @maarif/cms seed:faqs
// Runs once: a question already present (same English text) is skipped.
import { getPayload } from 'payload'
import config from '@payload-config'

type Q = { order: number; en: string; fr: string; ar: string; tr: string }

const questions: Q[] = [
  { order: 10, en: 'At what age can my child start?', fr: 'À quel âge mon enfant peut-il commencer ?', ar: 'في أي سن يمكن لطفلي أن يبدأ؟', tr: 'Çocuğum kaç yaşında başlayabilir?' },
  { order: 20, en: 'Which campus will my child attend?', fr: 'Quel campus mon enfant fréquentera-t-il ?', ar: 'في أي فرع سيدرس طفلي؟', tr: 'Çocuğum hangi kampüse gidecek?' },
  { order: 30, en: 'Which languages are taught, and how?', fr: 'Quelles langues sont enseignées, et comment ?', ar: 'ما اللغات التي تُدرَّس، وكيف؟', tr: 'Hangi diller, nasıl öğretiliyor?' },
  { order: 40, en: 'How do I register my child?', fr: 'Comment inscrire mon enfant ?', ar: 'كيف أسجّل طفلي؟', tr: 'Çocuğumu nasıl kaydettirebilirim?' },
  { order: 50, en: 'Can we visit the school before enrolling?', fr: 'Pouvons-nous visiter l’école avant l’inscription ?', ar: 'هل يمكننا زيارة المدرسة قبل التسجيل؟', tr: 'Kayıttan önce okulu ziyaret edebilir miyiz?' },
  { order: 60, en: 'Is there school transport?', fr: 'Y a-t-il un transport scolaire ?', ar: 'هل يوجد نقل مدرسي؟', tr: 'Okul servisi var mı?' },
  { order: 70, en: 'Is there a canteen, and where can I see the menu?', fr: 'Y a-t-il une cantine, et où voir le menu ?', ar: 'هل يوجد مطعم، وأين أرى قائمة الطعام؟', tr: 'Yemekhane var mı, menüyü nerede görebilirim?' },
  { order: 80, en: 'What are the school hours?', fr: 'Quels sont les horaires de l’école ?', ar: 'ما هي أوقات الدراسة؟', tr: 'Okul saatleri nedir?' },
]

const payload = await getPayload({ config })
for (const q of questions) {
  const existing = await payload.find({ collection: 'faqs', where: { question: { equals: q.en } }, locale: 'en', draft: true, limit: 1 })
  if (existing.docs.length) {
    payload.logger.info(`skip: ${q.en}`)
    continue
  }
  const doc = await payload.create({ collection: 'faqs', locale: 'en', draft: true, data: { question: q.en, order: q.order, _status: 'draft' } })
  for (const locale of ['fr', 'ar', 'tr'] as const) {
    await payload.update({ collection: 'faqs', id: doc.id, locale, draft: true, data: { question: q[locale] } })
  }
  payload.logger.info(`draft: ${q.en}`)
}
process.exit(0)
