"use client"

import Lottie from 'lottie-react'
import notfound from "@/animations/404 Page Not Found.json"
import React from 'react'

export default function NotFound() {
  return (
    <main className='container mx-auto flex justify-center items-center w-full'>
        <Lottie
      animationData={notfound}
      loop
      className="w-160 h-160"
    />

    </main>
  )
}
