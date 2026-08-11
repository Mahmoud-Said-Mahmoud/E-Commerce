import React from 'react'

export async function productApi(id:number,page:number) {
  const res=await fetch((`/api/products?category=${id}&page=${page}`));
  const product=await res.json()


  return product

}
