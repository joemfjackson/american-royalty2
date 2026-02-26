'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { BRAND } from '@/lib/constants'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="card-dark glow-gold p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <CheckCircle className="h-8 w-8 text-gold" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-white">Message Sent!</h3>
        <p className="mt-3 text-white/60">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <p className="mt-2 text-sm text-white/40">
          Need immediate help? Call{' '}
          <a href={`tel:${BRAND.phone}`} className="text-gold hover:underline">
            {BRAND.phone}
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-dark p-8 sm:p-10">
      <h3 className="text-xl font-bold text-white">Send Us a Message</h3>
      <p className="mt-2 text-sm text-white/50">
        Fill out the form below and we&apos;ll get back to you promptly.
      </p>

      {serverError && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{serverError}</p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        <Input
          label="Full Name *"
          placeholder="John Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="(702) 555-1234 (optional)"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Textarea
          label="Message *"
          placeholder="How can we help? Tell us about your event or ask us anything."
          rows={5}
          error={errors.message?.message}
          {...register('message')}
        />
      </div>

      <div className="mt-8">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </div>
    </form>
  )
}

export default ContactForm
