import React from 'react'
import Header from '@/components/ui/Header'
import Hero from '@/components/ui/Hero'
import LogoTicker from '@/components/ui/LogoTicker'
import { Features } from '@/components/ui/Features'
import { Testimonials } from '@/components/ui/Testimonials'
import CallToAction from '@/components/ui/CallToAction'
import Footer from '@/components/ui/Footer'
const page = () => {
  return (
    <div className='min-h-screen w-full text-white antialiased bg-black'>
      <Header />
      <Hero />
      <LogoTicker />
      <Features />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  )
}



export default page