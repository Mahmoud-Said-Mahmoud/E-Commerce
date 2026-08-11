import React from 'react'

export async function BrandApi() {
  const res=await fetch((`/api/Brand`));
  const brand=await res.json()
  return brand
}
