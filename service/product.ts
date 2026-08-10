import React from 'react'

export async function productApi(id:number,page:number,brandId:number) {
  const res=await fetch((`/api/products?category=${id}&page=${page}&brandId=${brandId}`));
  const product=await res.json()

<<<<<<< HEAD
    // console.log(product)
=======
>>>>>>> cebe80e (New Update)
  return product

}
