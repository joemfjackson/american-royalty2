'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SectionTag } from '@/components/ui/SectionTag'
import { GoldLine } from '@/components/ui/GoldLine'
import { FAQ_ITEMS } from '@/lib/constants'

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-dark-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-gold"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold sm:text-lg">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 text-gold"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 leading-relaxed text-white/50">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="section-padding bg-dark/50">
      <div className="container-max">
        <div className="text-center">
          <SectionTag>FAQ</SectionTag>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Frequently Asked{' '}
            <span className="gold-gradient-text">Questions</span>
          </h2>
          <GoldLine className="mx-auto mt-4" width="80px" />
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
