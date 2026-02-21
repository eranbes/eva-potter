'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import MagicalButton from '@/components/ui/MagicalButton';
import LanguageToggle from '@/components/ui/LanguageToggle';
import FloatingElement from '@/components/ui/FloatingElement';
import SparkleEffect from '@/components/ui/SparkleEffect';

type Step = 'name' | 'pin';

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading, setUser } = useUser();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<Step>('name');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/books');
    }
  }, [user, loading, router]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = firstName.trim();
    if (!trimmedName) {
      setError(t('welcome.nameError'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: trimmedName }),
      });

      const data = await response.json();

      if (data.needsPin !== undefined) {
        setIsNewUser(data.isNew);
        setStep('pin');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed');
      }
    } catch {
      setError(t('welcome.submitError'));
      setIsSubmitting(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      setError(t('welcome.pinFormatError'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    setShowSparkles(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('welcome.submitError'));
        setIsSubmitting(false);
        setShowSparkles(false);
        return;
      }

      if (data.user?.id) {
        localStorage.setItem('eva_potter_user_id', data.user.id);
        setUser({
          id: data.user.id,
          firstName: data.user.firstName,
          totalPoints: data.user.totalPoints ?? 0,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/books');
    } catch {
      setError(t('welcome.submitError'));
      setIsSubmitting(false);
      setShowSparkles(false);
    }
  };

  const handleBack = () => {
    setStep('name');
    setPin('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          &#9733;
        </motion.div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingElement delay={0} duration={6} className="absolute top-[10%] left-[15%]">
          <span className="text-yellow-400/30 text-3xl">&#9733;</span>
        </FloatingElement>
        <FloatingElement delay={1} duration={7} className="absolute top-[20%] right-[20%]">
          <span className="text-yellow-300/20 text-2xl">&#10022;</span>
        </FloatingElement>
        <FloatingElement delay={2} duration={5} className="absolute top-[60%] left-[10%]">
          <span className="text-amber-400/25 text-4xl">&#9733;</span>
        </FloatingElement>
        <FloatingElement delay={0.5} duration={8} className="absolute top-[70%] right-[15%]">
          <span className="text-yellow-500/20 text-2xl">&#10022;</span>
        </FloatingElement>
        <FloatingElement delay={3} duration={6} className="absolute top-[40%] left-[80%]">
          <span className="text-amber-300/20 text-3xl">&#9733;</span>
        </FloatingElement>
        <FloatingElement delay={1.5} duration={7} className="absolute top-[85%] left-[50%]">
          <span className="text-yellow-400/15 text-2xl">&#10022;</span>
        </FloatingElement>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        <div className="flex justify-center mb-4">
          <LanguageToggle />
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="font-[family-name:var(--font-cinzel)] text-5xl sm:text-7xl font-bold text-glow-gold-strong mb-2"
          style={{
            background: 'linear-gradient(135deg, #f5d060, #d4a017, #f5d060)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('welcome.title')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-[family-name:var(--font-cinzel)] text-xl sm:text-2xl text-amber-200/80 mb-12 tracking-wide"
        >
          {t('welcome.subtitle')}
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-48 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mb-12"
        />

        {/* Form area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          <AnimatePresence mode="wait">
            {step === 'name' ? (
              <motion.form
                key="name-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleNameSubmit}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="w-full">
                  <label
                    htmlFor="firstName"
                    className="block text-amber-200/70 text-lg mb-3 font-[family-name:var(--font-cinzel)]"
                  >
                    {t('welcome.nameLabel')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setError('');
                    }}
                    placeholder={t('welcome.namePlaceholder')}
                    className="magical-input w-full px-6 py-4 rounded-xl text-xl text-amber-50 font-[family-name:var(--font-lora)] text-center"
                    autoComplete="off"
                    autoFocus
                    disabled={isSubmitting}
                    maxLength={30}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-amber-400 text-base"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <MagicalButton
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !firstName.trim()}
                  className="font-[family-name:var(--font-cinzel)] text-lg tracking-wider"
                >
                  {isSubmitting ? t('welcome.submitting') : t('welcome.submit')}
                </MagicalButton>
              </motion.form>
            ) : (
              <motion.form
                key="pin-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePinSubmit}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="w-full">
                  <label
                    htmlFor="pin"
                    className="block text-amber-200/70 text-lg mb-3 font-[family-name:var(--font-cinzel)]"
                  >
                    {isNewUser ? t('welcome.pinLabelNew') : t('welcome.pinLabelReturning')}
                  </label>
                  <input
                    id="pin"
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{4}"
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPin(val);
                      setError('');
                    }}
                    placeholder={t('welcome.pinPlaceholder')}
                    className="magical-input w-full px-6 py-4 rounded-xl text-3xl text-amber-50 font-[family-name:var(--font-lora)] text-center tracking-[0.5em]"
                    autoComplete="off"
                    autoFocus
                    disabled={isSubmitting}
                    maxLength={4}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-amber-400 text-base"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 items-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="text-amber-200/60 hover:text-amber-200 transition-colors font-[family-name:var(--font-cinzel)]"
                  >
                    {t('welcome.back')}
                  </button>
                  <div className="relative">
                    {showSparkles && <SparkleEffect />}
                    <MagicalButton
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || pin.length !== 4}
                      className="font-[family-name:var(--font-cinzel)] text-lg tracking-wider"
                    >
                      {isSubmitting ? t('welcome.submitting') : t('welcome.submit')}
                    </MagicalButton>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom flavor text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-12 text-amber-200/40 text-sm italic max-w-xs"
        >
          &quot;{t('welcome.quote')}&quot;
          <br />
          <span className="text-amber-200/30">{t('welcome.quoteAuthor')}</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
